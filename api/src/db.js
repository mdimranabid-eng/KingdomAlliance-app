require('dotenv').config();
const mysql = require('mysql2/promise');

// ─────────────────────────────────────────────────────────────
// MySQL connection pool + schema bootstrap.
// Safe to call on every boot: CREATE TABLE IF NOT EXISTS +
// ADD COLUMN IF MISSING (so schema evolves without shell access).
// ─────────────────────────────────────────────────────────────

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Hostinger managed DBs can be slow to accept new conns
  connectTimeout: 20000,
  charset: 'utf8mb4',
});
pool.on('error', (err) => console.error('[db] pool error', err.message));

// Firestore-like helpers over JSON columns
function j(v) {
  return v === undefined || v === null ? null : JSON.stringify(v);
}
function pj(s, fallback) {
  if (s === null || s === undefined) return fallback;
  if (typeof s === 'object') return s; // mysql2 may return JSON columns pre-parsed
  try {
    return JSON.parse(s);
  } catch {
    return fallback;
  }
}

const TABLES = {
  // Full user profile: indexed columns for queries + `data` JSON blob mirrors
  // the original Firestore document so the client shim can serve any field.
  users: `CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY,
    email VARCHAR(191) UNIQUE,
    password_hash VARCHAR(100) NULL,
    full_name VARCHAR(191) DEFAULT '',
    photo_url VARCHAR(512) DEFAULT '',
    auth_provider VARCHAR(32) DEFAULT 'email',
    role VARCHAR(32) DEFAULT 'user',
    approval_status VARCHAR(32) DEFAULT 'incomplete',
    onboarding_complete TINYINT(1) DEFAULT 0,
    email_verified TINYINT(1) DEFAULT 0,
    is_suspended TINYINT(1) DEFAULT 0,
    is_banned TINYINT(1) DEFAULT 0,
    gender VARCHAR(32) DEFAULT '',
    age INT DEFAULT 0,
    dob VARCHAR(32) DEFAULT '',
    city VARCHAR(120) DEFAULT '',
    country VARCHAR(120) DEFAULT '',
    marital_status VARCHAR(64) DEFAULT '',
    profession VARCHAR(120) DEFAULT '',
    denomination VARCHAR(120) DEFAULT '',
    last_active_at DATETIME NULL,
    last_login_at DATETIME NULL,
    status VARCHAR(32) DEFAULT 'active',
    data JSON NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_approval (approval_status),
    INDEX idx_users_gender_age (gender, age),
    INDEX idx_users_last_active (last_active_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  admins: `CREATE TABLE IF NOT EXISTS admins (
    id CHAR(36) PRIMARY KEY,
    email VARCHAR(191) NOT NULL,
    email_verified TINYINT(1) DEFAULT 1,
    permissions JSON NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_admins_email (email)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  sessions: `CREATE TABLE IF NOT EXISTS sessions (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    refresh_token_hash CHAR(64) NOT NULL,
    user_agent VARCHAR(255) DEFAULT '',
    expires_at DATETIME NOT NULL,
    revoked TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_sessions_user (user_id),
    INDEX idx_sessions_rt (refresh_token_hash)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // Server-generated OTPs (hashed). Clients never read this table.
  otps: `CREATE TABLE IF NOT EXISTS otps (
    email VARCHAR(191) NOT NULL,
    purpose VARCHAR(32) NOT NULL,
    code_hash CHAR(64) NOT NULL,
    attempts INT DEFAULT 0,
    expires_at DATETIME NOT NULL,
    last_sent_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (email, purpose)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  otp_requests_log: `CREATE TABLE IF NOT EXISTS otp_requests_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(191) NOT NULL,
    purpose VARCHAR(32) NOT NULL,
    ip VARCHAR(64) DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_otp_requests (email, purpose, created_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  verification_tokens: `CREATE TABLE IF NOT EXISTS verification_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    token_hash CHAR(64) NOT NULL,
    purpose VARCHAR(32) NOT NULL,
    used TINYINT(1) DEFAULT 0,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_vt_user (user_id, purpose),
    INDEX idx_vt_hash (token_hash)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  interests: `CREATE TABLE IF NOT EXISTS interests (
    id CHAR(36) PRIMARY KEY,
    from_uid CHAR(36) NOT NULL,
    to_uid CHAR(36) NOT NULL,
    status VARCHAR(32) DEFAULT 'pending',
    message TEXT NULL,
    data JSON NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_interests_pair (from_uid, to_uid),
    INDEX idx_interests_to (to_uid, status),
    INDEX idx_interests_from (from_uid, status)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  shortlists: `CREATE TABLE IF NOT EXISTS shortlists (
    id CHAR(36) PRIMARY KEY,
    owner_uid CHAR(36) NOT NULL,
    target_uid CHAR(36) NOT NULL,
    data JSON NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_shortlists_pair (owner_uid, target_uid),
    INDEX idx_shortlists_owner (owner_uid)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  blocked: `CREATE TABLE IF NOT EXISTS blocked (
    id CHAR(36) PRIMARY KEY,
    blocker_uid CHAR(36) NOT NULL,
    blocked_uid CHAR(36) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_blocked_pair (blocker_uid, blocked_uid),
    INDEX idx_blocked_blocker (blocker_uid)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  chats: `CREATE TABLE IF NOT EXISTS chats (
    id VARCHAR(80) PRIMARY KEY,
    user_a CHAR(36) NOT NULL,
    user_b CHAR(36) NOT NULL,
    last_message_preview VARCHAR(255) DEFAULT '',
    last_message_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_chats_a (user_a),
    INDEX idx_chats_b (user_b),
    INDEX idx_chats_last (last_message_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  messages: `CREATE TABLE IF NOT EXISTS messages (
    id CHAR(36) PRIMARY KEY,
    chat_id VARCHAR(80) NOT NULL,
    sender_uid CHAR(36) NOT NULL,
    text TEXT,
    data JSON NULL,
    read_at TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_messages_chat (chat_id, created_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  typing: `CREATE TABLE IF NOT EXISTS typing (
    chat_id VARCHAR(80) NOT NULL,
    uid CHAR(36) NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (chat_id, uid)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  notifications: `CREATE TABLE IF NOT EXISTS notifications (
    id CHAR(36) PRIMARY KEY,
    uid CHAR(36) NOT NULL,
    type VARCHAR(64) DEFAULT '',
    title VARCHAR(191) DEFAULT '',
    body TEXT NULL,
    actor_id CHAR(36) NULL,
    target_id CHAR(36) NULL,
    data JSON NULL,
    read_at TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_notifications_uid (uid, created_at),
    INDEX idx_notifications_unread (uid, read_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  photo_moderation: `CREATE TABLE IF NOT EXISTS photo_moderation (
    id CHAR(36) PRIMARY KEY,
    uid CHAR(36) NOT NULL,
    photo_url VARCHAR(512) NOT NULL DEFAULT '',
    status VARCHAR(32) DEFAULT 'pending',
    reason TEXT NULL,
    data JSON NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_pm_status (status),
    INDEX idx_pm_uid (uid)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  profile_views: `CREATE TABLE IF NOT EXISTS profile_views (
    id CHAR(36) PRIMARY KEY,
    viewer_uid CHAR(36) NOT NULL,
    viewed_uid CHAR(36) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_pv_viewed (viewed_uid, created_at),
    INDEX idx_pv_viewer (viewer_uid, created_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  churches: `CREATE TABLE IF NOT EXISTS churches (
    id VARCHAR(191) PRIMARY KEY,
    data JSON NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  contact_messages: `CREATE TABLE IF NOT EXISTS contact_messages (
    id CHAR(36) PRIMARY KEY,
    data JSON NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // Generic fallback for collections without dedicated tables.
  // `coll` stores the FULL collection path (e.g. 'interests', 'chats/{id}/messages')
  // so nested subcollections and collection-group queries work uniformly.
  coll_store: `CREATE TABLE IF NOT EXISTS coll_store (
    coll VARCHAR(191) NOT NULL,
    id VARCHAR(191) NOT NULL,
    owner_uid CHAR(36) NULL,
    data JSON NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (coll, id),
    INDEX idx_coll_owner (coll, owner_uid),
    INDEX idx_coll_updated (coll, updated_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // Presence replaces Firebase RTDB status/{uid} + .info/connected.
  presence: `CREATE TABLE IF NOT EXISTS presence (
    uid CHAR(36) PRIMARY KEY,
    state VARCHAR(32) DEFAULT 'offline',
    will JSON NULL,
    last_seen DATETIME NOT NULL,
    last_changed DATETIME DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  settings: `CREATE TABLE IF NOT EXISTS settings (
    id VARCHAR(64) PRIMARY KEY,
    data JSON NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  email_log: `CREATE TABLE IF NOT EXISTS email_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(191) NOT NULL,
    template VARCHAR(64) DEFAULT '',
    ok TINYINT(1) DEFAULT 0,
    error TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  user_deletions: `CREATE TABLE IF NOT EXISTS user_deletions (
    uid CHAR(36) PRIMARY KEY,
    scheduled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    purge_after DATETIME NOT NULL,
    executed TINYINT(1) DEFAULT 0
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  uploaded_files: `CREATE TABLE IF NOT EXISTS uploaded_files (
    path VARCHAR(255) PRIMARY KEY,
    mime_type VARCHAR(64) NOT NULL DEFAULT 'image/jpeg',
    content LONGBLOB NOT NULL,
    size INT NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
};

// Columns added later — appended with ensureColumns on boot (no ALTER risk):
const EXTRA_COLUMNS = {
  users: [
    ['fcm_tokens', "JSON NULL"],
    ['ministry_role', "VARCHAR(120) DEFAULT ''"],
    ['totp_secret', "VARCHAR(64) DEFAULT ''"],
    ['totp_enabled', "TINYINT(1) DEFAULT 0"],
    ['auth_provider', "VARCHAR(32) DEFAULT 'email'"],
    ['email_verified', "TINYINT(1) DEFAULT 0"],
    ['is_approved', "TINYINT(1) DEFAULT 0"],
    ['deletion_status', "VARCHAR(32) DEFAULT ''"],
    ['scheduled_deletion_at', "DATETIME NULL"],
    ['last_active_at', "DATETIME NULL"],
    ['last_login_at', "DATETIME NULL"],
  ],
  admins: [
    ['data', "JSON NULL"],
  ],
};

let schemaReady = false;

async function ensureColumns() {
  for (const [table, cols] of Object.entries(EXTRA_COLUMNS)) {
    const [rows] = await pool.query(`SHOW COLUMNS FROM ${table}`);
    const existing = new Set(rows.map((r) => r.Field));
    for (const [name, def] of cols) {
      if (!existing.has(name)) {
        await pool.query(`ALTER TABLE ${table} ADD COLUMN ${name} ${def}`);
        console.log(`[db] added column ${table}.${name}`);
      }
    }
  }
}

async function bootstrapSchema() {
  if (schemaReady) return;
  for (const [name, ddl] of Object.entries(TABLES)) {
    await pool.query(ddl);
  }
  await ensureColumns();
  schemaReady = true;
  console.log('[db] schema ready');
}

// Run once at boot, but don't crash the process if DB is temporarily down
async function initDb() {
  try {
    await bootstrapSchema();
    return true;
  } catch (err) {
    console.error('[db] bootstrap failed (will retry on first request):', err.message);
    return false;
  }
}

const withReady = (() => {
  let pending = null;
  return () => {
    if (!pending) pending = initDb();
    return pending;
  };
})();

module.exports = {
  pool,
  j,
  pj,
  bootstrapSchema,
  initDb,
  withReady,
  SCHEMA_READY: () => schemaReady,
};

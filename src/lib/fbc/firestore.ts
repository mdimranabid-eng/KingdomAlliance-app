// Firestore SDK compatibility layer backed by the Node/MySQL REST API.
import { request } from './api';

// ── Timestamp ─────────────────────────────────────────────────────────────────
export class Timestamp {
  readonly seconds: number;
  readonly nanoseconds: number;
  constructor(seconds: number, nanoseconds: number) {
    this.seconds = seconds;
    this.nanoseconds = nanoseconds;
  }
  toDate(): Date { return new Date(this.seconds * 1000 + Math.floor(this.nanoseconds / 1e6)); }
  toMillis(): number { return this.seconds * 1000 + this.nanoseconds / 1e6; }
  isEqual(other: any): boolean {
    return other instanceof Timestamp && other.toMillis() === this.toMillis();
  }
  valueOf(): number { return this.toMillis(); }
  toJSON(): any { return { seconds: this.seconds, nanoseconds: this.nanoseconds }; }
  static now(): Timestamp { return Timestamp.fromMillis(Date.now()); }
  static fromDate(d: Date): Timestamp { return Timestamp.fromMillis(d.getTime()); }
  static fromMillis(n: number): Timestamp {
    return new Timestamp(Math.floor(n / 1000), Math.round((n % 1000) * 1e6));
  }
}

// ── Field sentinels (serialized to marker objects the API understands) ────────
const ST = { __st: 1 };
export const serverTimestamp = () => ST as any;
export const deleteField = () => ({ __df: 1 }) as any;
export const arrayUnion = (...values: any[]) => ({ __au: values }) as any;
export const arrayRemove = (...values: any[]) => ({ __ar: values }) as any;
export const increment = (n: number) => ({ __inc: n }) as any;

const isTs = (v: any) => v instanceof Timestamp;
const isSentinel = (v: any) => !!v && typeof v === 'object' && !Array.isArray(v) &&
  ('__st' in v || '__df' in v || '__au' in v || '__ar' in v || '__inc' in v || '__ts' in v);

// Timestamp → {__ts}; rehydrate {__ts} → Timestamp (round trip)
export function serialize(value: any): any {
  if (isTs(value)) return { __ts: value.toMillis() };
  if (value instanceof Date) return { __ts: value.getTime() };
  if (isSentinel(value)) return value;
  if (Array.isArray(value)) return value.map(serialize);
  if (value && typeof value === 'object') {
    const out: any = {};
    for (const k of Object.keys(value)) out[k] = serialize(value[k]);
    return out;
  }
  return value;
}

export function rehydrate(value: any): any {
  if (value && typeof value === 'object' && !Array.isArray(value) && typeof value.__ts === 'number') {
    return Timestamp.fromMillis(value.__ts);
  }
  if (Array.isArray(value)) return value.map(rehydrate);
  if (value && typeof value === 'object') {
    const out: any = {};
    for (const k of Object.keys(value)) out[k] = rehydrate(value[k]);
    return out;
  }
  return value;
}

// ── References ────────────────────────────────────────────────────────────────
export interface DocRef { kind: 'doc'; collPath: string; id: string; path: string; }
export interface CollRef { kind: 'coll'; collPath: string; collectionGroup: boolean; }

export const getFirestore = (_app?: any) => ({ __fs: true }) as any;

export function doc(dbOrColl: any, ...segs: string[]): DocRef {
  const parts = segs.filter((s) => typeof s === 'string' && s.length);
  if (dbOrColl && typeof dbOrColl === 'object' && dbOrColl.kind === 'coll') {
    const id = parts[parts.length - 1];
    return { kind: 'doc', collPath: dbOrColl.collPath, id, path: `${dbOrColl.collPath}/${id}` };
  }
  if (dbOrColl && typeof dbOrColl === 'object' && dbOrColl.kind === 'doc') {
    // doc(docRef, 'subcoll', id)
    const all = [...dbOrColl.collPath.split('/'), dbOrColl.id, ...parts];
    const id = all.pop() as string;
    return { kind: 'doc', collPath: all.join('/'), id, path: `${all.join('/')}/${id}` };
  }
  // doc(db, 'users', uid) — plain segments
  const id = parts.pop() as string;
  const collPath = parts.join('/');
  return { kind: 'doc', collPath, id, path: `${collPath}/${id}` };
}

export function collection(dbOrDoc: any, ...segs: string[]): CollRef {
  let base: string[] = [];
  if (dbOrDoc && typeof dbOrDoc === 'object' && dbOrDoc.kind === 'coll') {
    base = dbOrDoc.collPath.split('/');
  } else if (dbOrDoc && typeof dbOrDoc === 'object' && dbOrDoc.kind === 'doc') {
    base = [...dbOrDoc.collPath.split('/'), dbOrDoc.id];
  }
  const extra = segs.filter((s) => typeof s === 'string' && s.length);
  const all = [...base, ...extra];
  return { kind: 'coll', collPath: all.join('/'), collectionGroup: false };
}

export function collectionGroup(_db: any, name: string): CollRef {
  return { kind: 'coll', collPath: name, collectionGroup: true };
}

// ── Query builders ────────────────────────────────────────────────────────────
export interface WhereFilter { field: string; op: string; value: any; }
export interface OrderBy { field: string; dir: 'asc' | 'desc'; }

export const where = (field: string, op: any, value: any): WhereFilter =>
  ({ field, op: String(op), value: serialize(value) }) as any;
export const orderBy = (field: string, dir: any = 'asc'): OrderBy =>
  ({ field, dir: dir === 'desc' ? 'desc' : 'asc' });
export const limit = (n: number) => ({ __limit: n });

// Composite filters: or(...) / and(...)
export const or = (...filters: any[]) => ({ __or: filters });
export const and = (...filters: any[]) => ({ __and: filters });

export interface FsQuery { collPath: string; collectionGroup: boolean; wheres: WhereFilter[]; orderBys: OrderBy[]; limitTo?: number; }

function normalizeFilter(c: any): any {
  if (!c) return c;
  if (c.__or) return { composite: 'or', filters: (c.__or || []).map(normalizeFilter) };
  if (c.__and) return { composite: 'and', filters: (c.__and || []).map(normalizeFilter) };
  if (c.composite) return { composite: c.composite, filters: (c.filters || []).map(normalizeFilter) };
  return c;
}

export function query(collOrQuery: any, ...constraints: any[]): FsQuery {
  const base: FsQuery = collOrQuery?.kind === 'coll'
    ? { collPath: collOrQuery.collPath, collectionGroup: !!collOrQuery.collectionGroup, wheres: [], orderBys: [] }
    : { ...collOrQuery, wheres: [...(collOrQuery.wheres || [])], orderBys: [...(collOrQuery.orderBys || [])] };
  for (const c of constraints) {
    if (!c) continue;
    if (c.__or || c.__and || c.composite) base.wheres.push(normalizeFilter(c));
    else if (c.field && c.op) base.wheres.push(c);
    else if (c.field && c.dir) base.orderBys.push(c);
    else if (typeof c.__limit === 'number') base.limitTo = c.__limit;
  }
  return base;
}


// ── Snapshots ─────────────────────────────────────────────────────────────────
export class DocumentSnapshot {
  readonly id: string;
  readonly ref: DocRef | null;
  private readonly _data: any;
  readonly metadata = { hasPendingWrites: false, fromCache: false, hasLocalMutations: false };
  constructor(id: string, data: any, ref?: DocRef) {
    this.id = id;
    this.ref = ref || null;
    this._data = data;
  }
  exists(): boolean { return this._data !== null && this._data !== undefined; }
  data(): any { return this._data ? rehydrate(this._data) : undefined; }
  get(field: string): any { return this.data()?.[field]; }
}

export class QuerySnapshot {
  readonly docs: DocumentSnapshot[];
  readonly metadata = { hasPendingWrites: false, fromCache: false };
  constructor(docs: DocumentSnapshot[]) { this.docs = docs; }
  get empty(): boolean { return this.docs.length === 0; }
  get size(): number { return this.docs.length; }
  forEach(cb: (d: DocumentSnapshot) => void): void { this.docs.forEach(cb); }
  docChanges(): { type: 'added' | 'modified' | 'removed'; doc: DocumentSnapshot }[] {
    return this.docs.map((d) => ({ type: 'added', doc: d }));
  }
  query: any = null;
}

const toSnap = (payload: any, ref?: DocRef) =>
  new DocumentSnapshot(payload.id, payload.exists === false ? null : payload.data, ref);

const queryBody = (q: FsQuery) => ({
  path: q.collPath.split('/'),
  collectionGroup: q.collectionGroup,
  wheres: q.wheres,
  orderBys: q.orderBys,
  limit: q.limitTo,
});

// ── Reads ─────────────────────────────────────────────────────────────────────
export async function getDoc(ref: DocRef): Promise<DocumentSnapshot> {
  const payload = await request<any>('GET', `/fs/${ref.collPath}/${ref.id}`);
  return toSnap(payload, ref);
}
export const getDocFromServer = getDoc;

export async function getDocs(q: FsQuery): Promise<QuerySnapshot> {
  const payload = await request<any>('POST', '/fs/query', queryBody(q));
  return new QuerySnapshot((payload.docs || []).map((d: any) => toSnap(d)));
}

// ── Writes ────────────────────────────────────────────────────────────────────
export async function setDoc(ref: DocRef, data: any, options?: { merge?: boolean }): Promise<void> {
  await request('PUT', `/fs/${ref.collPath}/${ref.id}`, { data: serialize(data), merge: !!options?.merge });
}

export async function updateDoc(ref: DocRef, patch: any): Promise<void> {
  await request('PATCH', `/fs/${ref.collPath}/${ref.id}`, serialize(patch));
}

export async function addDoc(coll: CollRef, data: any): Promise<{ id: string }> {
  const payload = await request<any>('POST', '/fs/add', { path: coll.collPath.split('/'), data: serialize(data) });
  return { id: payload.id };
}

export async function deleteDoc(ref: DocRef): Promise<void> {
  await request('DELETE', `/fs/${ref.collPath}/${ref.id}`);
}

// ── onSnapshot → polling watch ────────────────────────────────────────────────
const WATCH_INTERVAL_MS = 4000;

export function onSnapshot(
  refOrQuery: any,
  cb: (snap: any) => void,
  errCb?: (e: Error) => void
): () => void {
  let stopped = false;
  let lastSig: string | null = null;
  let timer: any = null;

  const isDoc = refOrQuery && refOrQuery.kind === 'doc';

  const poll = async () => {
    if (stopped) return;
    try {
      if (isDoc) {
        const payload = await request<any>('POST', '/fs/watch', { docPath: `${refOrQuery.collPath}/${refOrQuery.id}`.split('/') });
        const sig = payload.docs.length ? `${payload.docs[0].id}:${payload.docs[0].updatedMs}` : 'none';
        if (sig !== lastSig) {
          lastSig = sig;
          const d = payload.docs[0];
          cb(d ? toSnap(d, refOrQuery) : new DocumentSnapshot(refOrQuery.id, null, refOrQuery));
        }

      } else {
        const q: FsQuery = refOrQuery;
        const payload = await request<any>('POST', '/fs/watch', queryBody(q));
        const sig = (payload.docs || []).map((d: any) => `${d.id}:${d.updatedMs}`).join('|');
        if (sig !== lastSig) {
          lastSig = sig;
          cb(new QuerySnapshot((payload.docs || []).map((d: any) => toSnap(d))));
        }
      }
    } catch (e: any) {
      if (errCb) errCb(e instanceof Error ? e : new Error(String(e?.message || e)));
    }
    if (!stopped) timer = setTimeout(poll, WATCH_INTERVAL_MS);
  };
  poll();
  return () => { stopped = true; if (timer) clearTimeout(timer); };
}

// ── writeBatch / runTransaction ───────────────────────────────────────────────
export class WriteBatch {
  private ops: any[] = [];
  set(ref: DocRef, data: any, options?: { merge?: boolean }): WriteBatch {
    this.ops.push({ op: 'set', path: `${ref.collPath}/${ref.id}`.split('/'), data: serialize(data), merge: !!options?.merge });
    return this;
  }
  update(ref: DocRef, patch: any): WriteBatch {
    this.ops.push({ op: 'update', path: `${ref.collPath}/${ref.id}`.split('/'), data: serialize(patch) });
    return this;
  }
  delete(ref: DocRef): WriteBatch {
    this.ops.push({ op: 'delete', path: `${ref.collPath}/${ref.id}`.split('/') });
    return this;
  }
  async commit(): Promise<void> {
    if (this.ops.length) await request('POST', '/fs/batch', { ops: this.ops });
    this.ops = [];
  }
}
export const writeBatch = () => new WriteBatch();

export class Transaction {
  private ops: any[] = [];
  async get(ref: DocRef): Promise<DocumentSnapshot> { return getDoc(ref); }
  set(ref: DocRef, data: any, options?: { merge?: boolean }): Transaction {
    this.ops.push({ op: 'set', path: `${ref.collPath}/${ref.id}`.split('/'), data: serialize(data), merge: !!options?.merge });
    return this;
  }
  update(ref: DocRef, patch: any): Transaction {
    this.ops.push({ op: 'update', path: `${ref.collPath}/${ref.id}`.split('/'), data: serialize(patch) });
    return this;
  }
  delete(ref: DocRef): Transaction {
    this.ops.push({ op: 'delete', path: `${ref.collPath}/${ref.id}`.split('/') });
    return this;
  }
}

export async function runTransaction(fn: (tx: Transaction) => any): Promise<any> {
  const tx = new Transaction();
  const result = await fn(tx);
  if ((tx as any).ops.length) await request('POST', '/fs/transaction', { ops: (tx as any).ops });
  return result;
}

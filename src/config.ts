/**
 * KINGDOM ALLIANCE - MASTER CONFIGURATION
 * 
 * You can edit this file to change the branding, colors, and 
 * basic information of the website without touching the core code.
 */

export const CONFIG = {
  // --- SITE BRANDING ---
  siteName: "Kingdom Alliance",
  siteTagline: "Christian Matrimony Rooted in Faith & Values",
  
  // --- CONTACT INFORMATION ---
  supportEmail: "support@kingdomalliance.com",
  supportPhone: "+966 55 123 4567",
  officeAddress: "Riyadh, Saudi Arabia",

  // --- DESIGN & THEME ---
  theme: {
    primaryColor: "#6750A4", // Deep Purple
    secondaryColor: "#958DA5", // Soft Lavender
    accentColor: "#D0BCFE", // Light Purple
    fontFamily: "'Inter', sans-serif",
  },

  // --- FEATURE TOGGLES ---
  features: {
    enableChat: true,
    enableNotifications: false, // Set to true when ready
    enableBlog: false,
    requireAdminApproval: true,
  },

  // --- SOCIAL LINKS ---
  social: {
    facebook: "https://facebook.com/kingdomalliance",
    instagram: "https://instagram.com/kingdomalliance",
    twitter: "https://twitter.com/k_alliance",
  },

  // --- REGISTRATION SETTINGS ---
  minAge: 18,
  maxAge: 70,
  defaultCountryCode: "+966",

  // --- CLOUDINARY CONFIGURATION ---
  cloudinaryCloudName: (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dvmx7w1a8").trim(), 
  cloudinaryUploadPreset: (import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "kingdom_preset").trim(),
};

export default CONFIG;

import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const jummahSchedules = sqliteTable("jummah_schedules", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  fridayDate: text("friday_date").notNull().unique(),
  venue: text("venue").notNull(),
  firstAdhan: text("first_adhan").notNull(),
  firstTalk: text("first_talk"),
  firstKhutbah: text("first_khutbah").notNull(),
  firstSalah: text("first_salah").notNull(),
  secondAdhan: text("second_adhan").notNull(),
  secondKhutbah: text("second_khutbah").notNull(),
  secondSalah: text("second_salah").notNull(),
  announcement: text("announcement").notNull().default(""),
  published: integer("published", { mode: "boolean" }).notNull().default(true),
  updatedBy: text("updated_by").notNull(),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const memberEmailHashes = sqliteTable("member_email_hashes", {
  emailHash: text("email_hash").primaryKey(),
  encryptedEmail: text("encrypted_email"),
  emailIv: text("email_iv"),
  academicYear: text("academic_year").notNull().default("2026/27"),
  expiresAt: integer("expires_at").notNull().default(1817074800000),
  addedAt: text("added_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const discountSecrets = sqliteTable("discount_secrets", {
  key: text("key").primaryKey(),
  encryptedValue: text("encrypted_value").notNull(),
  iv: text("iv").notNull(),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const otpChallenges = sqliteTable("otp_challenges", {
  id: text("id").primaryKey(),
  emailHash: text("email_hash").notNull(),
  ipHash: text("ip_hash").notNull(),
  codeHash: text("code_hash").notNull(),
  expiresAt: integer("expires_at").notNull(),
  attempts: integer("attempts").notNull().default(0),
  used: integer("used", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at").notNull(),
}, table => [
  index("idx_otp_email_created").on(table.emailHash, table.createdAt),
  index("idx_otp_ip_created").on(table.ipHash, table.createdAt),
  index("idx_otp_expires").on(table.expiresAt),
]);

export const walletMembershipPasses = sqliteTable("wallet_membership_passes", {
  emailHash: text("email_hash").primaryKey(),
  objectId: text("object_id").notNull().unique(),
  membershipId: text("membership_id").unique(),
  encryptedName: text("encrypted_name").notNull(),
  nameIv: text("name_iv").notNull(),
  academicYear: text("academic_year").notNull().default("2026/27"),
  expiresAt: integer("expires_at").notNull().default(1817074800000),
  status: text("status").notNull().default("ACTIVE"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const adminLoginAttempts = sqliteTable("admin_login_attempts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ipHash: text("ip_hash").notNull(),
  attemptedAt: integer("attempted_at").notNull(),
}, table => [
  index("idx_admin_login_ip_time").on(table.ipHash, table.attemptedAt),
]);

export const adminLoginBlocks = sqliteTable("admin_login_blocks", {
  ipHash: text("ip_hash").primaryKey(),
  blockedUntil: integer("blocked_until").notNull(),
  level: integer("level").notNull().default(1),
});

import { bigint, boolean, index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

// Millisecond epoch values are stored as bigint and read back as JS numbers.
// RLS is enabled with no policies: the app connects as the database owner, and
// Supabase's public REST API (anon/authenticated roles) cannot read these tables.
const epochMs = (name: string) => bigint(name, { mode: "number" });
const updatedTimestamp = (name: string) => timestamp(name, { withTimezone: true, mode: "string" }).notNull().defaultNow();

export const jummahSchedules = pgTable("jummah_schedules", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
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
  published: boolean("published").notNull().default(true),
  updatedBy: text("updated_by").notNull(),
  updatedAt: updatedTimestamp("updated_at"),
}).enableRLS();

// Maintained by the committee in the Supabase Table Editor (or CSV import).
// Sign-in is through Supabase Auth; lib/members.ts checks emails case-insensitively.
export const members = pgTable("members", {
  email: text("email").primaryKey(),
  fullName: text("full_name").notNull(),
  addedAt: timestamp("added_at", { withTimezone: true, mode: "string" }).defaultNow(),
}).enableRLS();

export const discountSecrets = pgTable("discount_secrets", {
  key: text("key").primaryKey(),
  encryptedValue: text("encrypted_value").notNull(),
  iv: text("iv").notNull(),
  updatedAt: updatedTimestamp("updated_at"),
}).enableRLS();

// `member_email` (lowercase) links a pass to its `members` row, so deleting the
// member makes the pass fail verification.
export const walletMembershipPasses = pgTable("wallet_membership_passes", {
  emailHash: text("email_hash").primaryKey(),
  memberEmail: text("member_email"),
  objectId: text("object_id").notNull().unique(),
  membershipId: text("membership_id").unique(),
  encryptedName: text("encrypted_name").notNull(),
  nameIv: text("name_iv").notNull(),
  academicYear: text("academic_year").notNull().default("2026/27"),
  expiresAt: epochMs("expires_at").notNull().default(1817074800000),
  status: text("status").notNull().default("ACTIVE"),
  createdAt: updatedTimestamp("created_at"),
}).enableRLS();

export const adminLoginAttempts = pgTable("admin_login_attempts", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  ipHash: text("ip_hash").notNull(),
  attemptedAt: epochMs("attempted_at").notNull(),
}, table => [
  index("idx_admin_login_ip_time").on(table.ipHash, table.attemptedAt),
]).enableRLS();

export const adminLoginBlocks = pgTable("admin_login_blocks", {
  ipHash: text("ip_hash").primaryKey(),
  blockedUntil: epochMs("blocked_until").notNull(),
  level: integer("level").notNull().default(1),
}).enableRLS();

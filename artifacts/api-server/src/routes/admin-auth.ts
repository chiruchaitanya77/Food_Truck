import { Router } from "express";
import bcrypt from "bcrypt";
import { db, adminUsersTable, menuItemsTable, stopwatchWinnersTable, userSubmissionsTable, festivalDiscountsTable, analyticsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { signToken, requireAuth } from "../lib/auth.js";

const router = Router();

const DEFAULT_ADMIN_EMAIL = "admin@shakecrazy.com";
const DEFAULT_ADMIN_PASS = "ShakeCrazy2025!";

async function ensureAdminExists() {
  const existing = await db.select().from(adminUsersTable).where(eq(adminUsersTable.email, DEFAULT_ADMIN_EMAIL)).limit(1);
  if (existing.length === 0) {
    const hash = await bcrypt.hash(DEFAULT_ADMIN_PASS, 12);
    await db.insert(adminUsersTable).values({ email: DEFAULT_ADMIN_EMAIL, passwordHash: hash });
    console.log("Default admin created:", DEFAULT_ADMIN_EMAIL);
  }
}

ensureAdminExists().catch(console.error);

router.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email and password required" });
      return;
    }
    const [admin] = await db.select().from(adminUsersTable).where(eq(adminUsersTable.email, email)).limit(1);
    if (!admin) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const token = signToken({ email: admin.email, id: admin.id });
    res.json({ token, email: admin.email });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/stats", requireAuth, async (_req, res) => {
  try {
    const [visits, menu, winners, allSubs, pendingSubs, discounts] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(analyticsTable),
      db.select({ count: sql<number>`count(*)` }).from(menuItemsTable),
      db.select({ count: sql<number>`count(*)` }).from(stopwatchWinnersTable),
      db.select({ count: sql<number>`count(*)` }).from(userSubmissionsTable),
      db.select({ count: sql<number>`count(*)` }).from(userSubmissionsTable).where(eq(userSubmissionsTable.approved, false)),
      db.select({ count: sql<number>`count(*)` }).from(festivalDiscountsTable).where(eq(festivalDiscountsTable.isActive, true)),
    ]);

    res.json({
      totalVisits: Number(visits[0]?.count ?? 0),
      totalMenuItems: Number(menu[0]?.count ?? 0),
      totalWinners: Number(winners[0]?.count ?? 0),
      totalSubmissions: Number(allSubs[0]?.count ?? 0),
      pendingSubmissions: Number(pendingSubs[0]?.count ?? 0),
      activeDiscounts: Number(discounts[0]?.count ?? 0),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

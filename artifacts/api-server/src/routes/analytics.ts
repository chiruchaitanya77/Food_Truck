import { Router } from "express";
import { db, analyticsTable } from "@workspace/db";
import { sql, desc } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";

const router = Router();

router.post("/analytics/track", async (req, res) => {
  try {
    const { visitorIp, country, city, userAgent, page } = req.body;
    await db.insert(analyticsTable).values({
      visitorIp: visitorIp || req.ip || "unknown",
      country, city, userAgent, page,
    });
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.json({ success: false });
  }
});

router.get("/admin/analytics", requireAuth, async (_req, res) => {
  try {
    const totalResult = await db.select({ count: sql<number>`count(*)` }).from(analyticsTable);
    const totalVisits = Number(totalResult[0]?.count ?? 0);

    const todayResult = await db.select({ count: sql<number>`count(*)` }).from(analyticsTable)
      .where(sql`DATE(visited_at) = CURRENT_DATE`);
    const todayVisits = Number(todayResult[0]?.count ?? 0);

    const cityRows = await db.select({ city: analyticsTable.city, count: sql<number>`count(*)` })
      .from(analyticsTable)
      .groupBy(analyticsTable.city)
      .orderBy(desc(sql`count(*)`))
      .limit(10);

    const recentRows = await db.select().from(analyticsTable)
      .orderBy(desc(analyticsTable.visitedAt))
      .limit(20);

    res.json({
      totalVisits,
      todayVisits,
      topCities: cityRows.map(r => ({ city: r.city || "Unknown", count: Number(r.count) })),
      recentVisits: recentRows.map(r => ({
        visitorIp: r.visitorIp,
        country: r.country ?? null,
        city: r.city ?? null,
        visitedAt: r.visitedAt.toISOString(),
        page: r.page ?? null,
      })),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

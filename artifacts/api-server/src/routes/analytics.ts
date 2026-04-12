import { Router } from "express";
import { db, analyticsTable } from "@workspace/db";
import { sql, desc, gte } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";
import {getRealIp, resolveLocation} from "../lib/geoip.js";

const router = Router();

// Public: track a page visit — IP and geo are resolved server-side
router.post("/analytics/track", async (req, res) => {
  try {
    const ip = getRealIp(req);
    const { userAgent, page, latitude, longitude } = req.body;

    // Geolocate in background so we don't block the response
    res.json({ success: true });

    resolveLocation(ip, latitude, longitude).then(geo => {
      db.insert(analyticsTable).values({
        visitorIp: ip,
        country: geo.country ?? null,
        city: geo.city ?? null,
        latitude: typeof latitude === "number" ? latitude : null,
        longitude: typeof longitude === "number" ? longitude : null,
        userAgent: userAgent || req.headers["user-agent"] || null,
        page: page || "/",
      }).catch(console.error);
    });
  } catch (e) {
    console.error(e);
    res.json({ success: false });
  }
});

// Public: total visitor count (for footer)
router.get("/analytics/count", async (_req, res) => {
  try {
    const [result] = await db.select({ count: sql<number>`count(*)` }).from(analyticsTable);
    res.json({ totalVisits: Number(result?.count ?? 0) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin: full analytics data
router.get("/admin/analytics", requireAuth, async (_req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [totalResult, todayResult, weekResult, uniqueResult] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(analyticsTable),
      db.select({ count: sql<number>`count(*)` }).from(analyticsTable)
          .where(sql`DATE(visited_at) = CURRENT_DATE`),
      db.select({ count: sql<number>`count(*)` }).from(analyticsTable)
          .where(sql`visited_at >= NOW() - INTERVAL '7 days'`),
      db.select({ count: sql<number>`count(distinct visitor_ip)` }).from(analyticsTable),
    ]);

    // Daily visits for last 30 days
    const dailyRows = await db.select({
      date: sql<string>`DATE(visited_at)::text`,
      count: sql<number>`count(*)`,
    }).from(analyticsTable)
        .where(gte(analyticsTable.visitedAt, thirtyDaysAgo))
        .groupBy(sql`DATE(visited_at)`)
        .orderBy(sql`DATE(visited_at)`);

    // Top countries
    const countryRows = await db.select({
      country: analyticsTable.country,
      count: sql<number>`count(*)`,
    }).from(analyticsTable)
        .groupBy(analyticsTable.country)
        .orderBy(desc(sql`count(*)`))
        .limit(10);

    // Top cities
    const cityRows = await db.select({
      city: analyticsTable.city,
      country: analyticsTable.country,
      count: sql<number>`count(*)`,
    }).from(analyticsTable)
        .groupBy(analyticsTable.city, analyticsTable.country)
        .orderBy(desc(sql`count(*)`))
        .limit(10);

    // Top pages
    const pageRows = await db.select({
      page: analyticsTable.page,
      count: sql<number>`count(*)`,
    }).from(analyticsTable)
        .groupBy(analyticsTable.page)
        .orderBy(desc(sql`count(*)`))
        .limit(10);

    // Recent visits
    const recentRows = await db.select().from(analyticsTable)
        .orderBy(desc(analyticsTable.visitedAt))
        .limit(20);

    res.json({
      totalVisits: Number(totalResult[0]?.count ?? 0),
      todayVisits: Number(todayResult[0]?.count ?? 0),
      weekVisits: Number(weekResult[0]?.count ?? 0),
      uniqueVisitors: Number(uniqueResult[0]?.count ?? 0),
      dailyVisits: dailyRows.map(r => ({ date: r.date, count: Number(r.count) })),
      topCountries: countryRows.map(r => ({ country: r.country || "Unknown", count: Number(r.count) })),
      topCities: cityRows.map(r => ({ city: r.city || "Unknown", country: r.country || "", count: Number(r.count) })),
      topPages: pageRows.map(r => ({ page: r.page || "/", count: Number(r.count) })),
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

import { Router } from "express";
import { db, truckLocationTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";

const router = Router();

function formatLocation(l: typeof truckLocationTable.$inferSelect) {
  return {
    id: l.id,
    currentLocation: l.currentLocation,
    latitude: l.latitude ?? null,
    longitude: l.longitude ?? null,
    updatedAt: l.updatedAt.toISOString(),
    updatedBy: l.updatedBy ?? null,
  };
}

router.get("/location", async (_req, res) => {
  try {
    const [loc] = await db.select().from(truckLocationTable)
      .orderBy(desc(truckLocationTable.updatedAt))
      .limit(1);
    if (!loc) {
      res.json({
        id: 0,
        currentLocation: "Location not set yet. Check our Instagram @shakecrazyofficial",
        latitude: null,
        longitude: null,
        updatedAt: new Date().toISOString(),
        updatedBy: null,
      });
      return;
    }
    res.json(formatLocation(loc));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/admin/location", requireAuth, async (req, res) => {
  try {
    const { currentLocation, latitude, longitude } = req.body;
    const admin = (req as any).admin;
    const [loc] = await db.insert(truckLocationTable).values({
      currentLocation, latitude, longitude, updatedBy: admin.email,
    }).returning();
    res.json(formatLocation(loc));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

import { Router } from "express";
import { db, userSubmissionsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";
import {getRealIp, resolveLocation} from "../lib/geoip.js";

const router = Router();

function formatSubmission(s: typeof userSubmissionsTable.$inferSelect) {
  return {
    id: s.id,
    userName: s.userName,
    imageUrl: s.imageUrl ?? null,
    experienceText: s.experienceText,
    approved: s.approved,
    location: s.location ?? null,
    city: s.city ?? null,
    country: s.country ?? null,
    ipAddress: s.ipAddress ?? null,
    createdAt: s.createdAt.toISOString(),
  };
}

router.get("/submissions", async (_req, res) => {
  try {
    const items = await db.select().from(userSubmissionsTable)
      .where(eq(userSubmissionsTable.approved, true))
      .orderBy(desc(userSubmissionsTable.createdAt));
    res.json(items.map(formatSubmission));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/submissions", async (req, res) => {
  try {
    const { userName, imageUrl, experienceText, location, latitude, longitude } = req.body;
    if (!userName || !experienceText) {
      res.status(400).json({ error: "userName and experienceText are required" });
      return;
    }
    const ip = getRealIp(req);

    // Geolocate IP
    const geo = await   resolveLocation(ip, latitude, longitude);

    const locationStr = location || [geo.city, geo.country].filter(Boolean).join(", ") || null;

    const [s] = await db.insert(userSubmissionsTable).values({
      userName,
      imageUrl: imageUrl || null,
      experienceText,
      location: locationStr,
      city: geo.city,
      country: geo.country,
      latitude: typeof latitude === "number" ? latitude : null,
      longitude: typeof longitude === "number" ? longitude : null,
      ipAddress: ip,
      approved: false,
    }).returning();
    res.status(201).json(formatSubmission(s));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/submissions", requireAuth, async (_req, res) => {
  try {
    const items = await db.select().from(userSubmissionsTable)
      .orderBy(desc(userSubmissionsTable.createdAt));
    res.json(items.map(formatSubmission));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/admin/submissions/:id/approve", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { approved } = req.body;
    const [s] = await db.update(userSubmissionsTable).set({ approved })
      .where(eq(userSubmissionsTable.id, id)).returning();
    if (!s) { res.status(404).json({ error: "Not found" }); return; }
    res.json(formatSubmission(s));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/admin/submissions/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const [deleted] = await db
        .delete(userSubmissionsTable)
        .where(eq(userSubmissionsTable.id, id))
        .returning();

    if (!deleted) {
      return res.status(404).json({ error: "Not found" });
    }

    res.json({ message: "Submission deleted successfully" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

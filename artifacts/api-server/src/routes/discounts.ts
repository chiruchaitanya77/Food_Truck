import { Router } from "express";
import { db, festivalDiscountsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";

const router = Router();

function formatDiscount(d: typeof festivalDiscountsTable.$inferSelect) {
  return {
    id: d.id,
    name: d.name,
    discountPercentage: d.discountPercentage,
    isActive: d.isActive,
    isAuto: d.isAuto,
    startDate: d.startDate ?? null,
    endDate: d.endDate ?? null,
    posterUrl: d.posterUrl ?? null,
    createdAt: d.createdAt.toISOString(),
  };
}

function isAutoActive(d: typeof festivalDiscountsTable.$inferSelect): boolean {
  if (!d.isAuto) return d.isActive;
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const start = d.startDate;
  const end = d.endDate;
  if (start && end) return today >= start && today <= end;
  if (start) return today >= start;
  return d.isActive;
}

router.get("/discounts", async (_req, res) => {
  try {
    const all = await db.select().from(festivalDiscountsTable);
    const active = all.filter(isAutoActive);
    res.json(active.map(formatDiscount));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/discounts", requireAuth, async (_req, res) => {
  try {
    const all = await db.select().from(festivalDiscountsTable);
    res.json(all.map(formatDiscount));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/admin/discounts", requireAuth, async (req, res) => {
  try {
    const { name, discountPercentage, isActive, isAuto, startDate, endDate, posterUrl } = req.body;
    const [d] = await db.insert(festivalDiscountsTable).values({
      name, discountPercentage, isActive, isAuto, startDate, endDate, posterUrl,
    }).returning();
    res.status(201).json(formatDiscount(d));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/admin/discounts/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, discountPercentage, isActive, isAuto, startDate, endDate, posterUrl } = req.body;
    const [d] = await db.update(festivalDiscountsTable).set({
      name, discountPercentage, isActive, isAuto, startDate, endDate, posterUrl,
    }).where(eq(festivalDiscountsTable.id, id)).returning();
    if (!d) { res.status(404).json({ error: "Not found" }); return; }
    res.json(formatDiscount(d));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/admin/discounts/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(festivalDiscountsTable).where(eq(festivalDiscountsTable.id, id));
    res.json({ success: true, message: "Deleted" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

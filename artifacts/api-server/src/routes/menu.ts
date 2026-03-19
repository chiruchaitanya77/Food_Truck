import { Router } from "express";
import { db } from "@workspace/db";
import { menuItemsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";

const router = Router();

router.get("/menu", async (req, res) => {
  try {
    const { category, available_only } = req.query;
    let query = db.select().from(menuItemsTable);
    const items = await query;
    let filtered = items;
    if (category) filtered = filtered.filter(i => i.category === category);
    if (available_only === "true") filtered = filtered.filter(i => i.isAvailable);
    res.json(filtered.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      isVeg: item.isVeg,
      price: item.price,
      description: item.description,
      imageUrl: item.imageUrl,
      isAvailable: item.isAvailable,
      updatedAt: item.updatedAt.toISOString(),
    })));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/menu", requireAuth, async (_req, res) => {
  try {
    const items = await db.select().from(menuItemsTable);
    res.json(items.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      isVeg: item.isVeg,
      price: item.price,
      description: item.description,
      imageUrl: item.imageUrl,
      isAvailable: item.isAvailable,
      updatedAt: item.updatedAt.toISOString(),
    })));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/admin/menu", requireAuth, async (req, res) => {
  try {
    const { name, category, isVeg, price, description, imageUrl, isAvailable } = req.body;
    const [item] = await db.insert(menuItemsTable).values({
      name, category, isVeg: isVeg ?? false, price, description: description ?? "", imageUrl, isAvailable: isAvailable ?? true,
    }).returning();
    res.status(201).json({
      id: item.id, name: item.name, category: item.category, isVeg: item.isVeg,
      price: item.price, description: item.description, imageUrl: item.imageUrl,
      isAvailable: item.isAvailable, updatedAt: item.updatedAt.toISOString(),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/admin/menu/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, category, isVeg, price, description, imageUrl, isAvailable } = req.body;
    const [item] = await db.update(menuItemsTable).set({
      name, category, isVeg, price, description, imageUrl, isAvailable, updatedAt: new Date(),
    }).where(eq(menuItemsTable.id, id)).returning();
    if (!item) { res.status(404).json({ error: "Not found" }); return; }
    res.json({
      id: item.id, name: item.name, category: item.category, isVeg: item.isVeg,
      price: item.price, description: item.description, imageUrl: item.imageUrl,
      isAvailable: item.isAvailable, updatedAt: item.updatedAt.toISOString(),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/admin/menu/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(menuItemsTable).where(eq(menuItemsTable.id, id));
    res.json({ success: true, message: "Deleted" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

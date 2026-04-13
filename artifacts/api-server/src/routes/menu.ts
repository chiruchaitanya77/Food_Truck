// import { Router } from "express";
// import multer from "multer";
// import path from "path";
// // import { fileURLToPath } from "url";
// import fs from "fs";
// import { db } from "@workspace/db";
// import { menuItemsTable } from "@workspace/db";
// import { eq, ilike } from "drizzle-orm";
// import { requireAuth } from "../lib/auth.js";
//
// // const __filename = fileURLToPath(import.meta.url);
// // const __dirname = path.dirname(__filename);
// const __dirname = path.resolve();
// // const uploadsDir = path.join(__dirname, "..", "..", "uploads");
// const uploadsDir = path.join(__dirname, "uploads");
// if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
//
// const storage = multer.diskStorage({
//   destination: uploadsDir,
//   filename: (_req, file, cb) => {
//     const ext = path.extname(file.originalname);
//     cb(null, `menu_${Date.now()}${ext}`);
//   },
// });
// const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });
//
// const router = Router();
//
// function formatItem(item: typeof menuItemsTable.$inferSelect) {
//   return {
//     id: item.id,
//     name: item.name,
//     category: item.category,
//     isVeg: item.isVeg,
//     price: item.price,
//     description: item.description,
//     imageUrl: item.imageUrl,
//     isAvailable: item.isAvailable,
//     updatedAt: item.updatedAt.toISOString(),
//   };
// }
//
// router.get("/menu", async (req, res) => {
//   try {
//     const { category, available_only } = req.query;
//     let items = await db.select().from(menuItemsTable);
//     if (category) items = items.filter(i => i.category === category);
//     if (available_only === "true") items = items.filter(i => i.isAvailable);
//     res.json(items.map(formatItem));
//   } catch (e) {
//     console.error(e);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });
//
// router.get("/admin/menu", requireAuth, async (_req, res) => {
//   try {
//     const items = await db.select().from(menuItemsTable);
//     res.json(items.map(formatItem));
//   } catch (e) {
//     console.error(e);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });
//
// // Upload image for a menu item
// router.post("/admin/menu/upload-image", requireAuth, upload.single("image"), (req, res) => {
//   try {
//     if (!req.file) {
//       res.status(400).json({ error: "No file uploaded" });
//       return;
//     }
//     const protocol = req.protocol;
//     const host = req.get("host");
//     const imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
//     res.json({ imageUrl });
//   } catch (e) {
//     console.error(e);
//     res.status(500).json({ error: "Upload failed" });
//   }
// });
//
// router.post("/admin/menu", requireAuth, async (req, res) => {
//   try {
//     const { name, category, isVeg, price, description, imageUrl, isAvailable } = req.body;
//
//     // Duplicate check — prevent same name (case-insensitive) from being added
//     const existing = await db.select({ id: menuItemsTable.id })
//       .from(menuItemsTable)
//       .where(ilike(menuItemsTable.name, name.trim()))
//       .limit(1);
//
//     if (existing.length > 0) {
//       res.status(409).json({ error: `A menu item named "${name}" already exists. Please use a different name or edit the existing item.` });
//       return;
//     }
//
//     const [item] = await db.insert(menuItemsTable).values({
//       name: name.trim(),
//       category,
//       isVeg: isVeg ?? false,
//       price,
//       description: description ?? "",
//       imageUrl: imageUrl || null,
//       isAvailable: isAvailable ?? true,
//     }).returning();
//     res.status(201).json(formatItem(item));
//   } catch (e) {
//     console.error(e);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });
//
// router.put("/admin/menu/:id", requireAuth, async (req, res) => {
//   try {
//     const id = parseInt(req.params.id);
//     const { name, category, isVeg, price, description, imageUrl, isAvailable } = req.body;
//
//     // Duplicate check — allow same item to keep its own name but block collision with another item
//     const dupeCheck = await db.select({ id: menuItemsTable.id })
//       .from(menuItemsTable)
//       .where(ilike(menuItemsTable.name, name.trim()))
//       .limit(1);
//
//     if (dupeCheck.length > 0 && dupeCheck[0].id !== id) {
//       res.status(409).json({ error: `Another item named "${name}" already exists.` });
//       return;
//     }
//
//     const [item] = await db.update(menuItemsTable).set({
//       name: name.trim(), category, isVeg, price, description,
//       imageUrl: imageUrl || null, isAvailable, updatedAt: new Date(),
//     }).where(eq(menuItemsTable.id, id)).returning();
//     if (!item) { res.status(404).json({ error: "Not found" }); return; }
//     res.json(formatItem(item));
//   } catch (e) {
//     console.error(e);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });
//
// router.delete("/admin/menu/:id", requireAuth, async (req, res) => {
//   try {
//     const id = parseInt(req.params.id);
//     await db.delete(menuItemsTable).where(eq(menuItemsTable.id, id));
//     res.json({ success: true, message: "Deleted" });
//   } catch (e) {
//     console.error(e);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });
//
// export default router;



import { Router } from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import { db } from "@workspace/db";
import { menuItemsTable } from "@workspace/db";
import { eq, ilike } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// Multer → Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "menu-items",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const upload = multer({ storage });

const router = Router();

// ------------------ FORMAT ------------------
function formatItem(item: typeof menuItemsTable.$inferSelect) {
  return {
    id: item.id,
    name: item.name,
    category: item.category,
    isVeg: item.isVeg,
    price: item.price,
    description: item.description,
    imageUrl: item.imageUrl,
    isAvailable: item.isAvailable,
    updatedAt: item.updatedAt.toISOString(),
  };
}

// ------------------ PUBLIC MENU ------------------
router.get("/menu", async (req, res) => {
  try {
    const { category, available_only } = req.query;

    let items = await db.select().from(menuItemsTable);

    if (category) items = items.filter(i => i.category === category);
    if (available_only === "true") items = items.filter(i => i.isAvailable);

    res.json(items.map(formatItem));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------------ ADMIN MENU ------------------
router.get("/admin/menu", requireAuth, async (_req, res) => {
  try {
    const items = await db.select().from(menuItemsTable);
    res.json(items.map(formatItem));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------------ UPLOAD IMAGE ------------------
router.post(
    "/admin/menu/upload-image",
    requireAuth,
    upload.single("image"),
    (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ error: "No file uploaded" });
        }

        // Cloudinary URL
        const imageUrl = (req.file as any).path;

        res.json({ imageUrl });
      } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Upload failed" });
      }
    }
);

// ------------------ CREATE MENU ITEM ------------------
router.post("/admin/menu", requireAuth, async (req, res) => {
  try {
    const { name, category, isVeg, price, description, imageUrl, isAvailable } =
        req.body;

    const existing = await db
        .select({ id: menuItemsTable.id })
        .from(menuItemsTable)
        .where(ilike(menuItemsTable.name, name.trim()))
        .limit(1);

    if (existing.length > 0) {
      return res.status(409).json({
        error: `A menu item named "${name}" already exists.`,
      });
    }

    const [item] = await db
        .insert(menuItemsTable)
        .values({
          name: name.trim(),
          category,
          isVeg: isVeg ?? false,
          price,
          description: description ?? "",
          imageUrl: imageUrl || null,
          isAvailable: isAvailable ?? true,
        })
        .returning();

    res.status(201).json(formatItem(item));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------------ UPDATE ------------------
router.put("/admin/menu/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, category, isVeg, price, description, imageUrl, isAvailable } =
        req.body;

    const dupeCheck = await db
        .select({ id: menuItemsTable.id })
        .from(menuItemsTable)
        .where(ilike(menuItemsTable.name, name.trim()))
        .limit(1);

    if (dupeCheck.length > 0 && dupeCheck[0].id !== id) {
      return res.status(409).json({
        error: `Another item named "${name}" already exists.`,
      });
    }

    const [item] = await db
        .update(menuItemsTable)
        .set({
          name: name.trim(),
          category,
          isVeg,
          price,
          description,
          imageUrl: imageUrl || null,
          isAvailable,
          updatedAt: new Date(),
        })
        .where(eq(menuItemsTable.id, id))
        .returning();

    if (!item) return res.status(404).json({ error: "Not found" });

    res.json(formatItem(item));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------------ DELETE ------------------
router.delete("/admin/menu/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    await db.delete(menuItemsTable).where(eq(menuItemsTable.id, id));

    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

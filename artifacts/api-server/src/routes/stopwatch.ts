import { Router } from "express";
import { db, stopwatchWinnersTable, stopwatchAttemptsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";
import {getRealIp, resolveLocation} from "../lib/geoip.js";

const router = Router();

const WIN_TARGET = 10.0;
const WIN_TOLERANCE = 0.1;

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

router.get("/stopwatch/can-play", async (req, res) => {
  try {
    const ip = getRealIp(req);
    const today = getTodayDate();
    const existing = await db.select().from(stopwatchAttemptsTable)
      .where(and(eq(stopwatchAttemptsTable.ipAddress, ip), eq(stopwatchAttemptsTable.attemptDate, today)))
      .limit(1);
    if (existing.length > 0) {
      res.json({ canPlay: false, message: "You have already played today. Come back tomorrow!" });
    } else {
      res.json({ canPlay: true, message: "You can play!" });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/stopwatch/attempt", async (req, res) => {
  try {
    const { userName, timeStopped, latitude, longitude } = req.body;
    const ip = getRealIp(req);
    const today = getTodayDate();

    const existing = await db.select().from(stopwatchAttemptsTable)
      .where(and(eq(stopwatchAttemptsTable.ipAddress, ip), eq(stopwatchAttemptsTable.attemptDate, today)))
      .limit(1);

    if (existing.length > 0) {
      res.json({
        isWinner: false,
        timeStopped,
        message: "You have already played today. Come back tomorrow!",
        alreadyPlayed: true,
      });
      return;
    }

    await db.insert(stopwatchAttemptsTable).values({ ipAddress: ip, attemptDate: today });

    const diff = Math.abs(timeStopped - WIN_TARGET);
    const isWinner = diff <= WIN_TOLERANCE;

    if (isWinner) {
      // Geolocate in background — don't block the response
      resolveLocation(ip, latitude, longitude).then(geo => {
        db.insert(stopwatchWinnersTable).values({
          userName: userName || "Anonymous",
          timeStopped,
          prize: "Free Treat of your choice!",
          ipAddress: ip,
          city: geo.city,
          country: geo.country,
          latitude: typeof latitude === "number" ? latitude : null,
          longitude: typeof longitude === "number" ? longitude : null,
        }).catch(console.error);
      });
    }

    const message = isWinner
      ? `🎉 AMAZING! You stopped at ${timeStopped.toFixed(3)}s! You WIN a free treat!`
      : `You stopped at ${timeStopped.toFixed(3)}s. ${timeStopped < WIN_TARGET ? "Too fast!" : "Too slow!"} Try again tomorrow!`;

    res.json({ isWinner, timeStopped, message, alreadyPlayed: false });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/stopwatch/winners", async (_req, res) => {
  try {
    const limit = 10;
    const winners = await db.select().from(stopwatchWinnersTable)
      .orderBy(desc(stopwatchWinnersTable.createdAt))
      .limit(limit);
    res.json(winners.map(w => ({
      id: w.id,
      userName: w.userName,
      timeStopped: w.timeStopped,
      prize: w.prize,
      city: w.city,
      country: w.country,
      createdAt: w.createdAt.toISOString(),
    })));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/winners", requireAuth, async (_req, res) => {
  try {
    const winners = await db.select().from(stopwatchWinnersTable)
      .orderBy(desc(stopwatchWinnersTable.createdAt));
    res.json(winners.map(w => ({
      id: w.id,
      userName: w.userName,
      timeStopped: w.timeStopped,
      prize: w.prize,
      ipAddress: w.ipAddress,
      city: w.city,
      country: w.country,
      createdAt: w.createdAt.toISOString(),
    })));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

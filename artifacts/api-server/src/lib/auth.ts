import jwt from "jsonwebtoken";
import { type Request, type Response, type NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET || "shakecrazy-secret-2025";

export function signToken(payload: { email: string; id: number }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as { email: string; id: number };
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const token = auth.slice(7);
    const payload = verifyToken(token);
    (req as any).admin = payload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

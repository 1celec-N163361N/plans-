import { Request, Response, NextFunction } from "express";
import { db, sessionsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.session;
  if (!token) {
    res.status(401).json({ error: "غير مصرح" });
    return;
  }

  const session = await db.query.sessionsTable.findFirst({
    where: eq(sessionsTable.token, token),
  });

  if (!session || session.expiresAt < new Date()) {
    res.status(401).json({ error: "الجلسة منتهية" });
    return;
  }

  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.id, session.userId),
  });

  if (!user) {
    res.status(401).json({ error: "المستخدم غير موجود" });
    return;
  }

  (req as any).user = user;
  next();
}

export function getUser(req: Request) {
  return (req as any).user;
}

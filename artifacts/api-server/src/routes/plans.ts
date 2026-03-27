import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { db, plansTable, stopsTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, getUser } from "../lib/auth";

const router = Router();

const formatPlan = (plan: any) => ({
  id: plan.id,
  title: plan.title,
  description: plan.description || null,
  type: plan.type,
  status: plan.status,
  hasPassword: plan.hasPassword,
  shareToken: plan.shareToken || null,
  notes: plan.notes || null,
  activities: plan.activities || [],
  gearItems: plan.gearItems || [],
  scheduledAt: plan.scheduledAt ? plan.scheduledAt.toISOString() : null,
  userId: plan.userId,
  createdAt: plan.createdAt.toISOString(),
  updatedAt: plan.updatedAt.toISOString(),
});

const formatStop = (stop: any) => ({
  id: stop.id,
  planId: stop.planId,
  name: stop.name,
  notes: stop.notes || null,
  lat: stop.lat || null,
  lng: stop.lng || null,
  order: stop.order,
  createdAt: stop.createdAt.toISOString(),
});

router.get("/", requireAuth, async (req, res) => {
  try {
    const user = getUser(req);
    const plans = await db.query.plansTable.findMany({
      where: eq(plansTable.userId, user.id),
      orderBy: (p, { desc }) => [desc(p.updatedAt)],
    });
    res.json(plans.map(formatPlan));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const user = getUser(req);
    const { title, description, type, status, password, notes, scheduledAt } = req.body;
    if (!title || !type || !status) {
      res.status(400).json({ error: "الحقول المطلوبة مفقودة" });
      return;
    }

    let passwordHash: string | undefined;
    let hasPassword = false;
    if (password) {
      passwordHash = await bcrypt.hash(password, 12);
      hasPassword = true;
    }

    const [plan] = await db.insert(plansTable).values({
      userId: user.id,
      title,
      description: description || null,
      type,
      status,
      passwordHash: passwordHash || null,
      hasPassword,
      notes: notes || null,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
    }).returning();

    res.status(201).json(formatPlan(plan));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.get("/:id", requireAuth, async (req, res) => {
  try {
    const user = getUser(req);
    const plan = await db.query.plansTable.findFirst({
      where: and(eq(plansTable.id, req.params.id), eq(plansTable.userId, user.id)),
    });
    if (!plan) {
      res.status(404).json({ error: "الخطة غير موجودة" });
      return;
    }
    const stops = await db.query.stopsTable.findMany({
      where: eq(stopsTable.planId, plan.id),
      orderBy: (s, { asc }) => [asc(s.order)],
    });
    res.json({ ...formatPlan(plan), stops: stops.map(formatStop) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.put("/:id", requireAuth, async (req, res) => {
  try {
    const user = getUser(req);
    const plan = await db.query.plansTable.findFirst({
      where: and(eq(plansTable.id, req.params.id), eq(plansTable.userId, user.id)),
    });
    if (!plan) {
      res.status(404).json({ error: "الخطة غير موجودة" });
      return;
    }

    const { title, description, type, status, password, notes, scheduledAt } = req.body;
    const updates: any = { updatedAt: new Date() };
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (type !== undefined) updates.type = type;
    if (status !== undefined) updates.status = status;
    if (notes !== undefined) updates.notes = notes;
    if (scheduledAt !== undefined) updates.scheduledAt = scheduledAt ? new Date(scheduledAt) : null;
    if (password !== undefined) {
      if (password) {
        updates.passwordHash = await bcrypt.hash(password, 12);
        updates.hasPassword = true;
      } else {
        updates.passwordHash = null;
        updates.hasPassword = false;
      }
    }

    const [updated] = await db.update(plansTable).set(updates).where(eq(plansTable.id, plan.id)).returning();
    res.json(formatPlan(updated));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const user = getUser(req);
    const plan = await db.query.plansTable.findFirst({
      where: and(eq(plansTable.id, req.params.id), eq(plansTable.userId, user.id)),
    });
    if (!plan) {
      res.status(404).json({ error: "الخطة غير موجودة" });
      return;
    }
    await db.delete(plansTable).where(eq(plansTable.id, plan.id));
    res.json({ message: "تم حذف الخطة" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.post("/:id/share", requireAuth, async (req, res) => {
  try {
    const user = getUser(req);
    const plan = await db.query.plansTable.findFirst({
      where: and(eq(plansTable.id, req.params.id), eq(plansTable.userId, user.id)),
    });
    if (!plan) {
      res.status(404).json({ error: "الخطة غير موجودة" });
      return;
    }

    let shareToken = plan.shareToken;
    if (!shareToken) {
      shareToken = crypto.randomBytes(16).toString("hex");
      await db.update(plansTable).set({ shareToken, status: "مشتركة", updatedAt: new Date() })
        .where(eq(plansTable.id, plan.id));
    }

    const origin = req.headers.origin || `https://${req.headers.host}`;
    const shareUrl = `${origin}/invite/${shareToken}`;
    res.json({ shareToken, shareUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.post("/:id/verify-password", async (req, res) => {
  try {
    const plan = await db.query.plansTable.findFirst({
      where: eq(plansTable.id, req.params.id),
    });
    if (!plan) {
      res.status(404).json({ error: "الخطة غير موجودة" });
      return;
    }
    if (!plan.hasPassword || !plan.passwordHash) {
      res.json({ message: "لا توجد كلمة مرور" });
      return;
    }
    const { password } = req.body;
    const valid = await bcrypt.compare(password, plan.passwordHash);
    if (!valid) {
      res.status(403).json({ error: "كلمة المرور غير صحيحة" });
      return;
    }
    res.json({ message: "تم التحقق بنجاح" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

/* ─── Activities ─── */
router.patch("/:id/activities", requireAuth, async (req, res) => {
  try {
    const user = getUser(req);
    const plan = await db.query.plansTable.findFirst({ where: and(eq(plansTable.id, req.params.id), eq(plansTable.userId, user.id)) });
    if (!plan) { res.status(404).json({ error: "الخطة غير موجودة" }); return; }
    const [updated] = await db.update(plansTable).set({ activities: req.body.activities, updatedAt: new Date() }).where(eq(plansTable.id, req.params.id)).returning();
    res.json(formatPlan(updated));
  } catch (err) { console.error(err); res.status(500).json({ error: "خطأ في الخادم" }); }
});

/* ─── Gear Items ─── */
router.patch("/:id/gear", requireAuth, async (req, res) => {
  try {
    const user = getUser(req);
    const plan = await db.query.plansTable.findFirst({ where: and(eq(plansTable.id, req.params.id), eq(plansTable.userId, user.id)) });
    if (!plan) { res.status(404).json({ error: "الخطة غير موجودة" }); return; }
    const [updated] = await db.update(plansTable).set({ gearItems: req.body.gearItems, updatedAt: new Date() }).where(eq(plansTable.id, req.params.id)).returning();
    res.json(formatPlan(updated));
  } catch (err) { console.error(err); res.status(500).json({ error: "خطأ في الخادم" }); }
});

export default router;

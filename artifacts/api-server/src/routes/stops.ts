import { Router } from "express";
import { db, plansTable, stopsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, getUser } from "../lib/auth";

const router = Router({ mergeParams: true });

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

async function checkPlanAccess(planId: string, userId: string) {
  return db.query.plansTable.findFirst({
    where: and(eq(plansTable.id, planId), eq(plansTable.userId, userId)),
  });
}

const router2 = Router();

router2.get("/:id/stops", requireAuth, async (req, res) => {
  try {
    const user = getUser(req);
    const plan = await checkPlanAccess(req.params.id, user.id);
    if (!plan) {
      res.status(404).json({ error: "الخطة غير موجودة" });
      return;
    }
    const stops = await db.query.stopsTable.findMany({
      where: eq(stopsTable.planId, plan.id),
      orderBy: (s, { asc }) => [asc(s.order)],
    });
    res.json(stops.map(formatStop));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router2.post("/:id/stops", requireAuth, async (req, res) => {
  try {
    const user = getUser(req);
    const plan = await checkPlanAccess(req.params.id, user.id);
    if (!plan) {
      res.status(404).json({ error: "الخطة غير موجودة" });
      return;
    }
    const { name, notes, lat, lng, order } = req.body;
    if (!name) {
      res.status(400).json({ error: "اسم النقطة مطلوب" });
      return;
    }
    const [stop] = await db.insert(stopsTable).values({
      planId: plan.id,
      name,
      notes: notes || null,
      lat: lat ?? null,
      lng: lng ?? null,
      order: order ?? 0,
    }).returning();
    await db.update(plansTable).set({ updatedAt: new Date() }).where(eq(plansTable.id, plan.id));
    res.status(201).json(formatStop(stop));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router2.put("/:id/stops/:stopId", requireAuth, async (req, res) => {
  try {
    const user = getUser(req);
    const plan = await checkPlanAccess(req.params.id, user.id);
    if (!plan) {
      res.status(404).json({ error: "الخطة غير موجودة" });
      return;
    }
    const stop = await db.query.stopsTable.findFirst({
      where: and(eq(stopsTable.id, req.params.stopId), eq(stopsTable.planId, plan.id)),
    });
    if (!stop) {
      res.status(404).json({ error: "النقطة غير موجودة" });
      return;
    }
    const { name, notes, lat, lng, order } = req.body;
    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (notes !== undefined) updates.notes = notes;
    if (lat !== undefined) updates.lat = lat;
    if (lng !== undefined) updates.lng = lng;
    if (order !== undefined) updates.order = order;

    const [updated] = await db.update(stopsTable).set(updates).where(eq(stopsTable.id, stop.id)).returning();
    await db.update(plansTable).set({ updatedAt: new Date() }).where(eq(plansTable.id, plan.id));
    res.json(formatStop(updated));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router2.delete("/:id/stops/:stopId", requireAuth, async (req, res) => {
  try {
    const user = getUser(req);
    const plan = await checkPlanAccess(req.params.id, user.id);
    if (!plan) {
      res.status(404).json({ error: "الخطة غير موجودة" });
      return;
    }
    const stop = await db.query.stopsTable.findFirst({
      where: and(eq(stopsTable.id, req.params.stopId), eq(stopsTable.planId, plan.id)),
    });
    if (!stop) {
      res.status(404).json({ error: "النقطة غير موجودة" });
      return;
    }
    await db.delete(stopsTable).where(eq(stopsTable.id, stop.id));
    await db.update(plansTable).set({ updatedAt: new Date() }).where(eq(plansTable.id, plan.id));
    res.json({ message: "تم حذف النقطة" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

export default router2;

import { Router } from "express";
import { db, plansTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/:token", async (req, res) => {
  try {
    const plan = await db.query.plansTable.findFirst({
      where: eq(plansTable.shareToken, req.params.token),
    });
    if (!plan) {
      res.status(404).json({ error: "رابط الدعوة غير صالح" });
      return;
    }

    const owner = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, plan.userId),
    });

    res.json({
      planId: plan.id,
      title: plan.title,
      description: plan.description || null,
      type: plan.type,
      hasPassword: plan.hasPassword,
      ownerName: owner?.username || "مستخدم",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

export default router;

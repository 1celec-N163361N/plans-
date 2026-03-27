import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import plansRouter from "./plans";
import stopsRouter from "./stops";
import inviteRouter from "./invite";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/plans", plansRouter);
router.use("/plans", stopsRouter);
router.use("/invite", inviteRouter);

export default router;

import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import menuRouter from "./menu.js";
import discountsRouter from "./discounts.js";
import stopwatchRouter from "./stopwatch.js";
import submissionsRouter from "./submissions.js";
import locationRouter from "./location.js";
import analyticsRouter from "./analytics.js";
import adminAuthRouter from "./admin-auth.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(menuRouter);
router.use(discountsRouter);
router.use(stopwatchRouter);
router.use(submissionsRouter);
router.use(locationRouter);
router.use(analyticsRouter);
router.use(adminAuthRouter);

export default router;

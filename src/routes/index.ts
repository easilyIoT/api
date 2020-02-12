import { Router } from "express"

import OAuth2 from "./oauth"
import Auth from "./auth"
import Api from "./api"

import * as Middlewares from "../middlewares"

const router: Router = Router();


router.use("/oauth", OAuth2);
router.use("/auth", Auth);
router.use("/api", Api);

export default router;
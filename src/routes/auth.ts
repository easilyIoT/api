import { Router, Request, Response } from "express"
import passport from 'passport';

import * as Auth from "../controller/Auth"
import * as Middlewares from "../middlewares"

const router: Router = Router();

router.post("/register", Auth.register);
router.post("/login", passport.authenticate('local', { session: false }), Auth.login);
router.post("/verify", passport.authenticate('jwt', { session: false }), Auth.verify);

export default router;

import { Router } from "express"

import passport from 'passport';

import Device from "./device"


const router: Router = Router();


router.use(passport.authenticate("jwt", { session: false }));

router.use(Device);


export default router;
import { Router } from "express"

import passport from 'passport';

import Device from "./device"
import Group from "./group"

const router: Router = Router();


router.use(passport.authenticate("jwt", { session: false }));

router.use(Group);
router.use(Device);


export default router;
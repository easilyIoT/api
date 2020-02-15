import { Router } from "express";
import passport from "passport";


import * as Controllers from "../controller/OAuth"
import * as Middlewares from "../middlewares"

const router: Router = Router();


router.get("/auth", Controllers.auth);
router.route("/token")
        .get(Controllers.token)
        .post(Controllers.token);

router.post("/login", passport.authenticate('jwt', { session: false }), Controllers.grant);

router.use("/client", passport.authenticate('jwt', { session: false }));
router.route("/client")
        .get(Controllers.getClients)
        .post(Controllers.createClient)
router.route("/client/:id")
        .get(Controllers.getClient)
        .delete(Controllers.deleteClient)

export default router;
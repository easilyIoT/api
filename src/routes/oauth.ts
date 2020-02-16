import { Router } from "express";
import passport from "passport";


import * as Controllers from "../controller/OAuth"
import * as Middlewares from "../middlewares"

const router: Router = Router();


router.get("/auth", Controllers.auth);
router.route("/token")
        .post(Controllers.refresh_token_grant, Controllers.authorization_code_grant);

router.post("/login", passport.authenticate('jwt', { session: false }), Controllers.generateCode);

router.use("/client", passport.authenticate('jwt', { session: false }));
router.route("/client")
        .get(Controllers.getClients)
        .post(Controllers.createClient)
router.route("/client/:id")
        .get(Controllers.getClient)
        .delete(Controllers.deleteClient)

export default router;
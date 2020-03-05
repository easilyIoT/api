import { Router } from "express"

import * as Controller from "../../controller/Group"


const router = Router();

router.route("/group")
        .get(Controller.getAllGroups)
        .post(Controller.createGroup)

router.route("/group/:id")
        .get(Controller.getGroup)
        .put(Controller.updateGroup)
        .delete(Controller.deleteGroup)


export default router;
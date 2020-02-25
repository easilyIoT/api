import { Router } from "express"

import * as Controller from "../../controller/Device"

const router: Router = Router();


router.route("/device")
        .get(Controller.getAllDevices)
        .post(Controller.createDevice)

router.route("/device/types")
        .get(Controller.getTypes)

router.route("/device/:id")
        .get(Controller.getDevice)
        .delete(Controller.deleteDevice)

router.route("/device/:id/:action")
        .post(Controller.triggerAction)



export default router;
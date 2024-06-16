require("dotenv").config();
import express, { Request, Response } from "express";
import { jwtchecker } from "../../utils/helpers/jwthelper";
import { createPermissionID } from "../../utils/modules/SettingsHelpers";
import { makeID } from "../../utils/helpers/generatefns";
const router = express.Router();

import UserPermission from "../../schemas/userpermission";

router.get('/getpermissions', jwtchecker, async (req: Request, res: Response) => { // formerly /getpermissions/:userID
    // const accountID = req.params.accountID;
    const userID = req.params.userID;
    // const deviceID = req.params.deviceID;

    UserPermission.find({ "from.userID": userID }).sort({ _id: -1 }).then((result: any) => {
        res.send({ status: true, result: result });
    }).catch((err: any) => {
        res.status(400).send({ status: false, message: "Error retrieving user permissions", reference: err.message });
    })
});

router.post('/createpermissions', jwtchecker, async (req: Request, res: Response) => { // formerly /permissions
    // const accountID = req.params.accountID;
    const userID = req.params.userID;
    // const deviceID = req.params.deviceID;

    const permissionType = req.body.permissionType;
    const allowedUsers = req.body.allowedUsers;
    const deviceID = req.body.deviceID;

    const newPermissionID = await createPermissionID("PRM_ID_" + makeID(15));
    const newpermission = new UserPermission({
        permissionID: newPermissionID,
        permissionType: permissionType,
        allowedUsers: allowedUsers,
        isEnabled: true,
        from: {
            userID: userID,
            deviceID: deviceID
        }
    })

    newpermission.save().then(() => {
        res.send({ status: true, message: "Permission has been created" });
    }).catch((err: any) => {
        res.status(400).send({ status: true, message: "Unable to create permission", reference: err.message });
    })
});

router.delete('/deletepermission/:permissionID', jwtchecker, async (req: Request, res: Response) => { //formerly /deletepermission/:token { userID, permissionID }
    // const accountID = req.params.accountID;
    const userID = req.params.userID;
    // const deviceID = req.params.deviceID;

    const permissionID = req.params.permissionID;

    UserPermission.findOneAndDelete({ "from.userID": userID, permissionID: permissionID }).then(() => {
        res.send({ status: true, message: `${permissionID} has been deleted` });
    }).catch((err: any) => {
        res.status(400).send({ status: false, message: "Error deleting permission", reference: err.message });
    })
});

export default router;
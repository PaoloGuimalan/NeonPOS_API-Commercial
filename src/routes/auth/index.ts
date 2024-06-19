require("dotenv").config();
import express, { Request, Response } from "express";
import mongoose from "mongoose";
import bcrypt from 'bcrypt';
const router = express.Router();

// Schemas Import

import UserAccount from '../../schemas/useracccount';
import { createJWTwExp, jwtchecker } from "../../utils/helpers/jwthelper";
import { deleteKeyInObject } from "../../utils/helpers/objectparser";
import { UserDataWithPermissions } from "../../utils/modules/GetUserData";
import { dateGetter, makeID } from "../../utils/helpers/generatefns";
import { createUniqueAccountID } from "../../utils/modules/auth/AuthHelpers";

//End Schema Import

router.get('/', (req: Request, res: Response) => {
    res.send("Neon POS Auth API");
});

router.post('/login', (req: Request, res: Response) => {
    const accountID = req.body.accountID;
    const password = req.body.password;
    const userID = req.body.userID;

    UserAccount.find({ accountID: accountID, "createdBy.userID": userID }).then(async (result) => {
        if(result.length > 0){
            if(result.length > 1){
                res.status(401).send({ status: false, message: "Unable to proceed due to duplicate accounts" }).status(401);
            }
            else{
                const userData = result[0];
                const resultPassword = userData.password as unknown as string;
                if(password === resultPassword){
                    const authtoken = createJWTwExp({
                        accountID: userData.accountID,
                        deviceID: userData.createdBy.deviceID,
                        userID: userData.createdBy.userID
                    })
                    const finaldata = await UserDataWithPermissions(userData.accountID as unknown as string, userData.createdBy.userID as unknown as string);
                    res.send({ status: true, message: "User has been authenticated", result: { authtoken: authtoken, data: deleteKeyInObject("_id", deleteKeyInObject("password", finaldata)) } });
                }
                else{
                    bcrypt.compare(resultPassword, password).then(async function(result) {
                        if(result){
                            const authtoken = createJWTwExp({
                                accountID: userData.accountID,
                                deviceID: userData.createdBy.deviceID,
                                userID: userData.createdBy.userID
                            })
                            const finaldata = await UserDataWithPermissions(userData.accountID as unknown as string, userData.createdBy.userID as unknown as string);
                            res.send({ status: true, message: "User has been authenticated", result: { authtoken: authtoken, data: deleteKeyInObject("_id", deleteKeyInObject("password", finaldata)) }  });
                        }
                        else{
                            res.status(401).send({ status: false, message: "Incorrect password" });
                        }
                    });
                }
            }
        }
        else{
            res.status(401).send({ status: false, message: "No account matched" });
        }
    }).catch((err) => {
        res.status(500).send({ status: false, message: "Error verifying Account ID" });
    });
});

router.get('/getuser/:searchedID', jwtchecker, async (req: Request, res: Response) => { // formerly /getusers/:userID/:accountID
    // const accountID = req.params.accountID;
    const userID = req.params.userID;
    const searchedID = req.params.searchedID;
    // const deviceID = req.params.deviceID;

    UserAccount.aggregate([
        {
            $match: { "createdBy.userID": userID, accountID: searchedID }
        },
        {
            $lookup: {
                from: "userpermissions",
                // localField: "accountType",
                // foreignField: "allowedUsers",
                let: { accountType: "$accountType" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $in: ["$$accountType", "$allowedUsers"] },
                                    { $eq: [true, "$isEnabled"] },
                                    { $eq: [userID, "$from.userID"] }
                                ]
                            }
                        }
                    }
                ],
                as: "permissions"
            }
        },
        {
            $project: {
                "password": 0,
                "permissions._id": 0,
                "permissions.permissionID": 0,
                "permissions.allowedUsers": 0,
                "permissions.isEnabled": 0,
                "permissions.__v": 0
            }
        }
    ]).then((result) => {
        const userdetails = result.map((mp) => {
            const flattenedpermissions = mp.permissions.map((mpp: any) => mpp.permissionType);

            return {
                ...mp,
                permissions: flattenedpermissions
            }
        });
        res.send({ status: true, result: userdetails });
    }).catch((err) => {
        console.log(err);
        res.status(400).send({ status: false, message: "Error fetching account" });
    });
});

router.get('/getusers', jwtchecker, async (req: Request, res: Response) => { // formerly /getusers/:userID
    // const accountID = req.params.accountID;
    const userID = req.params.userID;
    // const deviceID = req.params.deviceID;

    UserAccount.find({ "createdBy.userID": userID }, { password: 0 }).sort({ _id: -1 }).then((result) => {
        res.send({ status: true, result: result });
    }).catch((err) => {
        console.log(err);
        res.status(400).send({ status: false, message: "Error fetching accounts" });
    })
});

router.post('/register', jwtchecker, async (req: Request, res: Response) => {
    // const accountID = req.params.accountID;
    const creatorAccountID = req.params.accountID;
    const userID = req.params.userID;
    const deviceID = req.params.deviceID;

    const firstname = req.body.firstname;
    const middlename = req.body.middlename;
    const lastname = req.body.lastname;

    const accountType = req.body.accountType;
    const password = req.body.password;

    const newAccountID = await createUniqueAccountID("ACC_ID_" + makeID(4) + "_" + makeID(4) + "_" + makeID(4));
    const newaccount = new UserAccount({
        accountID: newAccountID,
        accountType: accountType,
        accountName: {
            firstname: firstname,
            middlename: middlename,
            lastname: lastname
        },
        password: password,
        dateCreated: dateGetter(),
        createdBy: {
            accountID: creatorAccountID,
            userID: userID,
            deviceID: deviceID
        }
    })

    // res.send({ status: true, message: "Account creation has been stalled" });

    newaccount.save().then(() => {
        res.send({ status: true, message: "Admin account has been created" });
    });
});

router.delete('/removeuser/:candidateID', jwtchecker, async (req: Request, res: Response) => { //formerly /removeuser/:token { userID, accountID }
    // const accountID = req.params.accountID;
    const userID = req.params.userID;
    // const deviceID = req.params.deviceID;

    const candidateID = req.params.candidateID;

    UserAccount.findOneAndDelete({ "createdBy.userID": userID, accountID: candidateID }).then(() => {
        res.send({ status: true, message: `${candidateID} has been deleted` });
    }).catch((err) => {
        res.status(400).send({ status: false, message: "Error deleting account", reference: err.message });
    })
})

router.get('/rfsh', jwtchecker, async (req: Request, res: Response) => {
    const accountID = req.params.accountID;
    const userID = req.params.userID;
    // const deviceID = req.params.deviceID;

    const finaldata = await UserDataWithPermissions(accountID, userID);
    res.send({ status: true, message: "User has been authenticated", result: { data: deleteKeyInObject("_id", deleteKeyInObject("password", finaldata)) } });
});

export default router;
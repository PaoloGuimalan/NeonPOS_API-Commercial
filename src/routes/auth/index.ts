require("dotenv").config();
import express, { Request, Response } from "express";
import mongoose from "mongoose";
import bcrypt from 'bcrypt';
const router = express.Router();

// Schemas Import

import UserAccount from '../../schemas/useracccount';
import { createJWTwExp } from "../../utils/helpers/jwthelper";
import { deleteKeyInObject } from "../../utils/helpers/objectparser";
import { UserDataWithPermissions } from "../../utils/modules/GetUserData";

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
                res.send({ status: false, message: "Unable to proceed due to duplicate accounts" }).status(401);
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
                            res.send({ status: false, message: "Incorrect password" }).status(401);
                        }
                    });
                }
            }
        }
        else{
            res.send({ status: false, message: "No account matched" }).status(401);
        }
    }).catch((err) => {
        res.send({ status: false, message: "Error verifying Account ID" }).status(500);
    });
});

export default router;
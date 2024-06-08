require("dotenv").config();
import express, { Request, Response } from "express";
import mongoose from "mongoose";
import bcrypt from 'bcrypt';
const router = express.Router();

// Schemas Import

import UserAccount from '../../schemas/useracccount';

//End Schema Import

router.get('/', (req: Request, res: Response) => {
    res.send("Neon POS Auth API");
});

router.post('/login', (req: Request, res: Response) => {
    const accountID = req.body.accountID;
    const password = req.body.password;
    const userID = req.body.userID;

    UserAccount.find({ accountID: accountID, "createdBy.userID": userID }).then((result) => {
        if(result.length > 0){
            if(result.length > 1){
                res.send({ status: false, message: "Unable to proceed due to duplicate accounts" }).status(401);
            }
            else{
                const userData = result[0];
                const resultPassword = userData.password as unknown as string;
                if(password === resultPassword){
                    res.send({ status: true, message: "User has been authenticated" });
                }
                else{
                    bcrypt.compare(resultPassword, password).then(function(result) {
                        if(result){
                            res.send({ status: true, message: "User has been authenticated" });
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
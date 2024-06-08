require("dotenv").config()
import jwt from "jsonwebtoken";
import UserAccount from "../../schemas/useracccount";
import { NextFunction, Request, Response } from "express";
const JWT_SECRET = process.env.JWT_SECRET as unknown as string

const jwtchecker = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers["x-access-token"] as string;

    if(token){
        jwt.verify(token, JWT_SECRET, async (err, decode: any) => {
            if(err){
                // console.log(err)
                res.send({ status: false, message: err.message })
            }
            else{
                const id = decode?.accountID;
                const userID = decode?.userID;
                const deviceID = decode?.deviceID;
                await UserAccount.findOne({ accountID: id, "createdBy.userID": userID }).then((result: any) => {
                    if(result){
                        req.params.accountID = result.accountID;
                        req.params.userID = userID;
                        req.params.deviceID = deviceID;
                        next();
                    }
                    else{
                        res.send({ status: false, message: "Cannot verify user!"})
                    }
                }).catch((err) => {
                    console.log(err)
                    res.send({ status: false, message: "Error verifying user!"})
                })
            }
        })
    }
    else{
        res.send({ status: false, message: "Cannot verify user!"})
    }
}

const createJWT = (payload: any) => {
    const encodedResult = jwt.sign({
        data: payload
    }, JWT_SECRET)

    return encodedResult;
}

const createJWTwExp = (payload: any) => {
    const encodedResult = jwt.sign(payload, JWT_SECRET, {
        expiresIn: 60 * 60 * 24 * 7
    })

    return encodedResult;
}

export {
    jwtchecker,
    createJWT,
    createJWTwExp
}
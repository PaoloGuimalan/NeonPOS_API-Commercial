require("dotenv").config()
import jwt from "jsonwebtoken";
import UserAccount from "../../schemas/useracccount";
import { NextFunction, Request, Response } from "express";
import producer from "../rabbitmq/producer";
const JWT_SECRET = process.env.JWT_SECRET as unknown as string

const jwtchecker = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers["x-access-token"] as string;

    if(token){
        jwt.verify(token, JWT_SECRET, async (err, decode: any) => {
            if(err){
                // console.log(err)
                await producer.publishMessage("ERROR", { message: "Token provided is invalid", data: token });
                res.status(401).send({ status: false, message: err.message })
            }
            else{
                const id = decode?.accountID;
                const userID = decode?.userID;
                const deviceID = decode?.deviceID;
                await UserAccount.findOne({ accountID: id, "createdBy.userID": userID }).then(async (result: any) => {
                    if(result){
                        req.params.accountID = result.accountID;
                        req.params.userID = userID;
                        req.params.deviceID = deviceID;
                        next();
                    }
                    else{
                        await producer.publishMessage("WARNING", { message: "No user accounts matched the token provided", data: token });
                        res.status(401).send({ status: false, message: "Cannot verify user!"})
                    }
                }).catch(async (err) => {
                    console.log(err)
                    await producer.publishMessage("ERROR", { message: "Fetching user account have an error", data: token });
                    res.status(401).send({ status: false, message: "Error verifying user!"})
                })
            }
        })
    }
    else{
        await producer.publishMessage("WARNING", { message: "No token provided", data: "N/A" });
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
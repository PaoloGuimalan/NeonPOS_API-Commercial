require("dotenv").config();
import express, { Request, Response } from "express";
import { jwtchecker } from "../../utils/helpers/jwthelper";
import { dateGetter, makeID } from "../../utils/helpers/generatefns";
const router = express.Router();

import Order from "../../schemas/order";

router.get('/generatereport/:datescope/:timescope', jwtchecker, (req: Request, res: Response) => { // formerly /generatereport/:token { userID, deviceID, datescope, timescope }
    // const accountID = req.params.accountID;
    const userID = req.params.userID;
    const deviceID = req.params.deviceID;

    const datescope = req.params.datescope;
    // const timescope = req.params.timescope;

    Order.aggregate([
        {
            $match: {
                $and: [
                    { "orderMadeBy.deviceID": deviceID },
                    { "orderMadeBy.userID": userID },
                    { dateMade: datescope },
                    {
                        $or: [
                            { status: "Initial" },
                            { status: "Renewed" }
                        ]
                    }
                ]
            }
        },{
            $group: {
                _id: null,
                dateMade: { $first: "$dateMade" },
                numberofsales: { $sum: 1 },
                totalsales: { $sum: "$totalAmount" },
                // discount: { $avg: "$discount" },
                individualDiscounts: {
                    $addToSet: {
                        discount: "$discount",
                        totalAmount: "$totalAmount",
                        convertedDiscount: { $multiply: [{ $divide: ["$discount", 100] }, "$totalAmount"] }
                    }
                }
            }
        },{
            $project: {
                numberofsales: 1,
                totalsales: 1,
                dateMade: 1,
                discount: { $divide: [{ $multiply: [ 100, { $sum: "$individualDiscounts.convertedDiscount" } ] }, "$totalsales"] },
                individualDiscounts: 1,
                // discounttotal: { $multiply: ["$totalsales", { $divide: ["$discount", 100] }] },
                discounttotal: { $sum: "$individualDiscounts.convertedDiscount" },
                saleswdiscount: { $subtract: ["$totalsales", { $sum: "$individualDiscounts.convertedDiscount" }] },
                taxtotal: { $multiply: [{ $subtract: ["$totalsales", { $sum: "$individualDiscounts.convertedDiscount" }] }, 0.12] },
                taxedsales: { $subtract: [{ $subtract: ["$totalsales", { $sum: "$individualDiscounts.convertedDiscount" }] },{ $multiply: [{ $subtract: ["$totalsales", { $multiply: ["$totalsales", { $divide: [{ $divide: [{ $multiply: [ 100, { $sum: "$individualDiscounts.convertedDiscount" } ] }, "$totalsales"] }, 100] }] }] }, 0.12] }] }
            }
        }
    ]).then((result: any) => {
        res.send({ status: true, result: result });
    }).catch((err: any) => {
        res.status(400).send({ status: false, message: "Error generating report", reference: err.message });
    })
})

export default router;
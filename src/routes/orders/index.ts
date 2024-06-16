require("dotenv").config();
import express, { Request, Response } from "express";
import { jwtchecker } from "../../utils/helpers/jwthelper";
import { dateGetter, makeID } from "../../utils/helpers/generatefns";
import { createUniqueOrderID } from "../../utils/modules/orders/OrderHelpers";
import jwt from "jsonwebtoken";
import { GetOrdersParamsJwtPayload } from "../../utils/constants/interfaces";
import { createUniqueCategoryID } from "../../utils/modules/category";
const JWT_SECRET = process.env.JWT_SECRET as unknown as string
const router = express.Router();

import Order from "../../schemas/order";
import Category from "../../schemas/category";

router.post('/createorder', jwtchecker, async (req: Request, res: Response) => {
    const accountID = req.params.accountID;
    const userID = req.params.userID;
    const deviceID = req.params.deviceID;

    const voidedFrom = req.body.voidedFrom;

    const newOrderID = await createUniqueOrderID("ORD_" + makeID(15));

    if(voidedFrom.trim() !== ""){
        Order.findOneAndUpdate({ orderID: voidedFrom }, { status: "Voided" }).catch((err: any) => {
            console.log(err);
        });
    }

    const neworder = new Order({
        orderID: newOrderID,
        dateMade: dateGetter(),
        dateUpdated: "",
        orderMadeBy: {
            accountID: accountID,
            userID: userID,
            deviceID: deviceID
        },
        ...req.body
    })
    
    neworder.save().then(() => {
        res.send({ status: true, message: "Order has been saved", result: { orderID: newOrderID } });
    }).catch((err: any) => {
        res.status(400).send({ status: false, message: "There was a problem saving the order", reference: err.message });
    })
});

router.get('/getorders/:token', jwtchecker, async (req: Request, res: Response) => { 
    // const accountID = req.params.accountID;
    const userID = req.params.userID;
    // const deviceID = req.params.deviceID;

    const { orderID, datescope } = jwt.verify(req.params.token, JWT_SECRET) as GetOrdersParamsJwtPayload; // formerly { userID, orderID, datescope }

    if(datescope){
        if(orderID.trim() === ""){
            return await Order.find({ "orderMadeBy.userID": userID, dateMade: datescope }).sort({ _id: -1 }).then((result: any) => {
                res.send({ status: true, result: result });
            }).catch((err: any) => {
                res.status(400).send({ status: false, message: "Cannot fetch orders", reference: err.message });
            })
        }
        else{
            return await Order.find({ "orderMadeBy.userID": userID, orderID: orderID, dateMade: datescope }).sort({ _id: -1 }).then((result: any) => {
                res.send({ status: true, result: result });
            }).catch((err: any) => {
                res.status(400).send({ status: false, message: "Cannot fetch orders", reference: err.message });
            })
        }
    }
    else{
        if(orderID.trim() === ""){
            return await Order.find({ "orderMadeBy.userID": userID }).sort({ _id: -1 }).then((result: any) => {
                res.send({ status: true, result: result });
            }).catch((err: any) => {
                res.status(400).send({ status: false, message: "Cannot fetch orders", reference: err.message });
            })
        }
        else{
            return await Order.find({ "orderMadeBy.userID": userID, orderID: orderID }).sort({ _id: -1 }).then((result: any) => {
                res.send({ status: true, result: result });
            }).catch((err: any) => {
                res.status(400).send({ status: false, message: "Cannot fetch orders", reference: err.message });
            })
        }
    }
});

router.get('/category', jwtchecker, (req: Request, res: Response) => {
    // const accountID = req.params.accountID;
    const userID = req.params.userID;
    // const deviceID = req.params.deviceID;

    Category.find({ "from.userID": userID }).then((result: any) => {
        res.send({ status: true, result: result });
    }).catch((err: any) => {
        res.status(400).send({ status: false, message: "There was a problem fetching categories", reference: err.message });
    })
})

router.post('/addcategory', jwtchecker, async (req: Request, res: Response) => { // formerly POST: /category
    const accountID = req.params.accountID;
    const userID = req.params.userID;
    const deviceID = req.params.deviceID;

    const newCategoryID = await createUniqueCategoryID("CAT_" + makeID(15));
    const newcategory = new Category({
        categoryID: newCategoryID,
        preview: "https://firebasestorage.googleapis.com/v0/b/neon-systems.appspot.com/o/pos%2Fcategories%2Fistockphoto-1447123177-612x612.jpg?alt=media&token=9ae6f040-2934-4606-9dbf-f9f71a440e66",
        from: {
            accountID: accountID,
            userID: userID,
            deviceID: deviceID
        },
        ...req.body
    })
    
    return await newcategory.save().then(() => {
        res.send({ status: true, message: "Order has been saved", result: { categoryID: newCategoryID } });
    }).catch((err: any) => {
        console.log(err);
        res.status(400).send({ status: false, message: "There was a problem saving the order" });
    })
})

router.post('/closeorder', jwtchecker, (req: Request, res: Response) => { // derived from closeorderV2
    // const accountID = req.params.accountID;
    const userID = req.params.userID;
    const deviceID = req.params.deviceID;

    const orderID = req.body.orderID;
    const discount = req.body.discount;
    const amountreceived = req.body.amountreceived;
    const isRenewed = req.body.isRenewed;

    Order.updateOne({ orderID: orderID, "orderMadeBy.userID": userID, "orderMadeBy.deviceID": deviceID }, { receivedAmount: amountreceived, discount: discount, status: isRenewed ? "Renewed" : "Initial" }).then(async () => {
        Order.find({ orderID: orderID, "orderMadeBy.userID": userID, "orderMadeBy.deviceID": deviceID }).then((result: any) => {
            res.send({ status: true, message: "Order has been closed", result: result });
        }).catch((err: any) => {
            console.log(err);
            res.status(400).send({ status: false, message: "Error fetching order details", reference: err.message });
        })
    }).catch((err: any) => {
        console.log(err);
        res.status(400).send({ status: false, message: "There was a problem closing the order", reference: err.message });
    })
})

export default router;
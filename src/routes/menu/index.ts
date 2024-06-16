require("dotenv").config();
import express, { Request, Response } from "express";
import { jwtchecker } from "../../utils/helpers/jwthelper";
import { dateGetter, makeID } from "../../utils/helpers/generatefns";
import { createUniqueProductID } from "../../utils/modules/menu/ProductHelpers";
const router = express.Router();

import Product from "../../schemas/product";

router.get('/getproducts', jwtchecker, async (req: Request, res: Response) => { // formerly /getproducts/:userID
    // const accountID = req.params.accountID;
    const userID = req.params.userID;
    // const deviceID = req.params.deviceID;

    Product.find({ "addedBy.userID": userID }).then((result: any) => {
        res.send({ status: true, result: result });
    }).catch((err: any) => {
        res.status(400).send({ status: false, message: "Error fetching product list", reference: err.message });
    })
});

router.post('/addproduct', jwtchecker, async (req: Request, res: Response) => {
    const accountID = req.params.accountID;
    const userID = req.params.userID;
    const deviceID = req.params.deviceID;

    const productName = req.body.productName;
    const productPrice = req.body.productPrice;
    const productQuantity = req.body.productQuantity;
    const category = req.body.category;
    const POSType = req.body.POSType;

    const newProductID = await createUniqueProductID("PRD_ID_" + makeID(15));
    const newproduct = new Product({
        productID: newProductID,
        productName: productName,
        productPrice: productPrice,
        productQuantity: productQuantity,
        category: category,
        previews: [
            "https://firebasestorage.googleapis.com/v0/b/neon-systems.appspot.com/o/pos%2Fproducts%2F214-2143190_food-plate-black-and-white-hd-png-download.png?alt=media&token=615ad1b6-7598-4a35-accc-a2cc6150c6fa"
        ],
        addedBy: {
            accountID: accountID,
            userID: userID,
            deviceID: deviceID
        },
        dateAdded: dateGetter()
    })

    return await newproduct.save().then(() => {
        res.send({ status: true, message: "Product creation has been successful" });
    }).catch((err: any) => {
        res.status(400).send({ status: false, message: "Error saving product", reference: err.message });
    })
});

router.delete('/removeproduct/:productID', jwtchecker, (req: Request, res: Response) => { // formerly /removeproduct/:token { userID, productID }
    // const accountID = req.params.accountID;
    const userID = req.params.userID;
    // const deviceID = req.params.deviceID;

    const productID = req.params.productID;

    Product.findOneAndDelete({ "addedBy.userID": userID, productID: productID }).then(() => {
        res.send({ status: true, message: `${productID} has been deleted` });
    }).catch((err: any) => {
        res.status(400).send({ status: false, message: "Error deleting permission", reference: err.message });
    })
});

export default router;
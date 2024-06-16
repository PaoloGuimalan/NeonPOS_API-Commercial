import Product from '../../../schemas/product';
import { makeID } from "../../helpers/generatefns";

async function createUniqueProductID(initID: string) {
    return await Product.find({ productID: initID }).then((result) => {
        if(result.length > 0){
            const generatedAccountID = "PRD_ID_" + makeID(15);
            createUniqueProductID(generatedAccountID);
        }
        else{
            return initID;
        }
    }).catch((err) => {
        throw new Error(err);
    })
}

export {
    createUniqueProductID
}
import Order from '../../../schemas/order';
import { makeID } from "../../helpers/generatefns";

async function createUniqueOrderID(initID: string) {
    return await Order.find({ orderID: initID }).then((result) => {
        if(result.length > 0){
            const generatedAccountID = "ORD_" + makeID(15);
            createUniqueOrderID(generatedAccountID);
        }
        else{
            return initID;
        }
    }).catch((err) => {
        throw new Error(err);
    })
}

export {
    createUniqueOrderID
}
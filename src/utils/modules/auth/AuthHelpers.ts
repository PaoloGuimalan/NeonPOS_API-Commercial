import UserAccount from '../../../schemas/useracccount';
import { makeID } from "../../helpers/generatefns";

async function createUniqueAccountID(initID: string) {
    return await UserAccount.find({ accountID: initID }).then((result) => {
        if(result.length > 0){
            const generatedAccountID = "ACC_ID_" + makeID(4) + "_" + makeID(4) + "_" + makeID(4); //"ACC_ID_" + makeID(15)
            createUniqueAccountID(generatedAccountID);
        }
        else{
            return initID;
        }
    }).catch((err) => {
        throw new Error(err);
    })
}

export {
    createUniqueAccountID
}
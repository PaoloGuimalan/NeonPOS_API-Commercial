import Category from '../../../schemas/category';
import { makeID } from "../../helpers/generatefns";

async function createUniqueCategoryID(initID: string) {
    return await Category.find({ categoryID: initID }).then((result) => {
        if(result.length > 0){
            const generatedAccountID = "CAT_" + makeID(15);
            createUniqueCategoryID(generatedAccountID);
        }
        else{
            return initID;
        }
    }).catch((err) => {
        throw new Error(err);
    })
}

export {
    createUniqueCategoryID
}
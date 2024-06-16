import UserPermission from '../../schemas/userpermission';
import { makeID } from "../helpers/generatefns";

async function createPermissionID(initID: string) {
    return await UserPermission.find({ permissionID: initID }).then((result) => {
        if(result.length > 0){
            const generatedAccountID = "PRM_ID_" + makeID(15);
            createPermissionID(generatedAccountID);
        }
        else{
            return initID;
        }
    }).catch((err) => {
        throw new Error(err);
    })
}

export {
    createPermissionID
}
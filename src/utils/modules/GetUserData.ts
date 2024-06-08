import UserAccount from '../../schemas/useracccount';

async function UserDataWithPermissions(accountID: string, userID: string) {
    return await UserAccount.aggregate([
        {
            $match: {
                $and: [
                    {
                        accountID: accountID
                    },
                    {
                        "createdBy.userID": userID
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "userpermissions",
                // localField: "accountType",
                // foreignField: "allowedUsers",
                let: { accountType: "$accountType" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $in: ["$$accountType", "$allowedUsers"] },
                                    { $eq: [true, "$isEnabled"] },
                                    { $eq: [userID, "$from.userID"] }
                                ]
                            }
                        }
                    }
                ],
                as: "permissions"
            }
        },
        {
            $project: {
                "password": 0,
                "permissions._id": 0,
                "permissions.permissionID": 0,
                "permissions.allowedUsers": 0,
                "permissions.isEnabled": 0,
                "permissions.__v": 0
            }
        }
    ]).then((result: any) => {
        if(result.length > 0){
            const userdetails = result.map((mp: any) => {
                const flattenedpermissions = mp.permissions.map((mpp: any) => mpp.permissionType);

                return {
                    ...mp,
                    permissions: flattenedpermissions
                }
            });
            return userdetails[0];
        }
        else{
            return false;
        }
    }).catch((err) => {
        throw new Error(err);
    })
}

export {
    UserDataWithPermissions
}
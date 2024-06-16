export interface UserAccountInterface {
    accountID: string,
    accountType: string,
    accountName: {
        firstname: string,
        middlename?: string,
        lastname: string
    },
    password: string,
    dateCreated: string,
    createdBy: {
        accountID: string,
        userID: string,
        deviceID: string
    }
}

export interface GetOrdersParamsJwtPayload {
    orderID: string;
    datescope: string | null | undefined;
}
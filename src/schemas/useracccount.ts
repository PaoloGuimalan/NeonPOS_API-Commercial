import mongoose from "mongoose";

const useraccount = new mongoose.Schema({
    accountID: {type: mongoose.Schema.Types.Mixed, require: true},
    accountType: {type: mongoose.Schema.Types.Mixed, require: true},
    accountName: {
        firstname: {type: mongoose.Schema.Types.Mixed, require: true},
        middlename: {type: mongoose.Schema.Types.Mixed},
        lastname: {type: mongoose.Schema.Types.Mixed, require: true}
    },
    password: {type: mongoose.Schema.Types.Mixed, require: true},
    dateCreated: {type: mongoose.Schema.Types.Mixed, require: true},
    createdBy: {
        accountID: {type: mongoose.Schema.Types.Mixed, require: true},
        userID: {type: mongoose.Schema.Types.Mixed, require: true},
        deviceID: {type: mongoose.Schema.Types.Mixed, require: true}
    }
});

export default mongoose.model("UserAccount", useraccount, "useraccounts");
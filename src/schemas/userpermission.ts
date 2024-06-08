import mongoose from "mongoose";

const userpermission = new mongoose.Schema({
    permissionID: {type: mongoose.Schema.Types.Mixed, require: true},
    permissionType: {type: mongoose.Schema.Types.Mixed, require: true},
    allowedUsers: [{type: mongoose.Schema.Types.Mixed, require: true}],
    isEnabled: {type: mongoose.Schema.Types.Mixed, require: true},
    from: {
        userID: {type: mongoose.Schema.Types.Mixed, require: true},
        deviceID: {type: mongoose.Schema.Types.Mixed, require: true}
    }
});

export default mongoose.model("UserPermission", userpermission, "userpermissions");
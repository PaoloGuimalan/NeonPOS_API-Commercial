import mongoose from "mongoose";

const category = new mongoose.Schema({
    categoryID: {type: mongoose.Schema.Types.Mixed, require: true},
    categoryName: {type: mongoose.Schema.Types.Mixed, require: true},
    preview: {type: mongoose.Schema.Types.Mixed, require: true},
    from: {
        accountID: {type: mongoose.Schema.Types.Mixed, require: true},
        userID: {type: mongoose.Schema.Types.Mixed, require: true},
        deviceID: {type: mongoose.Schema.Types.Mixed, require: true}
    }
});

export default mongoose.model("Category", category, "categories");
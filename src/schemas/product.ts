import mongoose from "mongoose";

const product = new mongoose.Schema({
    productID: {type: mongoose.Schema.Types.Mixed, require: true},
    productName: {type: mongoose.Schema.Types.Mixed, require: true},
    productPrice: Number,
    productQuantity: Number,
    category: {type: mongoose.Schema.Types.Mixed, require: true},
    previews: [{type: mongoose.Schema.Types.Mixed, require: true}],
    addedBy: {
        accountID: {type: mongoose.Schema.Types.Mixed, require: true},
        userID: {type: mongoose.Schema.Types.Mixed, require: true},
        deviceID: {type: mongoose.Schema.Types.Mixed, require: true}
    },
    dateAdded: {type: mongoose.Schema.Types.Mixed, require: true}
});

export default mongoose.model("Product", product, "products");
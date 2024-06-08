import mongoose from "mongoose";

const order = new mongoose.Schema({
    orderID: {type: mongoose.Schema.Types.Mixed, require: true},
    orderSet: [{
        product: {
            addedBy: {
                accountID: {type: mongoose.Schema.Types.Mixed, require: true}, 
                userID: {type: mongoose.Schema.Types.Mixed, require: true},
                deviceID: {type: mongoose.Schema.Types.Mixed, require: true}
            },
            category: {type: mongoose.Schema.Types.Mixed, require: true},
            dateAdded: {type: mongoose.Schema.Types.Mixed, require: true},
            previews: [{type: mongoose.Schema.Types.Mixed, require: true}],
            productID: {type: mongoose.Schema.Types.Mixed, require: true},
            productName: {type: mongoose.Schema.Types.Mixed, require: true},
            productPrice: Number,
            productQuantity: Number,
        },
        quantity: Number
    }],
    dateMade: {type: mongoose.Schema.Types.Mixed, require: true},
    timeMade: {type: mongoose.Schema.Types.Mixed, require: true},
    tableNumber: {type: mongoose.Schema.Types.Mixed, require: true},
    totalAmount: Number,
    receivedAmount: Number,
    orderMadeBy: {
        accountID: {type: mongoose.Schema.Types.Mixed, require: true},
        userID: {type: mongoose.Schema.Types.Mixed, require: true},
        deviceID: {type: mongoose.Schema.Types.Mixed, require: true}
    },
    dateUpdated: {type: mongoose.Schema.Types.Mixed, require: true},
    status: {type: mongoose.Schema.Types.Mixed},
    voidedFrom: {type: mongoose.Schema.Types.Mixed},
    discount: Number
});

export default mongoose.model("Order", order, "orders");
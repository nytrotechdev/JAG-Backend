const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const paymentSchema = mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "user",
    },
    subscriptionId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "settings",
    },
    isPaid: {
        type: Boolean,
        default: false
    },        
    // paymentId: {type :String, required: true},
    transactionId : {type: String, required: true},
    amount: {type: Number, required: true},
    //  duration : {type: Number, required: true},
    currencyCode : {type: String},
    paid_at: { 
        type: String,
    },
    expires_at: { 
          type: String,
    },
    date_today_at: { 
          type: String,
    }
});

module.exports = mongoose.model('payment', paymentSchema);


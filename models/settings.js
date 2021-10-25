const mongoose = require('mongoose')

const settingsSchema = mongoose.Schema({
    // packageId: {
    //     type: String, 
    //     // required: true,  
    //     unique: true 
    // },
    packageName: {
        type: String, 
        required: true,  
        unique: true 
    },
    amount:  {
        type: Number,
         required: true
        },
    duration :  {
        // type: String, 
        type: Number, 
        required: true
    },
    currencyCode : {type: String},
});

module.exports = mongoose.model('settings', settingsSchema);


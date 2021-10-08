const mongoose = require('mongoose')

const settingsSchema = mongoose.Schema({
    id: {type: String, required: true},
    amount:  {type: Number, required: true},
    duration :  {type: String, required: true},
    currencyCode : {type: String},
});

module.exports = mongoose.model('settings', settingsSchema);


const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const userSchema = mongoose.Schema({
     name : {type: String, required: true},
     email: {
          type: String, 
          required: true,    
          trim: true,
          unique: true,
          lowercase: true
     },
     password: {type: String, required: true,minlength: 6,},
     id: {type :String},
     UserType: {
          type: String,
          // enum: ['unpaid', 'unpaid', 'registered', 'unregistered'],
          default: 'unpaid'
     },        
     UserTypeBool: {
          type: Boolean,
          default: false
     },        
     transactionId : {type: String},
     // subscriptionId: {
     //      type: Schema.Types.ObjectId,
     //      ref: "settingsSchema",
     //  },
     // packageId:{type: String},
     packageName:{type: String},
     paid_at: { 
          type: String,
     },
     expires_at: { 
          type: String,
     },
     date_today_at: { 
          type: String,
     },
     resetPasswordLink: {
          data: String,
          default: ''
     },
     created_at: { type: Date, required: true, default: Date.now },

     countryCode: {
          type: String,
          required: true,
      },
      phone: {
          type: String,
          required: true,
      },
      verified: {
          type: Boolean,
          default: false,
      },
      authyId: {
           type: String,
      }

});

module.exports = mongoose.model('User', userSchema);


const mongoose = require('mongoose')

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
     paid_at: { 
          type: Date,
     },
     resetPasswordLink: {
          data: String,
          default: ''
     },
     created_at: { type: Date, required: true, default: Date.now }

});

module.exports = mongoose.model('User', userSchema);


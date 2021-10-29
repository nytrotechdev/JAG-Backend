const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const adminSchema = mongoose.Schema({
     name : {
          type: String, 
          required: true,    
     },
     email: {
          type: String, 
          required: true,    
          trim: true,
          unique: true,
          lowercase: true
     },
     password: {type: String,
           required: true,
           minlength: 6,},
     
     resetPasswordLink: {
          data: String,
          default: ''
     }

});

module.exports = mongoose.model('Admin', adminSchema);


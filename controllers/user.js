const { mongoose } = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

// const ObjectId = mongoose.Schema.Types.ObjectId;
const paypal = require("@paypal/checkout-server-sdk");
// require("dotenv").config()
const Token = require("../models/token");
const sendEmail = require("../utils/sendEmails");
// const sendGridEmails = require("../utils/sendGridEmails");
const crypto = require("crypto");
const Joi = require("joi");
const express = require("express");
const router = express.Router();

exports.signin = async (req, res) => {
    const {email , password} = req.body;

    try {
        const existingUser = await User.findOne({email});
        if(!existingUser) return res.status(200).json({message : "user doesn't exist"});

        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
        if(!isPasswordCorrect) return res.status(200).json({message : "Invalid Credentials"})


        if(existingUser){
            console.log(`existingUser`, existingUser, existingUser.UserTypeBool, existingUser.UserType);

            const payDate = existingUser.paid_at

            // const expiryDate = 

            var oneYearFromNow = new Date();
            oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

        }


        const token = jwt.sign({ email: existingUser.email, id:existingUser._id },  process.env.secret, {expiresIn: "3h"} );
        res.status(200).json({result : existingUser, token});

    } catch (error) {
        res.status(500).json({message : " Something went wrong", error})
    }
}

exports.signup = async (req, res) => {
    const {email , password, confirmPassword , firstName, lastName} = req.body;
    try {
        const existingUser = await User.findOne({email});
        
        if(existingUser) return res.status(200).json({message : "user already exist"});

        if(password !== confirmPassword ) return res.status(200).json({message : "passwords don't match"});

        const hashedPassword = await bcrypt.hash(password, 12)

        const result = await User.create({email, password: hashedPassword, name: `${firstName} ${lastName}`});

        const token = jwt.sign({ email: result.email, id: result._id },  process.env.secret, {expiresIn: "3h"} );

        res.status(200).json({result , token});
    } catch (error) {
        res.status(500).json({message : " Something went wrong"})
        
    }

}

exports.update = async (req, res) => {
    try {
            res.status(200).json({result , token});
    } catch (error) {
        res.status(500).json({message : " Something went wrong"})
    }

}

exports.resetpassword = async (req, res) => {

    try {
        const schema = Joi.object({ email: Joi.string().email().required() });
        const { error } = schema.validate(req.body);
        if (error) return res.status(200).send(error.details[0].message);

        const user = await User.findOne({ email: req.body.email });
        if (!user)
            return res.status(200).send("user with given email doesn't exist");

        let token = await Token.findOne({ userId: user._id });
        if (!token) {
            token = await new Token({
                userId: user._id,
                token: crypto.randomBytes(32).toString("hex"),
            }).save();
        }

        const link = `${process.env.BASE_URL}/passwordreset/${user._id}/${token.token}`;
        await sendEmail(user.email, "JAG APP Password reset link", link);

        res.send("password reset link sent to your email account");
    } catch (error) {
        res.send("An error occured");
        console.log(error);
    }
}

exports.resetpasswordtoken = async (req, res) => {
    try {
        const schema = Joi.object({
            password: Joi.string().required()
        });
        const { error } = schema.validate(req.body);
        if (error) return res.status(200).send(error.details[0].message);
        //  const parameters = req.params;
        const user = await User.findById(req.params.userid);
        // console.log(`user`, user);
        if (!user) return res.status(200).json({message : "invalid link or expired"})

        const token = await Token.findOne({
            userId: user._id,
            token: req.params.token,
        });
        if (!token) return res.status(200).json({message : "invalid link or expired"});
        // console.log(`token`, token)

        const unencryptedpass = req.body.password;
        const hashedPassword = await bcrypt.hash(unencryptedpass, 12)
        user.password = hashedPassword;

        await user.save();
        await token.delete();
        res.status(200).json({message :"password reset sucessfully."});
    } catch (error) {
        res.status(500).json({message : "An error occured", error})
        console.log(error);
    }
}

exports.usertype = async (req, res) => {
    try {
        // const {id} = req.params;
        // const _id = 'ObjectId("6152cbc0a7e92c1768a6284b")';

        const email =  "abdulbasit@c.com"
        

        // const UserData = await User.findById({_id});
        const UserData = await User.findOne({email});
        // if(!User) return res.status(404).json({message : "user doesn't exist"});
   
        
        const userStatus = UserData.UserType;
        const userTypeStatus = UserData.UserTypeBool ;

        console.log(`User`, UserData, userStatus, userTypeStatus);

        // 
        res.status(200).json({result : {userStatus, userTypeStatus}});

    } catch (error) {
        res.status(500).json({message : " Something went wrong"})
    }

}

exports.getcreatedorder = async (req, res) => {
        res.render('index', {
            paypalClientId: process.env.PAYPAL_CLIENT_ID 
            })
   
}

exports.createorder = async (req, res) => {


const Environment = process.env.NODE_ENV === "production" ? paypal.core.LiveEnvironment : paypal.core.SandboxEnvironment

const paypalClient = new paypal.core.PayPalHttpClient(
new Environment(
process.env.PAYPAL_CLIENT_ID,
process.env.PAYPAL_CLIENT_SECRET
)
)

const { id } = req.body;
console.log(`id`, id)

// if(!req.params.userid) return res.json({ message : 'Unauthenticated'})

// const user = await User.findById();

// console.log(`user`, req.params)

    const request = new paypal.orders.OrdersCreateRequest()
    request.prefer("return=representation")
    request.requestBody({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
                currency_code: "USD",
                value: 29,
                // breakdown: {
                //     AnnualSubscription: {
                //     currency_code: "USD",
                //     value: 29,
                //   },
                // },
            },
            // items: {
            //     AnnualSubscription: {
            //     currency_code: "USD",
            //     value: 29,
            //      }
            // }
          },
        ],
      })
  
    try {
        const order = await paypalClient.execute(request)
        // res.json({ id: order })
        console.log(`order`, order);
        res.status(200).json({createOrderResult : order})


        if (res.status == 200  || res.status == 201){

            // console.log(`user`, user)
            // const email =  "abdulbasit@nytrotech.com"
            const UserData = await User.findById({id});
            // const UserData = await User.findOne({email});
            if(!UserData) return res.status(404).json({message : "user doesn't exist"});

            console.log(`userData`, userData)
            const updatedUser = await User.findByIdAndUpdate(UserData._id, ...UserData, {paid_at: new Date().toISOString(), UserType:"paid", UserTypeBool: true, new:true } );
    
            const userStatus = UserData.UserType;
            const userTypeStatus = UserData.UserTypeBool ;
            // updatedUser.UserType = "paid";
            // updatedUser.save();
    
            console.log(`Order + User data status`, UserData, updatedUser, userStatus, userTypeStatus);
        }

    } catch (error) {
        res.status(500).json({message : error})
    }

}

exports.createorderwebhook = async (req, res) => {

        try {
            
    // var webhook_json = {
    //     url: 'https://jagapp.nytrotech.net/create-order-webhook',
    //     event_types: [{
    //       name: 'BILLING.SUBSCRIPTION.ACTIVATED'
    //     },
    //     {
    //       name: 'BILLING.SUBSCRIPTION.UPDATED'
    //     },
    //     {
    //       name: 'BILLING.SUBSCRIPTION.EXPIRED'
    //     },
    //     {
    //       name: 'BILLING.SUBSCRIPTION.CANCELLED'
    //     },
    //     {
    //       name: 'PAYMENT.ORDER.CREATED'
    //     },
    //     {
    //       name: 'PAYMENT.CAPTURE.COMPLETED'
    //     }
    
    
    // ]
    //   };

    //   paypal.notification.webhook.create(webhook_json, function (error, webhook) {
    //     if (error) {
    //       console.error(JSON.stringify(error.response));
    //       throw error;
    //     } else {
    //       console.log('Create webhook Response');
    //       console.log(webhook);
    //     }
    //   });
  
            res.status(200).send('....')
        } catch (error) {
            res.status(500).json({message : error})
        }
    
    }

exports.updatePaidUser = async (req,res) => {

    try{
        const id  = req.body.id;
        console.log(`id`, id)
        // const user = await User.findByIdAndUpdate(id);
        
        const user = await User.findByIdAndUpdate(id , {paid_at: new Date().toISOString(), UserType:"paid", UserTypeBool: true, new:true } )

        if(user) return res.status(200).json({message : "Paid For Annual Subscription", userData: user});

        console.log(`user`, user);


    }catch (error) {
        res.status(500).json({message : error})
    }
}

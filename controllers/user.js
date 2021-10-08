const { mongoose } = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const moment = require("moment");

// const ObjectId = mongoose.Schema.Types.ObjectId;
const paypal = require("@paypal/checkout-server-sdk");
// require("dotenv").config()
const Token = require("../models/token");
const sendEmail = require("../utils/sendEmails");
// const sendGridEmails = require("../utils/sendGridEmails");
const crypto = require("crypto");
const Joi = require("joi");
const express = require("express");
const { date } = require("joi");
const router = express.Router();

exports.signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser)
      return res.status(200).json({ message: "user doesn't exist" });

    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!isPasswordCorrect)
      return res.status(200).json({ message: "Invalid Credentials" });

    //         if(existingUser.UserTypeBool){

    //             const payDate = existingUser.paid_at

    //             var expiryDate = new Date(payDate);
    //             expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    //             console.log(`expiryDate`, expiryDate.toISOString())

    //           var DateToday = new Date();
    //           console.log(`DateToday`, DateToday)

    // if (DateToday == expiryDate){
    //     const user = await User.findByIdAndUpdate(existingUser._id , {paid_at: null, UserType:"unpaid", UserTypeBool: false, new:true } )
    // }
    // }

    const token = jwt.sign(
      { email: existingUser.email, id: existingUser._id },
      process.env.secret,
      { expiresIn: "365d" }
    );
    res.status(200).json({ result: existingUser, token });
  } catch (error) {
    res.status(500).json({ message: " Something went wrong" });
  }
};

exports.signup = async (req, res) => {
  const { email, password, confirmPassword, firstName, lastName } = req.body;
  try {
    const existingUser = await User.findOne({ email });

    if (existingUser)
      return res.status(200).json({ message: "user already exist" });

    if (password !== confirmPassword)
      return res.status(200).json({ message: "passwords don't match" });

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await User.create({
      email,
      password: hashedPassword,
      name: `${firstName} ${lastName}`,
    });

    const token = jwt.sign(
      { email: result.email, id: result._id },
      process.env.secret,
      { expiresIn: "365d" }
    );

    res.status(200).json({ result, token });
  } catch (error) {
    res.status(500).json({ message: " Something went wrong" });
  }
};

exports.update = async (req, res) => {
  try {
    res.status(200).json({ result, token });
  } catch (error) {
    res.status(500).json({ message: " Something went wrong" });
  }
};

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
};

exports.resetpasswordtoken = async (req, res) => {
  try {
    const schema = Joi.object({
      password: Joi.string().required(),
    });
    const { error } = schema.validate(req.body);
    if (error) return res.status(200).send(error.details[0].message);
    //  const parameters = req.params;
    const user = await User.findById(req.params.userid);
    // console.log(`user`, user);
    if (!user)
      return res.status(200).json({ message: "invalid link or expired" });

    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });
    if (!token)
      return res.status(200).json({ message: "invalid link or expired" });
    // console.log(`token`, token)

    const unencryptedpass = req.body.password;
    const hashedPassword = await bcrypt.hash(unencryptedpass, 12);
    user.password = hashedPassword;

    await user.save();
    await token.delete();
    res.status(200).json({ message: "password reset sucessfully." });
  } catch (error) {
    res.status(500).json({ message: "An error occured", error });
    console.log(error);
  }
};

exports.getcreatedorder = async (req, res) => {
  res.render("index", {
    paypalClientId: process.env.PAYPAL_CLIENT_ID,
  });
};

exports.createorder = async (req, res) => {
  const Environment =
    process.env.NODE_ENV === "production"
      ? paypal.core.LiveEnvironment
      : paypal.core.SandboxEnvironment;

  const paypalClient = new paypal.core.PayPalHttpClient(
    new Environment(
      process.env.PAYPAL_CLIENT_ID,
      process.env.PAYPAL_CLIENT_SECRET
    )
  );

  const { id } = req.body;
  console.log(`id`, id);

  // if(!req.params.userid) return res.json({ message : 'Unauthenticated'})

  // const user = await User.findById();

  // console.log(`user`, req.params)

  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer("return=representation");
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
  });

  try {
    const order = await paypalClient.execute(request);
    // res.json({ id: order })
    console.log(`order`, order);
    res.status(200).json({ createOrderResult: order });

    if (res.status == 200 || res.status == 201) {
      // console.log(`user`, user)
      // const email =  "abdulbasit@nytrotech.com"
      const UserData = await User.findById({ id });
      // const UserData = await User.findOne({email});
      if (!UserData)
        return res.status(404).json({ message: "user doesn't exist" });

      console.log(`userData`, userData);
      const updatedUser = await User.findByIdAndUpdate(
        UserData._id,
        ...UserData,
        {
          paid_at: new Date().toISOString(),
          UserType: "paid",
          UserTypeBool: true,
          new: true,
        }
      );

      const userStatus = UserData.UserType;
      const userTypeStatus = UserData.UserTypeBool;
      // updatedUser.UserType = "paid";
      // updatedUser.save();

      console.log(
        `Order + User data status`,
        UserData,
        updatedUser,
        userStatus,
        userTypeStatus
      );
    }
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

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

    res.status(200).send("....");
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

exports.updatePaidUser = async (req, res) => {
  try {
    const id = req.body.id;
    
    const TransactionId = req.body.transactionId;
    
    const PackageId = req.body.packageId;

    console.log(`id`, id, TransactionId, PackageId);
    // const user = await User.findByIdAndUpdate(id);


    
    // const PaidDate = moment().format("Do MMMM YYYY");
    // ExpiryDate
    var year  = new Date().getFullYear();
    var month = new Date().getMonth();
    var day   = new Date().getDate();
    var PaidDate  = new Date(year, month, day);
    console.log(`PaidDate`, PaidDate)

    // const ExpiryDate = moment().format("Do MMMM YYYY");
    // ExpiryDate
    var year  = new Date().getFullYear();
    var month = new Date().getMonth();
    var day   = new Date().getDate();
    var ExpiryDate  = new Date(year + 1, month, day);
    console.log(`ExpiryDate`, ExpiryDate)

    const user = await User.findByIdAndUpdate(id, {
    //   paid_at: moment().format("Do MMMM YYYY"),
      paid_at: PaidDate,
      expires_at: ExpiryDate,
      UserType: "paid",
      UserTypeBool: true,
      new: true,
      transactionId: TransactionId,
      // subscriptionId: SubscriptionId,
      packageId: PackageId
    });

    // //setTimeout(() => {
    //     if(user.UserTypeBool){

    //         const payDate = user.paid_at
    //         var expiryDate = new Date(payDate);
    //         expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    //         console.log(`expiryDate`, expiryDate)

    //         // var DateToday = new Date();
    //         // console.log(`DateToday`, DateToday)
    //         // if (DateToday == expiryDate){
    //         // const user = await User.findByIdAndUpdate(user._id , {paid_at: null, UserType:"unpaid", UserTypeBool: false, new:true } )
    //         // }

    //         const updateduserEx = User.findByIdAndUpdate(id , {expires_at: expiryDate,  new:true } )

    //         // console.log(updateduserEx,"updateduserEx");

    //         if(user) return res.status(200).json({message : "Paid For Annual Subscription", updateduserEx: updateduserEx});
    //         else return res.status(200).json({message : "user not found"});

    //         }
    // // }, 2000)

    if (user)
      return res.status(200).json({ message: "Paid For Annual Subscription" });
    else return res.status(200).json({ message: "user not found" });
    // console.log(`user`, user);
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

exports.getUser = async (req, res) => {
  try {
    const { id } = req.query;
    const UserData = await User.findById(id);
    if (!UserData) return res.status(404).json({ message: "user doesn't exist" });

    if (UserData.UserTypeBool) {
    //   const payDate = UserData.paid_at;
      const expiryDate  = UserData.expires_at;
    //   var DateToday =  moment().format("Do MMMM YYYY");
    var year  = new Date().getFullYear();
    var month = new Date().getMonth();
    var day   = new Date().getDate();
    var DateToday  = new Date(year, month, day);

    await User.findByIdAndUpdate(UserData._id , {date_today_at: DateToday , new:true } )
    // console.log(`DateToday`, DateToday, "expiryDate", expiryDate)
    const dateToday = UserData.date_today_at ;


      if (dateToday == expiryDate){
        //   console.log(`DateToday`, DateToday,"dateToday",dateToday, "expiryDate", expiryDate)
          const user = await User.findByIdAndUpdate(UserData._id , {paid_at: null,expires_at: null, UserType:"unpaid", UserTypeBool: false, new:true } )
      }
    }

   

    // console.log(`User`, UserData);
    res.status(200).json({ user: UserData });
  } catch (error) {
    res.status(500).json({ message: " Something went wrong" });
  }
};

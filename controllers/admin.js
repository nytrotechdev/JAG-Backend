const { mongoose } = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const Admin = require("../models/admin");
const Settings = require("../models/settings");
const Payment = require("../models/payment");
const Token = require("../models/token");

const moment = require("moment");
const sendEmail = require("../utils/sendEmails");
const crypto = require("crypto");
const Joi = require("joi");
const express = require("express");
const { date } = require("joi");
const router = express.Router();

exports.adminSignin = async (req, res) => {
  const data = req.body;

  // console.log(req.body)

  let email = data.email
  let password = data.password

  try {
    const existingUser = await Admin.findOne({ email });
    if (!existingUser)
      return res.status(400).json({ message: "user doesn't exist" });

    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!isPasswordCorrect)
      return res.status(422).json({ message: "Invalid Credentials" });

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
    res.status(200).json({ message:"Login" ,result: existingUser, token });
  } catch (error) {
    res.status(500).json({ message: " Something went wrong" });
  }
};

exports.adminSignup = async (req, res) => {
  const { email, password, confirmPassword} = req.body;
  try {
    const existingUser = await Admin.findOne({ email });

    if (existingUser)
      return res.status(422).json({ message: "user already exist" });

    if (password !== confirmPassword)
      return res.status(422).json({ message: "passwords don't match" });

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await Admin.create({
      email,
      password: hashedPassword,
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


exports.createSubscriptionPackage = async (req, res) => {

  // const {  } = req.body;

  // const PackageId = req.body.packageId;
  const PackageName = req.body.packageName;
  const Amount      = req.body.amount;
  const Duration    = req.body.duration;
  const CurrencyCode = req.body.currencyCode;

  console.log(`req.body`, req.body)

  console.log(`Package, amount, duration, currencyCode`, PackageName, Amount, Duration, CurrencyCode)
  
  if (PackageName == undefined || PackageName == null || Amount  == (undefined || null) || Duration  == (undefined || null)){
    return res.status(422).json({message: "please fill all fields"});
    // res.send("please fill all fields");
    // console.log(`message, "please fill all fields"`)
  }


const existingPackageName = await Settings.findOne({ PackageName });
if (existingPackageName) return res.status(422).json({ message: "package name already exists" });

  try {
    const packages = await Settings.create({
      packageName: PackageName,
      amount : Amount,
      duration: Duration,
      currencyCode :  CurrencyCode,
    });

    res.status(200).json({packages: packages});
   
  } catch (error) {

    if(error.code == 11000){
    // console.log(`error.code`, error.code)
      return res.status(422).json({ message: "package name already exists" });
    }
    res.status(500).json({ message: error });
  }
};

exports.updateSubscriptionPackage = async (req, res) => {
  try {
    res.status(200).send("....");
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

exports.getAllSubscriptionPackages = async (req, res) => {
  try {
    
    const packages = await Settings.find();   
    if (packages) return res.status(200).json({ packages: packages });
    if (!packages) return res.status(404).json({ message: "No Packages Available"});

  } catch (error) {
    res.status(500).json({ message: error });
  }
};

exports.deleteSubscriptionPackage = async (req, res) => {
  try {

    const { id } = req.params;

    // console.log(`id`, id)

    const Packageid = await Settings.findById(id);
    if (!Packageid) return res.status(404).json({ message: "package doesn't exist" });

    Packageid.deleteOne();

    res.status(200).send({ pid: Packageid, message: "deleted" });
  } catch (error) {
    res.status(500).json({ message: error });
  }
};


exports.getAllUser = async (req, res) => {
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
exports.updateUser = async (req, res) => {
  try {
    const id = req.body.id;
    console.log(`id`, id);
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

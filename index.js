const express = require('express');

// const bodyParser = require('body-parser');

const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const paypal = require("@paypal/checkout-server-sdk")
const router = express.Router();

const userRoutes = require('./routes/users.js')
const adminRoutes = require('./routes/admin.js')

const app = express();
dotenv.config();

const Environment = process.env.NODE_ENV === "production" ? paypal.core.LiveEnvironmen : paypal.core.SandboxEnvironment
  
  const paypalClient = new paypal.core.PayPalHttpClient(
  new Environment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
  )
)

global.bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({
  extended: true,
  limit: '50mb',
  parameterLimit: 100000
}))
app.use(bodyParser.json({
  limit: '50mb',
  parameterLimit: 100000
}))

// app.use(bodyParser.json({limit: "30mb", extended: true}));

// // app.use(bodyParser.urlencoded({ limit: "30mb", extended: true}));

// app.use(bodyParser.urlencoded({
//   extended: true
// }));

app.use(express.urlencoded({extended: true}));
app.use(express.json())

app.use(cors());

router.get( "/", (req,res) => {
  res.render({msg: 'running'});
})

app.use('/user', userRoutes);
app.use('/admin', adminRoutes);


// var accountSid = process.env.TWILIO_ACCOUNT_SID; // Your Account SID from www.twilio.com/console
// var authToken = process.env.TWILIO_AUTH_TOKEN;   // Your Auth Token from www.twilio.com/console

// const client = require('twilio')(accountSid, authToken);

// client.messages.create({
//   body: 'Hello Friend', 
//   from: '+12677547858', 
//   to: '+923160386368'
// })
// .then(message => console.log(message.sid))
// .catch((err) => console.log(err))

// const MessagingResponse = require("twilio").twiml.MessagingResponse;

//   app.post("/sms", (req, res) => {
//     const twiml = new MessagingResponse();
//     twiml.message("Thanks for signing up!");
//     res.end(twiml.toString());
//   });

const PORT = process.env.PORT || 5001;

mongoose.connect(process.env.CONNECTION_URL, 
  { 
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true
  })
  .then(() => app.listen(PORT, () => console.log(`Server Running on Port: http://localhost:${PORT} connected to DB`)))
  .catch((error) => console.log(`${error.message} did not connect`));

mongoose.set('useFindAndModify', false);


// CONNECTION_URL = mongodb://localhost:27017/diamond
// CONNECTION_URL = mongodb+srv://abdulbasit:abdulbasit@clustermem.z9kek.mongodb.net/diamond?retryWrites=true&w=majority

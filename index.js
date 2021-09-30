const express = require('express');
const bodeParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const paypal = require("@paypal/checkout-server-sdk")
const router = express.Router();

const userRoutes = require('./routes/users.js')

const app = express();
dotenv.config();

const Environment = process.env.NODE_ENV === "production" ? paypal.core.LiveEnvironmen : paypal.core.SandboxEnvironment
  
  const paypalClient = new paypal.core.PayPalHttpClient(
  new Environment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
  )
)

app.use(bodeParser.json({limit: "30mb", extended: true}));
app.use(bodeParser.urlencoded({ limit: "30mb", extended: true}));
app.use(cors());

router.get( "/", (req,res) => {
  res.render({msg: 'running'});
})

app.use('/user', userRoutes);

const PORT = process.env.PORT || 5001;

mongoose.connect(process.env.CONNECTION_URL, 
  { 
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true
  })
  .then(() => app.listen(PORT, () => console.log(`Server Running on Port: http://localhost:${PORT} connected to DB`)))
  .catch((error) => console.log(`${error.message} did not connect`));

mongoose.set('useFindAndModify', false);




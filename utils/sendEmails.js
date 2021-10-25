const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, text) => {

    // console.log(`email`, email);

    try {
        const transporter = nodemailer.createTransport({

            // host: "smtp.mailtrap.io",
            // port: 2525,
            // auth: {
            //   user: "d55d7a86982783",
            //   pass: "f8ee98707a0920"
            // }

            host: "smtp.gmail.com",
            // host:"smtp://smtp.mailtrap.io:2525",
            // host: "smtp.ethereal.email",
            // service: "gmail.googleapis.com",
            service: 'gmail',
            port: 587,
            secure: true,
            // secure: false,
            auth: {
                // type: "login",
                // type: 'OAuth2',
                // user: 'devjs999@gmail.com',
                email: process.env.USER,
                pass: process.env.PASS,
                // tls:{
                //  rejectUnauthorized:false
                // }

            },
            // auth: {
            // type: "OAuth2",
            // user: "devjs999@gmail.com",         
            // clientId: "887528756416-ounc4sj4pda8etfkvlufthr2d01fr8tn.apps.googleusercontent.com",
            // clientSecret: "Ue9KIP5akyFpxuKN5VWXx5t-",
            // // refreshToken: "your_refresh_token"
            // }
            // host: 'smtp.ethereal.email',
            // port: 387,
            // auth: {
            //     // user: 'hayden.williamson@ethereal.email',
            //     // pass: 'bzeGG51RDz9zmZxSb1',
            //     // tls:{
            //     //     rejectUnauthorized:false
            //     // }
            //     // XOAuth2: {
            //     //     user: "devjs999@gmail.com", // Your gmail address.
                                                     
            //     //     clientId: "887528756416-ounc4sj4pda8etfkvlufthr2d01fr8tn.apps.googleusercontent.com",
            //     //     clientSecret: "Ue9KIP5akyFpxuKN5VWXx5t-",
            //     //     refreshToken: "your_refresh_token"
            //     //   }
            // }
        });

        await transporter.sendMail({
            from: "abdul basit JAG Diamond APP",
            to: email,
            subject: subject,
            text: `
            CLick this link to reset your password
            ${text}
            `,
        });

        console.log("email sent sucessfully");
    } catch (error) {
        console.log(error, "email not sent");
    }
};

module.exports = sendEmail;
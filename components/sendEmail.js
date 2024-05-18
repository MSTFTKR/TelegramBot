const nodemailer = require("nodemailer");


const sendMail = async (toEmail, subjectContent, mailContent) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD_KEY,
            },
        });

        let mailData = {
            to: `${toEmail}`,
            subject: `${subjectContent}`,
            text: `${mailContent}`
        };

        return new Promise((resolve, reject) => {
            transporter.sendMail(mailData, function (err, val) {
                if (err) {
                    reject(err); 
                } else {
                    resolve(val.response); 
                }
            });
        });
    } catch (error) {
        throw error; 
    }
}

  module.exports = { sendMail };
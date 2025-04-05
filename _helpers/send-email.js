const nodemailer = require('nodemailer');
const config = require('config.json');

module.exports = sendEmail;

async function sendEmail({to, subject, html, from = config.emailFrom}) {
    const transporter = nodemailer.createTransport (config.smtOptions);
    await transtporter.sendEmail({from, to, subject, html});
}
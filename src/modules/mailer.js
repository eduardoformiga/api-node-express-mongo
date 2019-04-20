const nodemailer = require('nodemailer')
const handlebars = require('handlebars');
var fs = require('fs');
const path = require('path');

const { host, port, user, pass } = require('../config/mailer.json')


async function sendMail(email, token) {

    const transport = nodemailer.createTransport({
        host,
        port,
        auth: { user, pass, }
    });

    const html = fs.readFileSync(path.resolve('src', 'resources', 'mail', 'forgot_pass.html')).toString();
    const template = handlebars.compile(html);

    const data = {
        token
    };

    const result = template(data);

    const sendEmailResult = await transport.sendMail({
        to: email,
        from: 'eduardo.formiga@email.com',
        subject: 'Forgot Password',
        text: 'Forgot Password Text',
        html: result
    })

    return sendEmailResult;

}



module.exports = sendMail
const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require('jsonwebtoken');
const authConfig = require("../../config/auth");
const Constants = require("../utils/constants");
const sendMail = require('../../modules/mailer')

const router = express.Router();

function generateToken(params = {}) {
    return jwt.sign(params, authConfig.secret, {
        expiresIn: Constants.DAY_IN_SECONDS,
    })
}

router.post("/register", async (req, res) => {

    const { email } = req.body;
    if (await User.findOne({ email }))
        return res.status(400).send({ error: 'User already exists' })

    try {
        const user = await User.create(req.body)
        user.password = undefined;
        return res.send({ user, token: generateToken({ id: user.id }) })
    } catch (err) {
        res.status(400).send({ error: 'Registration failed' })
    }

});

router.post('/authenticate', async (req, res) => {

    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user)
        return res.status(400).send({ error: 'User not found' })

    if (!await bcrypt.compare(password, user.password))
        return res.status(400).send({ error: 'Invalid password' })

    user.password = undefined;

    res.send({ user, token: generateToken({ id: user.id }) })

})


router.post('/forgot_password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });

        if (!user)
            return res.status(400).send({ error: 'User not found' })

        const token = crypto.randomBytes(20).toString('hex');

        const nowPlusOneHour = new Date();
        nowPlusOneHour.setHours(nowPlusOneHour.getHours() + 1)


        await User.findOneAndUpdate({ _id: user.id }, {
            '$set': {
                passwordResetToken: token,
                passwordResetExpires: nowPlusOneHour,
            }
        })


        sendMail(email, token).then(result => {
            res.send();
        });


    } catch (err) {
        res.status(400).send({ error: 'Error on forgot password, try again' })
    }
})

router.post('/reset_password', async (req, res) => {
    const { email, token, password } = req.body;
    try {
        const user = await User.findOne({ email })
            .select('+passwordResetToken passwordResetExpires');

        if (!user)
            return res.status(400).send({ error: 'User not found' })

        if (user.passwordResetToken !== token)
            return res.status(400).send({ error: 'Invalid token' })

        const now = new Date();
        if (now > user.passwordResetExpires)
            return res.status(400).send({ error: 'Token expired, try again' })

        user.password = password;
        await user.save();
        res.send();

    } catch (err) {
        res.status(400).send({ error: 'Error on reset password, try again' })
    }
})

module.exports = app => app.use('/auth', router);

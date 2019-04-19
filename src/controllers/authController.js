const express = require("express");
const User = require("../models/User");

const router = express.Router();

router.post("/register", async (req, res) => {

    const { email } = req.body;
    if (await User.findOne({ email }))
        return res.status(400).send({ error: 'User already exists' })

    try {
        const user = await User.create(req.body)
        user.password = undefined;
        return res.send({ user })
    } catch (err) {
        res.status(400).send({ error: 'Registration failed' })
    }

});

module.exports = app => app.use('/auth', router);

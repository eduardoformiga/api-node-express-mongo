const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/noderest", {
    useNewUrlParser: true,
    useCreateIndex: true
});

module.exports = mongoose;

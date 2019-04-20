const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/nodejsrest", {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
});

module.exports = mongoose;

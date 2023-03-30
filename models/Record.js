const mongoose = require("mongoose");

const recordSchema = mongoose.Schema({

    artist: String,
    recordName: String,
    price: {full: String, discounted: String},
    image: String,
    productURL: String,
    genre: String,
    store: String


},
{
    timestamps: true,

})

// Export the record schema as Record
module.exports = {
    Record: mongoose.model("Record", recordSchema)
};
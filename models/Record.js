const mongoose = require("mongoose");

const recordSchema = mongoose.Schema({

    recId: String,
    artist: String,
    recordName: String,
    label: String,
    price: {full: String, discounted: String},
    image: String,
    description: String,
    productURL: String,
    genre: String,
    store: String,
    urls: Array,

},
{
    timestamps: true,

})

// Export the record schema as Record
module.exports = {
    Record: mongoose.model("Record", recordSchema)
};
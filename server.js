const PORT = 8001

// Require Express
const express = require('express')

const app = express()
// Require Mongoose 
const mongoose = require("mongoose");

const kristinaRouter = require("./routes/KristinaRecords/kristina-techno")

app.use("/", kristinaRouter);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

// var MongoClient = require('mongodb').MongoClient;

// Suppress Mongoose Deprecation Warning 
mongoose.set('strictQuery', true)
// Connect to the db
mongoose.connect('mongodb://localhost:27017/', {
    dbName: 'collate',
    useNewUrlParser: true,
    useUnifiedTopology: true 
}, err => err ? console.log(err) : console.log('Connected to database'));


// const fruitSchema = new mongoose.Schema({
//     name: String,
//     rating: Number,
//     review: String,
//     comments: {full: String, original: String},
//   });
  
//   const Fruit = mongoose.model("Fruit", fruitSchema);
  
//   const fruit = new Fruit({
//       name: "Apple",
//       rating: 7,
//       review: "Taste Good",
//       comments: {full: "This is cool", original: "This is not so cool dude"}
//   });
  
//   fruit.save();
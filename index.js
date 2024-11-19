const express = require('express');
const mongoose = require('mongoose');
const app = express();
const Product = require('./models/product.model.js');
const productRoute = require('./routes/product.route.js');
const Vehicle = require ('./models/vehicle.model.js');
const vehicleRoute = require('./routes/vehicle.route.js');

require('dotenv').config();
const uri = process.env.MONGO_URI;
console.log(uri);

app.use(express.json());

app.use(express.urlencoded({extended: false}));



// middleware
app.use("/api/products", productRoute);
app.use("/api/vehicle", vehicleRoute);



app.get('/', (req, res) => {
    res.send("Hello form node api");
});

mongoose.connect(uri)
  .then(() => {
    console.log("Connected to the database!");
    app.listen(3000, () => {
      console.log('Server is running on port 3000');
    });
  })
  .catch(err => console.error('Failed to connect to MongoDB', err));

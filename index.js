const express = require('express');
const mongoose = require('mongoose');
const app = express();
const Product = require('./models/product.model.js');
const productRoute = require('./routes/product.route.js');

const Vehicle = require ('./models/vehicle.model.js');
const vehicleRoute = require('./routes/vehicle.route.js'); //ข้อมูลรถ

const VehicleReturn = require ('./models/vehiclereturn.model.js');
const vehicleReturnRoute = require('./routes/vehiclereturn.route.js'); //คืนรถ

const vehicleStatusRoutes = require('./routes/vehiclestatus.route.js'); //สถานะรถ

const bookingRoutes = require('./routes/booking.route.js');

const bookingStatusRoutes = require('./routes/bookingstatus.route.js');

const missionRoutes = require('./routes/mission.route.js');

const userRoutes = require('./routes/user.route.js');

const adminRoutes = require('./routes/admin.route.js');

const fuelRoutes = require('./routes/fuel.route.js');

const maintenanceRoutes = require('./routes/maintenance.route.js');




require('dotenv').config();
const uri = process.env.MONGO_URI;
console.log(uri);

app.use(express.json());

app.use(express.urlencoded({extended: false}));



// middleware
app.use("/api/products", productRoute);
app.use("/api/vehicles", vehicleRoute);
app.use("/api/vehicle-returns", vehicleReturnRoute);
app.use('/api/vehicle-statuses', vehicleStatusRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/booking-status', bookingStatusRoutes);
app.use('/api/missions', missionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/fuel', fuelRoutes);
app.use('/api/maintenance', maintenanceRoutes);


app.get('/', (req, res) => {
    res.send("Hello form node api");
});

mongoose.connect(uri)
  .then(() => {
    console.log("Connected to the database!");
    app.listen(5000, () => {
      console.log('Server is running on port 5000');
    });
  })
  .catch(err => console.error('Failed to connect to MongoDB', err));

const express = require('express');
const mongoose = require('mongoose');
const app = express();
const authRoutes = require('./routes/auth.route');
const jwt = require('jsonwebtoken'); // ต้องเพิ่มบรรทัดนี้

const cors = require('cors');

const Vehicle = require ('./models/vehicle.model.js');
const vehicleRoute = require('./routes/vehicle.route.js'); //ข้อมูลรถ

const VehicleReturn = require ('./models/vehiclereturn.model.js');
const vehicleReturnRoute = require('./routes/vehiclereturn.route.js'); //คืนรถ



const bookingRoutes = require('./routes/booking.route.js');



const missionRoutes = require('./routes/mission.route.js');

const userRoutes = require('./routes/user.route.js');

const adminRoutes = require('./routes/admin.route.js');



const dashboardRoute = require('./routes/dashboard.route');  // นำเข้า route ของ dashboard

const vehicleRoutes = require('./routes/vehicle.route'); 



require('dotenv').config();
const uri = process.env.MONGO_URI;
console.log(uri);

app.use(express.json());

app.use(express.urlencoded({extended: false}));

app.use(cors());


// middleware

app.use("/api/vehicles", vehicleRoute);
app.use("/api/vehicle-returns", vehicleReturnRoute);

app.use('/api/bookings', bookingRoutes);

app.use('/api/missions', missionRoutes);
// middleware
app.use('/api', dashboardRoute);  // กำหนด route dashboard ที่ /api/dashboard

// ใช้ route ของ admin ซึ่งมีการใช้ auth middleware ใน route นั้น ๆ
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', vehicleRoutes);  // รวม route เข้า API path



app.get('/api/vehicles', async (req, res) => {
  try {
    const vehicles = await Vehicle.find({}, 'license_plate _id');  // ใช้ license_plate แทน name
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching vehicles', error });
  }
});

  
app.post('/api/missions', async (req, res) => {
  try {
    const { mission_name, description, status, assigned_vehicle_id, assigned_user_id, start_date, end_date } = req.body;

    // ตรวจสอบข้อมูลที่ได้รับมา
    if (!mission_name || !description || !assigned_vehicle_id || !assigned_user_id || !start_date || !end_date) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const mission = new Mission({
      mission_name,
      description,
      status: status || 'pending',  // กำหนดค่า default เป็น 'pending'
      assigned_vehicle_id,
      assigned_user_id,
      start_date: new Date(start_date),  // แปลงเป็น Date object
      end_date: new Date(end_date),      // แปลงเป็น Date object
    });

    await mission.save();

    res.status(201).json({ message: 'Mission created successfully', mission });
  } catch (error) {
    console.error('Error creating mission:', error);  // แสดงข้อผิดพลาดใน server log
    res.status(500).json({ message: 'Failed to create mission', error: error.message });
  }
});

app.post('/api/vehicle-returns', (req, res) => {
  const { booking_id, vehicle_id, user_id, return_date, condition, fuel_level, remark } = req.body;
  if (!booking_id || !vehicle_id || !user_id || !return_date) {
    return res.status(400).send('Missing required fields');
  }

  // Process and save the return
});




app.get('/', (req, res) => {
    res.send("Hello form APT API");
});

// Route สำหรับการ login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // ค้นหาผู้ใช้จากฐานข้อมูลตาม email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // ตรวจสอบรหัสผ่าน
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // สร้าง JWT token
    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email, role: user.role },
      'your_secret_key', // รหัสลับที่ใช้ในการเข้ารหัส JWT (เก็บใน environment variable จริงๆ)
      { expiresIn: '1h' } // ตั้งเวลาหมดอายุ token (เช่น 1 ชั่วโมง)
    );

    // ส่ง token กลับไปยัง client
    res.json({ token });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/vehicle-returns/:id', async (req, res) => {
  const { id } = req.params;
  // ค้นหาข้อมูลตาม id ในฐานข้อมูล
  const vehicleReturnData = await VehicleReturn.findById(id);
  if (!vehicleReturnData) {
    return res.status(404).json({ message: 'Vehicle return data not found' });
  }
  res.json(vehicleReturnData);
});




mongoose.connect(uri)
  .then(() => {
      console.log("Connected to the database!");
    app.listen(5000, () => {
      console.log('Server is running on port 5000');
    });
  })
  .catch(err => console.error('Failed to connect to MongoDB', err));

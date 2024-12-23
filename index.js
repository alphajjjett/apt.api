const express = require("express");
const mongoose = require("mongoose");
const app = express();
const authRoutes = require("./routes/auth.route");
const jwt = require("jsonwebtoken");
const path = require("path");
const multer = require("multer");
const { Storage } = require("@google-cloud/storage");
require("dotenv").config();
const { 
  updateUser,
  } = require('./controllers/user.controller');


// ตั้งค่า multer สำหรับการอัพโหลดไฟล์
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "../apt.api/uploads/");
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });
const upload = multer({ 
  storage: multer.memoryStorage() ,
});

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_BUCKET_NAME
});
const bucketName = process.env.GOOGLE_CLOUD_BUCKET_NAME
const bucket = storage.bucket(bucketName)



app.use("/uploads", express.static(path.join(__dirname, "../apt.api/uploads")));

const cors = require("cors");
const Vehicle = require("./models/vehicle.model.js");
const vehicleRoute = require("./routes/vehicle.route.js");
const VehicleReturn = require("./models/vehiclereturn.model.js");
const vehicleReturnRoute = require("./routes/vehiclereturn.route.js");
const bookingRoutes = require("./routes/booking.route.js");
const missionRoutes = require("./routes/mission.route.js");
const userRoutes = require("./routes/user.route.js");
const adminRoutes = require("./routes/admin.route.js");
const dashboardRoute = require("./routes/dashboard.route");
const vehicleRoutes = require("./routes/vehicle.route");

const uri = process.env.MONGO_URI;
console.log(uri);

app.use(express.json());

app.use(express.urlencoded({ extended: false }));

app.use(cors());

// middleware

app.use("/api/vehicles", vehicleRoute);
app.use("/api/vehicle-returns", vehicleReturnRoute);
app.use("/api/bookings", bookingRoutes);
app.use("/api/missions", missionRoutes);
app.use("/api", dashboardRoute); // กำหนด route dashboard ที่ /api/dashboard

// ใช้ route ของ admin ซึ่งมีการใช้ auth middleware ใน route นั้น ๆ
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", vehicleRoutes); // รวม route เข้า API path

app.get("/api/vehicles", async (req, res) => {
  try {
    const vehicles = await Vehicle.find({}, "license_plate _id"); // ใช้ license_plate แทน name
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: "Error fetching vehicles", error });
  }
});

app.post("/api/missions", async (req, res) => {
  try {
    const {
      mission_name,
      description,
      status,
      assigned_vehicle_id,
      assigned_user_id,
      start_date,
      end_date,
    } = req.body;

    // ตรวจสอบข้อมูลที่ได้รับมา
    if (
      !mission_name ||
      !description ||
      !assigned_vehicle_id ||
      !assigned_user_id ||
      !start_date ||
      !end_date
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const mission = new Mission({
      mission_name,
      description,
      status: status || "pending",
      assigned_vehicle_id,
      assigned_user_id,
      start_date: new Date(start_date),
      end_date: new Date(end_date),
    });

    await mission.save();

    res.status(201).json({ message: "Mission created successfully", mission });
  } catch (error) {
    console.error("Error creating mission:", error);
    res
      .status(500)
      .json({ message: "Failed to create mission", error: error.message });
  }
});

app.post("/api/vehicle-returns", (req, res) => {
  const {
    booking_id,
    vehicle_id,
    user_id,
    return_date,
    condition,
    fuel_level,
    remark,
  } = req.body;
  if (!booking_id || !vehicle_id || !user_id || !return_date) {
    return res.status(400).send("Missing required fields");
  }
});

// Route สำหรับการ login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // ค้นหาผู้ใช้จากฐานข้อมูลตาม email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // ตรวจสอบรหัสผ่าน
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // สร้าง JWT token
    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email, role: user.role },
      "your_secret_key", // รหัสลับที่ใช้ในการเข้ารหัส JWT (เก็บใน environment variable จริงๆ)
      { expiresIn: "1h" } // ตั้งเวลาหมดอายุ token (เช่น 1 ชั่วโมง)
    );

    // ส่ง token กลับไปยัง client
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/vehicle-returns/:id", async (req, res) => {
  const { id } = req.params;
  // ค้นหาข้อมูลตาม id ในฐานข้อมูล
  const vehicleReturnData = await VehicleReturn.findById(id);
  if (!vehicleReturnData) {
    return res.status(404).json({ message: "Vehicle return data not found" });
  }
  res.json(vehicleReturnData);
});

// API สำหรับอัพโหลดรูปภาพ
app.post("/api/upload", upload.single("file"),async (req, res) => {

  const { id } = req.body;

  if (!req.file) {
    return res.status(400).send("No file uploaded");
  }

  try{
    const blob = bucket.file(req.file.originalname);
    const blobStream = blob.createWriteStream();

    blobStream.on("error", (err) => {
      console.log(err);
      res.status(500).json({message: "upload image failed"})
    })
    console.log();
    
    blobStream.on('finish', async () => {
      await blob.makePublic();
      const publicUrl = `https://storage.googleapis.com/${bucketName}/${blob.name}`;

      const updateReq = {
        params: { id },
        body: { profileImage: publicUrl } 
      };

      const updateRes = {
        json: (data) => res.json({ message: "Image uploaded and user updated", data }),
        status: (statusCode) => ({
            json: (data) => res.status(statusCode).json(data),
        }),
      };


      await updateUser(updateReq,updateRes)
    });

    blobStream.end(req.file.buffer);
  }catch(error){
    console.error("Error uploading image", error);
    return res.status(500).json({message: "Failed to upload image", error: error.message});
  }
});

app.get("/", (req, res) => {
  res.send("Hello form APT API");
});

mongoose
  .connect(uri)
  .then(() => {
    console.log("Connected to the database!");
    app.listen(5000, () => {
      console.log("Server is running on port 5000");
    });
  })
  .catch((err) => console.error("Failed to connect to MongoDB", err));

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();

//  LINE Messaging API
const line = require("@line/bot-sdk");

//  ตั้งค่าการเชื่อมต่อกับ LINE API
const lineConfig = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

const lineClient = new line.Client(lineConfig);

//  นำเข้า Routes ต่างๆ
const authRoutes = require("./routes/auth.route");
const vehicleRoute = require("./routes/vehicle.route.js");
const fuelRoute = require("./routes/fuel.route.js");
const returnRoute = require("./routes/return.route.js");
const missionRoutes = require("./routes/mission.route.js");
const userRoutes = require("./routes/user.route.js");
const adminRoutes = require("./routes/admin.route.js");
const dashboardRoute = require("./routes/dashboard.route");
const maintenanceRoute = require("./routes/maintenance.route.js");

// เชื่อมต่อ MongoDB
const uri = process.env.MONGO_URI;
mongoose
  .connect(uri)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

//  ใช้งาน Routes ต่างๆ
app.use("/api/vehicles", vehicleRoute);
app.use("/api/fuel", fuelRoute);
app.use("/api/return", returnRoute);
app.use("/api/maintenance", maintenanceRoute);
app.use("/api/missions", missionRoutes);
app.use("/api", dashboardRoute);
app.use("/api/admins", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

// 🔹 Endpoint ทดสอบ
app.get("/", (req, res) => {
  res.send("Hello from APT API with LINE Integration!");
});

// ==============================
//  เพิ่ม LINE Webhook API 
// ==============================

// Webhook API สำหรับรับข้อความจาก LINE
app.post("/api/line/webhook", line.middleware(lineConfig), async (req, res) => {
  try {
    const events = req.body.events;

    await Promise.all(
      events.map(async (event) => {
        if (event.type === "message" && event.message.type === "text") {
          await lineClient.replyMessage(event.replyToken, {
            type: "text",
            text: `คุณพิมพ์ว่า: ${event.message.text}`,
          });
        }
      })
    );

    res.status(200).send("OK");
  } catch (error) {
    console.error("Error handling LINE webhook:", error);
    res.status(500).json({ message: "Webhook error", error });
  }
});

//API สำหรับส่ง Push Message ไปยังผู้ใช้ LINE
app.post("/api/line/send", async (req, res) => {
  const { userId, message } = req.body;

  if (!userId || !message) {
    return res.status(400).json({ message: "Missing userId or message" });
  }

  try {
    await lineClient.pushMessage(userId, { type: "text", text: message });
    res.json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("Error sending LINE message:", error);
    res.status(500).json({ message: "Failed to send message", error });
  }
});

// ==============================
// เริ่มเซิร์ฟเวอร์
// ==============================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

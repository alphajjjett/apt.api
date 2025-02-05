const express = require("express");
const {
  getAllUsers,
  registerUser,
  getUserById,
  loginUser,
  getCurrentUser,
  updateUser,
  deleteUser,
} = require("../controllers/user.controller");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const multer = require("multer");
const { Storage } = require("@google-cloud/storage");
require("dotenv").config();

const upload = multer({
  storage: multer.memoryStorage(),
});

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_BUCKET_NAME,
});
const bucketName = process.env.GOOGLE_CLOUD_BUCKET_NAME;
storage.bucket(bucketName);

// Route สำหรับดึงข้อมูลผู้ใช้ทั้งหมด
router.get("/", getAllUsers);

// Route for user registration
router.post("/register", registerUser); // This should match the endpoint you are hitting from the frontend

// Route สำหรับหา ID USer
router.get("/:id", getUserById);

//route login
router.post("/login", loginUser);

router.get("/login", loginUser);

// Route สำหรับดึงข้อมูล user ที่ล็อกอินอยู่
router.get("/me", getCurrentUser);

// Route สำหรับแก้ไขข้อมูล user ที่ล็อกอินอยู่
router.put("/:id", auth, upload.single("file"), updateUser);

// Route สำหรับลบผู้ใช้
router.delete("/:id", auth, deleteUser);

module.exports = router;

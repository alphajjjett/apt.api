const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const FormData = require("form-data");
const axios = require("axios");

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        selfid: user.selfid,
        role: user.role,
        email: user.email,
        name: user.name,
        phone: user.phone,
        description: user.description,
        profileImage: user.profileImage,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
};

const registerUser = async (req, res) => {
  const { name, email, password, description, selfid, phone } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      selfid,
      description,
    });

    await newUser.save();

    const token = jwt.sign(
      {
        id: newUser._id,
        selfid: newUser.selfid,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        description: newUser.description,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({ message: "User registered successfully", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error registering user", error });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.id !== id) {
      return res
        .status(403)
        .json({ message: "You are not authorized to access this data." });
    }

    const user = await User.findById(id, "-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id, "-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user data", error });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  // const decodedToken = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(
    req.headers.authorization.split(" ")[1],
    process.env.JWT_SECRET
  );
  const { name, email, description, phone, password } = req.body;
  let profileImage = req.file;

  console.log("decoded is =========>", decoded);

  if (profileImage) {
    const formData = new FormData();
    formData.append("file", profileImage.buffer, profileImage.originalname);

    try {
      const { data } = await axios.post(
        "http://45.144.167.78:8080/upload-to-gcloud",
        formData,
        {
          headers: {
            ...formData.getHeaders(),
          },
        }
      );
      profileImage = data.publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      return res.status(500).json({ message: "Error uploading image" });
    }
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.description = description || user.description;
    user.profileImage = profileImage || user.profileImage;

    // ตรวจสอบว่าผู้ใช้ได้ส่งรหัสผ่านใหม่เข้ามาหรือไม่
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    const token = jwt.sign(
      {
        id: decoded.id,
        selfid: decoded.selfid,
        name: decoded.name,
        email: decoded.email,
        phone: decoded.phone,
        role: decoded.role,
        description: decoded.description,
        profileImage: user.profileImage,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const updatedUser = await user.save();
    // res.json(updatedUser);

    res.status(200).json({ updatedUser, token });
  } catch (error) {
    console.error("error is :", error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user._id.toString() !== req.user.id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "You do not have permission to delete this user" });
    }
    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res
      .status(500)
      .json({ message: "Error deleting user", error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  loginUser,
  registerUser,
  updateUser,
  getCurrentUser,
  deleteUser,
};

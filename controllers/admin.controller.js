const Admin = require("../models/admin.model"); // Assuming Admin shares the same User model
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email, role: "admin" });
    if (!admin) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: admin._id,
        role: admin.role,
        email: admin.email,
        name: admin.name,
        description: admin.description,
        profileImage: admin.profileImage,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
};

const registerAdmin = async (req, res) => {
  const { name, email, password, description } = req.body;

  try {
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({
      name,
      email,
      password: hashedPassword,
      description,
      role: "admin",
    });

    await newAdmin.save();

    const token = jwt.sign(
      {
        id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
        description: newAdmin.description,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({ message: "Admin registered successfully", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error registering admin", error });
  }
};

const getAllAdmins = async (req, res) => {
  try {
    const admin = req.user; // Admin from the JWT token
    if (admin.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const users = await Admin.find({}, "-password"); // Fetching all users (excluding passwords)
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
};

const getAdminById = async (req, res) => {
  try {
    const { id } = req.params;
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.id !== id && decoded.role !== "admin") {
      return res
        .status(403)
        .json({ message: "You are not authorized to access this data." });
    }

    const admin = await Admin.findById(id, "-password");
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const updateAdmin = async (req, res) => {
  const { id } = req.params;

  const { name, email, description, profileImage } = req.body;

  try {
    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    admin.name = name || admin.name;
    admin.email = email || admin.email;
    admin.description = description || admin.description;
    admin.profileImage = profileImage || admin.profileImage;

    const updatedAdmin = await admin.save();

    res.json(updatedAdmin);
  } catch (error) {
    console.error("Error updating admin:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteAdmin = async (req, res) => {
  try {
    const adminId = req.params.id;

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    if (admin._id.toString() !== req.user.id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "You do not have permission to delete this admin" });
    }
    await Admin.findByIdAndDelete(adminId);
    res.status(200).json({ message: "Admin deleted successfully" });
  } catch (error) {
    console.error("Error deleting admin:", error);
    res.status(500).json({ message: "Error deleting admin", error: error.message });
  }
};

module.exports = {
  getAllAdmins,
  getAdminById,
  loginAdmin,
  registerAdmin,
  updateAdmin,
  deleteAdmin,
};

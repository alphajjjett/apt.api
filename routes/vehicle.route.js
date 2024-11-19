const express = require("express");
const Product = require("../models/vehicle.model.js");
const router = express.Router();
const {getAllVehicles, createVehicle} = require('../controllers/vehicle.controller.js')

router.get('/', getAllVehicles);

router.get("/:id", getAllVehicles);

router.post("/", createVehicle);

router.put("/:id", createVehicle); //update

router.delete("/:id", createVehicle); //delete



module.exports = router;
const express = require('express');
const router = express.Router();
const { createReturn, getAllReturns, updateReturn } = require('../controllers/return.controller');

// POST request for creating a return record
router.post('/:missionId', createReturn); // use POST to create a return

// GET all return records
router.get('/', getAllReturns);

// PUT request for updating an existing return record
router.put('/:id', updateReturn); // use PUT to update a return

module.exports = router;

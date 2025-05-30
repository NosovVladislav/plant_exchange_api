const express = require('express');
const router = express.Router();
const plantsController = require('../controllers/plantsController');

router.get('/', plantsController.getPlants);
router.post('/', plantsController.createPlant);

module.exports = router;

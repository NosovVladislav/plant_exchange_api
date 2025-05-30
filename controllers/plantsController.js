const plantModel = require('../models/plantModel');

const getPlants = async (req, res) => {
    try {
        const plants = await plantModel.getAllPlants();
        res.status(200).json(plants);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const createPlant = async (req, res) => {
    const { plant_name, description, type, image_url, contact_number } = req.body;
    const user_id = req.user.id;
    try {
        const newPlant = await plantModel.addPlant(user_id, plant_name, description, type, image_url, contact_number);
        res.status(201).json(newPlant);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getPlants, createPlant };

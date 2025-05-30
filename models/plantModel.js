const db = require('../config/db');

const getAllPlants = async () => {
    const result = await db.query('SELECT * FROM plants');
    return result.rows;
};

const addPlant = async (user_id, plant_name, description, type, image_url, contact_number) => {
    const result = await db.query(
        'INSERT INTO plants (user_id, plant_name, description, type, image_url, contact_number) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [user_id, plant_name, description, type, image_url, contact_number]
    );
    return result.rows[0];
};

module.exports = { getAllPlants, addPlant };

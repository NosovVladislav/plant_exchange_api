const db = require('../config/db');

const createUser = async (username, password, region) => {
    const result = await db.query(
        'INSERT INTO users (username, password, region) VALUES ($1, $2, $3) RETURNING *',
        [username, password, region]
    );
    return result.rows[0];
};

const findUserByUsername = async (username) => {
    const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    return result.rows[0];
};

module.exports = { createUser, findUserByUsername };

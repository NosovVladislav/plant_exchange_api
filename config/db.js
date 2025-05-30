const { Client } = require('pg');

const client = new Client({
    user: 'plant_user',
    host: 'localhost',
    database: 'plant_exchange',
    password: 'plant_password',
    port: 5432,
});

client.connect();
module.exports = client;

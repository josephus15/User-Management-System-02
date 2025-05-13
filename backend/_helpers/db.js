const config = require('../config.json');
const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');
require('dotenv').config();

module.exports = db = {};

initialize();

async function initialize() {
    // Load database configuration
    const dbConfig = {
        host: process.env.DB_HOST || config.database.host || 'localhost',
        port: process.env.DB_PORT || config.database.port || 3306,
        user: process.env.DB_USER || config.database.user || 'root',
        password: process.env.DB_PASSWORD || config.database.password || '',
        database: process.env.DB_NAME || config.database.database || 'user_management_db'
    };

    // Step 1: Create database if it doesn't exist
    try {
        const connection = await mysql.createConnection({
            host: dbConfig.host,
            port: dbConfig.port,
            user: dbConfig.user,
            password: dbConfig.password
        });

        console.log('Connected to MySQL server');
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\`;`);
        await connection.end();
        console.log(`Database '${dbConfig.database}' ensured.`);
    } catch (err) {
        console.error('❌ Database connection failed:', err.message);
        return;
    }

    // Step 2: Initialize Sequelize
    const sequelize = new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, {
        host: dbConfig.host,
        port: dbConfig.port,
        dialect: 'mysql',
        logging: false, // Set to true to enable SQL logging
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    });

    // Step 3: Test Sequelize connection
    try {
        await sequelize.authenticate();
        console.log('✅ Sequelize connection established successfully.');
    } catch (error) {
        console.error('❌ Unable to connect to the database via Sequelize:', error.message);
        return;
    }

    // Step 4: Define models
    db.Account = require('../accounts/account.model')(sequelize);
    db.RefreshToken = require('../accounts/refresh-token.model')(sequelize);
    db.Employee = require('../employees/employee.model')(sequelize);
    db.Department = require('../departments/department.model')(sequelize);
    db.Workflow = require('../workflows/workflow.model')(sequelize);
    db.Request = require('../requests/request.model')(sequelize);
    db.RequestItem = require('../requests/request-item.model')(sequelize);

    // Step 5: Define relationships
    db.Account.hasMany(db.RefreshToken, { onDelete: 'CASCADE' });
    db.RefreshToken.belongsTo(db.Account);

    db.Account.hasOne(db.Employee);
    db.Employee.belongsTo(db.Account);

    db.Department.hasMany(db.Employee);
    db.Employee.belongsTo(db.Department);

    db.Employee.hasMany(db.Workflow);
    db.Workflow.belongsTo(db.Employee);

    db.Employee.hasMany(db.Request);
    db.Request.belongsTo(db.Employee);

    db.Request.hasMany(db.RequestItem, { onDelete: 'CASCADE' });
    db.RequestItem.belongsTo(db.Request);

    // Step 6: Sync models with DB
    try {
        await sequelize.sync({ alter: true });
        console.log('✅ Database models synchronized successfully.');
    } catch (syncError) {
        console.error('❌ Error synchronizing database models:', syncError.message);
    }

    // Export sequelize for use elsewhere if needed
    db.sequelize = sequelize;
}

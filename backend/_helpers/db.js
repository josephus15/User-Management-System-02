const config = require('../config.json');
const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');

module.exports = db = {};

initialize();

async function initialize() {
    // Database configuration
    const { host, port, user, password, database } = config.database;
    
    // Test MySQL connection first
    try {
        const testConnection = await mysql.createConnection({ 
            host, 
            port, 
            user, 
            password 
        });
        console.log(`Connected to MySQL server as id ${testConnection.threadId}`);
        await testConnection.end();
    } catch (err) {
        console.error('MySQL connection test failed:', err);
        throw err;
    }

    // Create database if not exists
    const creationConnection = await mysql.createConnection({ 
        host, 
        port, 
        user, 
        password 
    });
    await creationConnection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
    await creationConnection.end();

    // Initialize Sequelize
    const sequelize = new Sequelize(database, user, password, { 
        host,
        port,
        dialect: 'mysql',
        logging: console.log, // Optional: enable logging
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    });

    // Test Sequelize connection
    try {
        await sequelize.authenticate();
        console.log('Sequelize connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        throw error;
    }

    // Define all models
    db.Account = require('../accounts/account.model')(sequelize);
    db.RefreshToken = require('../accounts/refresh-token.model')(sequelize);
    db.Employee = require('../employees/employee.model')(sequelize);
    db.Department = require('../departments/department.model')(sequelize);
    db.Workflow = require('../workflows/workflow.model')(sequelize);
    db.Request = require('../requests/request.model')(sequelize);
    db.RequestItem = require('../requests/request-item.model')(sequelize);

    // Define relationships
    // Account relationships
    db.Account.hasMany(db.RefreshToken, { onDelete: 'CASCADE' });
    db.RefreshToken.belongsTo(db.Account);

    // Employee relationships
    db.Account.hasOne(db.Employee);
    db.Employee.belongsTo(db.Account);

    db.Department.hasMany(db.Employee);
    db.Employee.belongsTo(db.Department);

    // Workflow relationships
    db.Employee.hasMany(db.Workflow);
    db.Workflow.belongsTo(db.Employee);

    // Request relationships
    db.Employee.hasMany(db.Request);
    db.Request.belongsTo(db.Employee);

    db.Request.hasMany(db.RequestItem, { onDelete: 'CASCADE' });
    db.RequestItem.belongsTo(db.Request);

    // Sync all models with database
    try {
        await sequelize.sync({ alter: true });
        console.log('Database synchronized successfully');
    } catch (syncError) {
        console.error('Error synchronizing database:', syncError);
        throw syncError;
    }
}
const config = require('../config.json');
const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');
require('dotenv').config(); // Add this line at the top

module.exports = db = {};

initialize();

async function initialize() {
    // Use environment variables if available, otherwise fall back to config.json
    const dbConfig = {
        host: process.env.DB_HOST || config.database.host,
        port: process.env.DB_PORT || config.database.port || 3306,
        user: process.env.DB_USER || config.database.user,
        password: process.env.DB_PASSWORD || config.database.password,
        database: process.env.DB_NAME || config.database.database
    };

    // Test MySQL connection first
    try {
        const connection = await mysql.createConnection({
            host: dbConfig.host,
            port: dbConfig.port,
            user: dbConfig.user,
            password: dbConfig.password
        });
        console.log(`Connected to MySQL server as id ${connection.threadId}`);
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\`;`);
        await connection.end();
    } catch (err) {
        console.error('Database connection failed:', err);
        throw err;
    }

    // Initialize Sequelize
    const sequelize = new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, {
        host: dbConfig.host,
        port: dbConfig.port,
        dialect: 'mysql',
        logging: console.log,
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
        console.log('Sequelize connection established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        throw error;
    }

    // Define all models (YOUR EXISTING CODE)
    db.Account = require('../accounts/account.model')(sequelize);
    db.RefreshToken = require('../accounts/refresh-token.model')(sequelize);
    db.Employee = require('../employees/employee.model')(sequelize);
    db.Department = require('../departments/department.model')(sequelize);
    db.Workflow = require('../workflows/workflow.model')(sequelize);
    db.Request = require('../requests/request.model')(sequelize);
    db.RequestItem = require('../requests/request-item.model')(sequelize);

    // Define relationships (YOUR EXISTING CODE)
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

    // Sync all models with database
    try {
        await sequelize.sync({ alter: true });
        console.log('Database synchronized successfully');
    } catch (syncError) {
        console.error('Error synchronizing database:', syncError);
        throw syncError;
    }
}
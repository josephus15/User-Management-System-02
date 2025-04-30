const config = require('../config.json');  
const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');

module.exports = db = {};

initialize();

async function initialize() {
    const { host, port, user, password, database } = config.database;
    const connection = await mysql.createConnection({ host, port, user, password });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
    const sequelize = new Sequelize(database, user, password, { dialect: 'mysql' });
    
    // Define models
    db.Account = require('../accounts/account.model')(sequelize);
    db.RefreshToken = require('../accounts/refresh-token.model')(sequelize);
    
    // New models for employee management
    db.Employee = require('../employees/employee.model')(sequelize);
    db.Department = require('../departments/department.model')(sequelize);
    db.Workflow = require('../workflows/workflow.model')(sequelize);
    db.Request = require('../requests/request.model')(sequelize);
    db.RequestItem = require('../requests/request-item.model')(sequelize);
    
    // Define relationships
    // Existing relationships
    db.Account.hasMany(db.RefreshToken, { onDelete: 'CASCADE' });
    db.RefreshToken.belongsTo(db.Account);
    
    // New relationships
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
    await sequelize.sync({ alter: true });
}
const express = require('express');
const router = express.Router();
const db = require('../_helpers/db');
const authorize = require('../_middleware/authorize');
const Role = require('../_helpers/role');

// Routes
router.post('/', authorize(), create);
router.get('/', authorize(), getAll);
router.get('/:id', authorize(), getById);
router.put('/:id', authorize(), update);
router.delete('/:id', authorize(), _delete);
router.put('/:id/status', authorize(Role.Admin), updateStatus);

async function create(req, res, next) {
    try {
        // Create the request with associated request items
        const request = await db.Request.create({
            ...req.body,
            employeeId: req.body.employeeId
        });
        
        if (req.body.items && req.body.items.length) {
            const requestItems = req.body.items.map(item => ({
                ...item,
                requestId: request.id
            }));
            await db.RequestItem.bulkCreate(requestItems);
        }
        
        const createdRequest = await db.Request.findByPk(request.id, {
            include: [
                { model: db.Employee },
                { model: db.RequestItem }
            ]
        });
        
        res.status(201).json(createdRequest);
    } catch (err) { 
        next(err); 
    }
}

async function getAll(req, res, next) {
    try {
        // Admin can see all requests, regular users only see their own
        const options = {
            include: [
                { model: db.Employee },
                { model: db.RequestItem }
            ]
        };
        
        if (req.user.role !== Role.Admin) {
            // Find employee associated with current account
            const employee = await db.Employee.findOne({ 
                where: { accountId: req.user.id } 
            });
            
            if (!employee) {
                return res.status(403).json({ message: 'No employee record associated with your account' });
            }
            
            options.where = { employeeId: employee.id };
        }
        
        const requests = await db.Request.findAll(options);
        res.json(requests);
    } catch (err) { 
        next(err); 
    }
}

async function getById(req, res, next) {
    try {
        const request = await db.Request.findByPk(req.params.id, {
            include: [
                { model: db.Employee },
                { model: db.RequestItem }
            ]
        });
        
        if (!request) throw new Error('Request not found');
        
        // Check if user has permission to view this request
        if (req.user.role !== Role.Admin) {
            const employee = await db.Employee.findOne({ 
                where: { accountId: req.user.id } 
            });
            
            if (employee.id !== request.employeeId) {
                return res.status(403).json({ message: 'Unauthorized' });
            }
        }
        
        res.json(request);
    } catch (err) { 
        next(err); 
    }
}

async function update(req, res, next) {
    try {
        const request = await db.Request.findByPk(req.params.id);
        if (!request) throw new Error('Request not found');
        
        // Check if user has permission to update this request
        if (req.user.role !== Role.Admin) {
            const employee = await db.Employee.findOne({ 
                where: { accountId: req.user.id } 
            });
            
            if (employee.id !== request.employeeId) {
                return res.status(403).json({ message: 'Unauthorized' });
            }
            
            // Regular users can only update pending requests
            if (request.status !== 'Pending') {
                return res.status(400).json({ message: 'Cannot update request that is not pending' });
            }
        }
        
        // Update request and items
        await request.update(req.body);
        
        if (req.body.items && req.body.items.length) {
            // Delete existing items
            await db.RequestItem.destroy({ where: { requestId: request.id } });
            
            // Create new items
            const requestItems = req.body.items.map(item => ({
                ...item,
                requestId: request.id
            }));
            await db.RequestItem.bulkCreate(requestItems);
        }
        
        const updatedRequest = await db.Request.findByPk(request.id, {
            include: [
                { model: db.Employee },
                { model: db.RequestItem }
            ]
        });
        
        res.json(updatedRequest);
    } catch (err) { 
        next(err); 
    }
}

async function _delete(req, res, next) {
    try {
        const request = await db.Request.findByPk(req.params.id);
        if (!request) throw new Error('Request not found');
        
        // Check if user has permission to delete this request
        if (req.user.role !== Role.Admin) {
            const employee = await db.Employee.findOne({ 
                where: { accountId: req.user.id } 
            });
            
            if (employee.id !== request.employeeId) {
                return res.status(403).json({ message: 'Unauthorized' });
            }
            
            // Regular users can only delete pending requests
            if (request.status !== 'Pending') {
                return res.status(400).json({ message: 'Cannot delete request that is not pending' });
            }
        }
        
        await request.destroy();
        res.json({ message: 'Request deleted' });
    } catch (err) { 
        next(err); 
    }
}

async function updateStatus(req, res, next) {
    try {
        const request = await db.Request.findByPk(req.params.id);
        if (!request) throw new Error('Request not found');
        
        // Only admin can update status
        if (req.user.role !== Role.Admin) {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        
        // Validate status value
        if (!['Pending', 'Approved', 'Rejected'].includes(req.body.status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }
        
        await request.update({ 
            status: req.body.status,
            comments: req.body.comments || request.comments
        });
        
        const updatedRequest = await db.Request.findByPk(request.id, {
            include: [
                { model: db.Employee },
                { model: db.RequestItem }
            ]
        });
        
        res.json(updatedRequest);
    } catch (err) { 
        next(err); 
    }
}

module.exports = router;
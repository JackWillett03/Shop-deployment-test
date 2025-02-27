const jwt = require('jsonwebtoken');
const StaffLogins = require('../models/Staff');

// Makes sure the user is a allowed member of staff
const authoriseUser = ({ allowStaff = false, allowManager = false, allowOwner = false }) => {
    return async (req, res, next) => {
        try {

            // Get the token
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                return res.status(401).json({ message: 'Access token is missing or invalid' });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
            req.user = decoded;

            const staff = await StaffLogins.findById(req.user.id); // Find the staff member
            if (!staff) {
                return res.status(404).json({ message: 'User not found' });
            }

            if (
                (allowOwner && staff.IsOwner) || // Owners have the highest access level
                (allowManager && staff.IsManager) || // Managers have a lower access level
                (allowStaff && !staff.IsOwner && !staff.IsManager) // Staff have lowest of staff levels only customers have less permissions
            ) {
                return next(); // User is authorised
            }

            return res.status(403).json({ message: 'Access denied: Insufficient permissions' });
        } catch (error) {
            console.error(error);
            return res.status(401).json({ message: 'Invalid or expired token' });
        }
    };
};

module.exports = authoriseUser;

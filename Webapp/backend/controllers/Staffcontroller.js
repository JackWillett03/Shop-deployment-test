const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const StaffLogins = require('../models/Staff');
const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*()_\-+={}\[\]|\\:;'",<>\./?])(?=.*[A-Z])(?=.{8,})/; // at least 8 characters, 1 capital, at least 1 number, and at least 1 symbol for password

exports.addStaff = async (req, res) => { // Add new staff
    try {
        const { Username, Password, ShopId, IsManager, IsOwner } = req.body;

        if (!passwordRegex.test(Password)) { // Check password
            return res.status(400).json({ message: 'Password must be at least 8 characters long, have a capital, contain at least one number and one symbol' });
        }

        let shopObjectId = null;
        if (ShopId) {
            shopObjectId = new mongoose.Types.ObjectId(ShopId); // Convert ShopId to ObjectId if provided
        }

        // Encrypt the password before saving it
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(Password, salt);

        const newStaff = new StaffLogins({
            Username,
            Password: hashedPassword,
            ShopId: shopObjectId,
            IsManager,
            IsOwner,
        });

        await newStaff.save(); // Save it to the database
        res.status(200).json(newStaff);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.login = async (req, res) => { // Login
    try {
        const { Username, Password } = req.body;

        // Find the staff by username
        const staff = await StaffLogins.findOne({ Username });
        if (!staff) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Compare the password
        const isMatch = await bcrypt.compare(Password, staff.Password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Create the JWT token
        const payload = {
            id: staff._id,
            ShopId: staff.ShopId,
            isManager: staff.IsManager,
            isOwner: staff.IsOwner,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getStaff = async (req, res) => { // Get all staff
    try {
        const staff = await StaffLogins.find();
        res.status(200).json(staff);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getStaffByShopId = async (req, res) => { // Get staff by ShopId
    try {
        const { shopId } = req.params;
        const shopObjectId = new mongoose.Types.ObjectId(shopId);
        const staff = await StaffLogins.find({ ShopId: shopObjectId });

        if (!staff || staff.length === 0) {
            return res.status(404).json({ message: 'Staff not found for the ShopId' });
        }
        res.status(200).json(staff);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.getStaffByIsManager = async (req, res) => { // Get staff if they're a manager
    try {
        const isManager = req.params.isManager === 'true'; // Convert to bool
        const staff = await StaffLogins.find({ IsManager: isManager });

        if (!staff || staff.length === 0) {
            return res.status(404).json({ message: 'No staff found with the manager role' });
        }
        res.status(200).json(staff);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getStaffById = async (req, res) => { // Get staff by Id
    try {
        const { id } = req.params; // Get the Id

        const staff = await StaffLogins.findById(id); // Find the staff member by their Id
        
        if (!staff) {
            return res.status(404).json({ message: 'Staff not found' });
        }
        
        res.status(200).json(staff);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.updateStaff = async (req, res) => { // Update staff by Id
    try {
        const { Username, Password, ShopId, IsManager, IsOwner } = req.body;

        if (!passwordRegex.test(Password)) { // Check password
            return res.status(400).json({ message: 'Password must be at least 8 characters long, have a capital, contain at least one number and one symbol' });
        }

        let shopObjectId = null;
        if (ShopId) {
            shopObjectId = new mongoose.Types.ObjectId(ShopId); // Convert ShopId to ObjectId if its added
        }

        // Prepare the update data
        let updateData = { 
            Username,
            ShopId: shopObjectId,
            IsManager, 
            IsOwner 
        };

        // If password is provided, hash it
        if (Password) {
            const salt = await bcrypt.genSalt(10);
            updateData.Password = await bcrypt.hash(Password, salt);
        }

        const updatedStaff = await StaffLogins.findByIdAndUpdate(
            req.params.id, // The staff id
            updateData, // Updated data
            { new: true } // Return the updated info
        );

        if (!updatedStaff) {
            return res.status(404).json({ message: 'Staff not found' });
        }

        res.status(200).json(updatedStaff);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.deleteStaff = async (req, res) => { // Delete staff by Id
    try {
        const deletedStaff = await StaffLogins.findByIdAndDelete(req.params.id);
        if (!deletedStaff) {
            return res.status(404).json({ message: 'Staff not found' });
        }
        res.status(200).json({ message: 'Staff deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

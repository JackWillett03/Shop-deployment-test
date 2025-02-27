const User = require('../models/Users');
const bcrypt = require('bcrypt');
const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*()_\-+={}\[\]|\\:;'",<>\./?])(?=.*[A-Z])(?=.{8,})/; // at least 8 characters, 1 capital, at least 1 number, and at least 1 symbol for password
const jwt = require('jsonwebtoken');

// Register new user (mostly taken from a previous project)
exports.register = async (req, res) => {
    try {
        const { Username, Email, Password } = req.body;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Check if the email format is valid
        if (!emailRegex.test(Email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        if (!passwordRegex.test(Password)) { // Check the password is valid
            return res.status(400).json({ message: 'Password must be at least 8 characters long, have a capital, contain at least one number and one symbol' });
        }

        // Check if the username or email already exists
        const existingUsername = await User.findOne({
            Username: { $regex: new RegExp('^' + Username + '$', 'i') } // Case-insensitive check for Username
        });

        if (existingUsername) {
            return res.status(409).json({ message: 'Username already exists' });
        }

        const existingEmail = await User.findOne({ Email });

        if (existingEmail) {
            return res.status(409).json({ message: 'Email already exists' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(Password, salt);

        // Create a new user
        const newUser = new User({
            Username,
            Email,
            Password: hashedPassword,
        });

        await newUser.save(); // Save it to the database
        res.status(200).json(newUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// User login (mostly taken from a previous project)
exports.login = async (req, res) => {
    try {
        const { Username, Password } = req.body;

        // Find the user by username
        const user = await User.findOne({ Username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Compare the password with the hashed password
        const isMatch = await bcrypt.compare(Password, user.Password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid login' });
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h'}); // Creates JWT Token

        res.status(200).json({token});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get a user by username 
exports.getUserByUsername = async (req, res) => {
    try {
        const { username } = req.params;
        console.log('Searching for username:', username);
        const user = await User.findOne({ Username: { $regex: new RegExp('^' + username + '$', 'i') } });


        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update user by username
exports.updateUser = async (req, res) => {
    try {
        const { username } = req.params; // Get username from the URL
        const { Email, Password, CurrentPassword } = req.body; // Get email, new password, and current password

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Check if the email is in the correct format
        if (Email && !emailRegex.test(Email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        // Make sure the password has all the parts it needs
        if (Password && !passwordRegex.test(Password)) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long, have a capital, contain at least one number and one symbol' });
        }

        // Check the user exists
        const user = await User.findOne({ Username: { $regex: new RegExp('^' + username + '$', 'i') } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check the passwords match
        if (CurrentPassword) {
            const isMatch = await bcrypt.compare(CurrentPassword, user.Password); // Compare current password with the hashed one in the database
            if (!isMatch) {
                return res.status(401).json({ message: 'Current password is incorrect' });
            }
        }

        // Check if the email exists
        if (Email) {
            const existingEmail = await User.findOne({ Email });
            if (existingEmail && existingEmail.Username !== user.Username) {
                return res.status(409).json({ message: 'Email already exists' });
            }
        }

        let updateData = {};

        if (Email) {
            updateData.Email = Email; // Update the email
        }

        if (Password) {
            const salt = await bcrypt.genSalt(10);
            updateData.Password = await bcrypt.hash(Password, salt); // Hash the password
        }

        // Update the user
        const updatedUser = await User.findOneAndUpdate(
            { Username: user.Username }, // Use the original username
            updateData,
            { new: true }
        );

        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a user by username
exports.deleteUser = async (req, res) => {
    try {
        const { username } = req.params;  // Takes the username from the route

        const userToDelete = await User.findOne({ Username: username }); // Find the username
        if (!userToDelete) {
            return res.status(404).json({ message: 'User not found' });
        }

        await User.deleteOne({ Username: username }); // Delete user by username
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

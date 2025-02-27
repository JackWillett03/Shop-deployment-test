// (mostly taken from a previous project)
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  Username: { type: String, required: true, unique: true, trim: true, },
  Email: { type: String, required: true, unique: true, }, 
  Password: { type: String, required: true,},
});

const User = mongoose.model('Users', UserSchema, 'Users');
module.exports = User; // Export so can be accessed by other node modules
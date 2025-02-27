const mongoose = require('mongoose');

const StaffSchema = new mongoose.Schema({
  ShopId: { type: mongoose.Schema.Types.ObjectId, ref: 'ShopList', required: false, },
  Username: {  type: String, required: true, unique: true, trim: true, },
  Password: { type: String, required: true, },
  IsManager: { type: Boolean, default: false, },
  IsOwner: {type: Boolean, default: false, },
});

const StaffLogins = mongoose.model('Staff', StaffSchema);
module.exports = StaffLogins;  // Export so can be accessed by other node modules
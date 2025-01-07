const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  phoneNumber:String,
  name:String,
  gift:mongoose.Types.ObjectId,
  isSpinned: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});
userSchema.pre('save', function (next) {
  if (this.isModified()) {
    this.updatedAt = Date.now();
  }
  next();
});
const userModel = mongoose.model('user', userSchema);
module.exports = userModel;
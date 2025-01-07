const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  userType:Array,
  password:String,
  email:String,
  createdBy:String,
  modifiedBy:String,
  fcmToken:String, 
  isDeleted:{
    type: Boolean,
    default: false
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  otpVerified: {
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
const userModel = mongoose.model('admin', userSchema);
module.exports = userModel;
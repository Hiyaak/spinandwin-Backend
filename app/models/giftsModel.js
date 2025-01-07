const mongoose = require('mongoose');
const giftSchema= new mongoose.Schema({
  gifts:Array,
  userId:mongoose.Types.ObjectId,
  count:Number,
  winningGifts:Array,
  isCompleted:{
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
giftSchema.pre('save', function (next) {
  if (this.isModified()) {
    this.updatedAt = Date.now();
  }
  next();
});
const giftModel = mongoose.model('gift', giftSchema);
module.exports = giftModel;
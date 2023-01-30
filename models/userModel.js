const { kStringMaxLength } = require('buffer');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'user must have a name'],
  },

  email: {
    type: String,
    required: [true, 'enter email ID'],
    unique: [true, 'email already exists'],
    validate: [validator.isEmail, 'enter valid email'],
  },
  role: {
    type: String,
    enum: ['user', 'member', 'admin'],
  },
  pass: {
    type: String,
    required: [true, 'must enter password'],
    select: false,
  },
  passConfirm: {
    type: String,
    required: [true, 'must confirm password'],
    validate: {
      validator: function (el) {
        return el === this.pass;
      },
      message: 'passwords do not match',
    },
  },
  passChangedAt: Date,
  passResetToken: String,
  passResetExpiry: Date,
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('pass')) return next();
  this.pass = await bcrypt.hash(this.pass, 12);
  this.passConfirm = undefined;
  next();
});

userSchema.methods.checkPass = async function (fieldPass, docPass) {
  return await bcrypt.compare(fieldPass, docPass);
};

userSchema.methods.passChange = function (issueTime) {
  if (this.passChangedAt) {
    const changeTime = parseInt(this.passChangedAt.getTime() / 1000, 10);
    return changeTime > issueTime;
  }
  return false;
};

userSchema.methods.passwordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passResetExpiry = Date.now() + 5 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;

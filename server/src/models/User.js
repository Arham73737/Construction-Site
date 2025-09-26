import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ['admin', 'builder', 'painter', 'plumber', 'carpenter', 'electrician'],
      required: true
    },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare plain text password with hashed password
userSchema.methods.matchPassword = async function (plain) {
  return await bcrypt.compare(plain, this.password);
};

export const User = mongoose.model('User', userSchema);
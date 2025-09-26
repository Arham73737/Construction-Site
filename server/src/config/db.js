import mongoose from 'mongoose';

export const connectDB = async (mongoUri) => {
  mongoose.set('strictQuery', true);
  await mongoose.connect(mongoUri, {
    autoIndex: true
  });
  console.log('✅ MongoDB connected');
};

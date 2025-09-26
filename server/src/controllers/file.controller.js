import mongoose from 'mongoose';
import { MongoClient, GridFSBucket, ObjectId } from 'mongodb';

let bucketCache = null;

const getBucket = async () => {
  if (bucketCache) return bucketCache;
  const client = await MongoClient.connect(process.env.MONGO_URI);
  const dbName = process.env.MONGO_URI.split('/').pop().split('?')[0];
  const db = client.db(dbName);
  bucketCache = new GridFSBucket(db, { bucketName: 'uploads' });
  return bucketCache;
};

export const streamFile = async (req, res) => {
  try {
    const fileId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      return res.status(400).json({ message: 'Invalid file id' });
    }

    const bucket = await getBucket();
    const files = await bucket.find({ _id: new ObjectId(fileId) }).toArray();
    if (!files || files.length === 0) {
      return res.status(404).json({ message: 'File not found' });
    }

    const file = files[0];
    res.setHeader('Content-Type', file.contentType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${file.filename}"`);

    const downloadStream = bucket.openDownloadStream(new ObjectId(fileId));
    downloadStream.on('error', () => res.status(404).json({ message: 'File not found' }));
    downloadStream.pipe(res);
  } catch (err) {
    console.error('Stream file error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

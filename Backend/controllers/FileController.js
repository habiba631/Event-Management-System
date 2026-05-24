const mongoose = require('mongoose');

function getGridFSBucket(bucketName) {
  return new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName });
}

function writeToGridFS(bucket, buffer, filename, contentType) {
  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename, { contentType });
    uploadStream.end(buffer);
    uploadStream.on('finish', () => resolve(uploadStream.id));
    uploadStream.on('error', reject);
  });
}

async function deleteFromGridFS(bucket, idString) {
  try {
    await bucket.delete(new mongoose.Types.ObjectId(idString));
  } catch {
    // File may not exist; ignore
  }
}

async function serveProfilePicture(req, res) {
  try {
    const bucket = getGridFSBucket('profilePictures');
    const id = new mongoose.Types.ObjectId(req.params.id);
    const files = await bucket.find({ _id: id }).toArray();
    if (!files.length) return res.status(404).json({ message: 'File not found' });

    res.set('Content-Type', files[0].contentType || 'image/jpeg');
    bucket.openDownloadStream(id).pipe(res);
  } catch {
    return res.status(404).json({ message: 'File not found' });
  }
}

async function serveTaxRegistry(req, res) {
  try {
    const bucket = getGridFSBucket('taxRegistries');
    const id = new mongoose.Types.ObjectId(req.params.id);
    const files = await bucket.find({ _id: id }).toArray();
    if (!files.length) return res.status(404).json({ message: 'File not found' });

    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', `inline; filename="${files[0].filename}"`);
    bucket.openDownloadStream(id).pipe(res);
  } catch {
    return res.status(404).json({ message: 'File not found' });
  }
}

module.exports = { getGridFSBucket, writeToGridFS, deleteFromGridFS, serveProfilePicture, serveTaxRegistry };

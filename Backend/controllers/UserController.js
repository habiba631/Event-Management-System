const User = require("../models/User");
const { getGridFSBucket, writeToGridFS, deleteFromGridFS } = require("./FileController");

async function createUser(req, res) {
  try {
    const user = await User.create(req.body);
    return res.status(201).json(user); // OK STATUS
  } catch (error) {
    return res.status(400).json({ message: error.message }); // BAD REQUEST STATUS
  }
}

async function getAllUsers(req, res) {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function getUserById(req, res) {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const updatedUser = await User.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(updatedUser);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

async function updateSelf(req, res) {
  try {
    const userId = req.user._id;
    const { role, password, isActive, ...updates } = req.body;

    const updated = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "Profile updated successfully", user: updated });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

async function updateProfilePicture(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const userId = req.user._id;
    const bucket = getGridFSBucket('profilePictures');

    const currentUser = await User.findById(userId);
    if (currentUser?.profileImage) {
      await deleteFromGridFS(bucket, currentUser.profileImage);
    }

    const fileId = await writeToGridFS(
      bucket,
      req.file.buffer,
      `${userId}-${Date.now()}-${req.file.originalname}`,
      req.file.mimetype
    );

    const updated = await User.findByIdAndUpdate(
      userId,
      { profileImage: fileId.toString() },
      { new: true }
    );

    return res.status(200).json({ message: 'Profile picture updated', user: updated });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

async function updateTaxRegistry(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No PDF file provided' });
    }

    const userId = req.user._id;
    const bucket = getGridFSBucket('taxRegistries');

    const currentUser = await User.findById(userId);
    if (currentUser?.organizerProfile?.taxRegistry) {
      await deleteFromGridFS(bucket, currentUser.organizerProfile.taxRegistry);
    }

    const fileId = await writeToGridFS(
      bucket,
      req.file.buffer,
      `${userId}-${Date.now()}-${req.file.originalname}`,
      'application/pdf'
    );

    const updated = await User.findByIdAndUpdate(
      userId,
      { 'organizerProfile.taxRegistry': fileId.toString() },
      { new: true }
    );

    return res.status(200).json({ message: 'Tax registry updated', user: updated });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateSelf,
  updateProfilePicture,
  updateTaxRegistry,
};

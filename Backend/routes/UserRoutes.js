const express = require("express");
const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateSelf,
  updateProfilePicture,
  updateTaxRegistry,
} = require("../controllers/UserController");
const { protect, restrictTo } = require("../middleware/auth");
const { uploadProfilePicture, uploadTaxRegistry } = require("../middleware/upload");

const router = express.Router();
router.put("/me", protect, updateSelf);
router.post("/me/profile-picture", protect, uploadProfilePicture, updateProfilePicture);
router.post("/me/tax-registry", protect, restrictTo("EventOrganizer"), uploadTaxRegistry, updateTaxRegistry);

router.post("/", protect, restrictTo("Admin"), createUser);
router.get("/", protect, restrictTo("Admin"), getAllUsers);
router.get("/:id", protect, restrictTo("Admin"), getUserById);
router.put("/:id", protect, restrictTo("Admin"), updateUser);
router.delete("/:id", protect, restrictTo("Admin"), deleteUser);

module.exports = router;
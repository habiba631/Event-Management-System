const express = require("express");
const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateSelf,
} = require("../controllers/UserController");
const { protect, restrictTo } = require("../middleware/auth");

const router = express.Router();
router.put("/me", protect, updateSelf);

router.post("/", protect, restrictTo("Admin"), createUser);
router.get("/", protect, restrictTo("Admin"), getAllUsers);
router.get("/:id", protect, restrictTo("Admin"), getUserById);
router.put("/:id", protect, restrictTo("Admin"), updateUser);
router.delete("/:id", protect, restrictTo("Admin"), deleteUser);

module.exports = router;
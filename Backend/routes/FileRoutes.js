const express = require('express');
const { serveProfilePicture, serveTaxRegistry } = require('../controllers/FileController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.get('/profile-pictures/:id', serveProfilePicture);
router.get('/tax-registries/:id', protect, restrictTo('Admin', 'EventOrganizer'), serveTaxRegistry);

module.exports = router;

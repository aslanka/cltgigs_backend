const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const {
  checkBookmarkStatus,
  toggleBookmark,
  getUserBookmarks
} = require('../controllers/bookmarkController');

router.get('/check/:gigId', authenticate, checkBookmarkStatus);
router.post('/toggle/:gigId', authenticate, toggleBookmark);
router.get('/user', authenticate, getUserBookmarks);

module.exports = router;
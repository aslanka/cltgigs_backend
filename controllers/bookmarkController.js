const Bookmark = require('../models/Bookmark');
const Gig = require('../models/Gig');

exports.checkBookmarkStatus = async (req, res) => {
  try {
    const { gigId } = req.params;
    const userId = req.user.userId;

    const bookmark = await Bookmark.findOne({
      user_id: userId,
      gig_id: gigId
    });

    res.json({ isBookmarked: !!bookmark });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.toggleBookmark = async (req, res) => {
  try {
    const { gigId } = req.params;
    const userId = req.user.userId;

    // Check if gig exists
    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ error: 'Gig not found' });
    }

    const existingBookmark = await Bookmark.findOne({
      user_id: userId,
      gig_id: gigId
    });

    if (existingBookmark) {
      await Bookmark.deleteOne({ _id: existingBookmark._id });
      return res.json({ isBookmarked: false });
    }

    const newBookmark = new Bookmark({
      user_id: userId,
      gig_id: gigId
    });

    await newBookmark.save();
    res.json({ isBookmarked: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getUserBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ user_id: req.user.userId })
      .populate({
        path: 'gig_id',
        populate: {
          path: 'user_id',
          select: 'name profile_pic_url'
        }
      })
      .sort({ created_at: -1 });

    res.json(bookmarks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
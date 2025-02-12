const User = require('../models/User'); // Add this import at the top

// controllers/leaderboardController.js
// controllers/leaderboardController.js
exports.getLeaderboard = async (req, res) => {
  try {
    const { timeframe } = req.query;
    
    // For weekly and monthly, filter by updatedAt.
    let dateFilter = {};
    if (timeframe === 'weekly') {
      dateFilter = { updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } };
    } else if (timeframe === 'monthly') {
      dateFilter = { updatedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } };
    }
    
    // If timeframe is 'alltime', dateFilter remains {}.
    const users = await User.aggregate([
      { $match: dateFilter },
      { $sort: { xp: -1 } },
      { $project: { name: 1, profile_pic_url: 1, xp: 1, badges: 1 } },
      { $limit: 100 }
    ]);
    
    // Add rank numbers
    const rankedUsers = users.map((user, index) => ({
      ...user,
      rank: index + 1
    }));
    
    res.json(rankedUsers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

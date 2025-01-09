const Gig = require('../models/Gig');
const Attachment = require('../models/Attachment');
const { resizeImage } = require('../middlewares/upload');

exports.getAllGigs = async (req, res) => {
  try {
    // Extract query parameters with defaults
    const {
      searchTerm = '',
      category = 'All',
      sortBy = 'date_desc',
      page = 1,
      limit = 20
    } = req.query;

    // Build MongoDB filter
    const filter = {};
    if (searchTerm) {
      filter.$text = { $search: searchTerm };
    }
    if (category && category !== 'All') {
      filter.category = category;
    }
    if(zipCode) {            // filter by zipcode if provided
      filter.zipcode = zipCode;
    }

    // Determine sort criteria
    let sortCriteria;
    // If using full-text search, sort by relevance score first
    if (searchTerm) {
      sortCriteria = { score: { $meta: "textScore" } };
    } else {
      switch (sortBy) {
        case 'price_asc':
          sortCriteria = { price: 1 };
          break;
        case 'price_desc':
          sortCriteria = { price: -1 };
          break;
        case 'date_asc':
          sortCriteria = { created_at: 1 };
          break;
        case 'date_desc':
        default:
          sortCriteria = { created_at: -1 };
          break;
      }
    }

    // Convert page and limit to numbers and calculate skip
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Query database with filters, sorting, and pagination
    let query = Gig.find(filter)
      .populate('user_id', 'name')
      .skip(skip)
      .limit(limitNum);

    // If searchTerm provided, include projection of text score and sort by it
    if (searchTerm) {
      query = query
        .sort(sortCriteria)
        .select({ score: { $meta: "textScore" } });
    } else {
      query = query.sort(sortCriteria);
    }

    const gigsPromise = query;
    const countPromise = Gig.countDocuments(filter);

    // Execute queries in parallel
    const [gigs, total] = await Promise.all([gigsPromise, countPromise]);

    return res.json({ gigs, total });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.createGig = async (req, res) => {
  try {
    const { title, description, price, category_id, zipcode } = req.body;
    const userId = req.user.userId;

    const gig = new Gig({
      user_id: userId,
      title,
      description,
      price,
      category_id,
      zipcode // store zipcode
    });
    await gig.save();

    if (req.file) {
      await resizeImage(req.file.path);
      await Attachment.create({
        type: 'gig',
        foreign_key_id: gig._id,
        file_url: req.file.path
      });
    }

    return res.status(201).json({ message: 'Gig created', gigId: gig._id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.getGigDetails = async (req, res) => {
  try {
    const { gigId } = req.params;
    const gig = await Gig.findById(gigId).populate('user_id', 'name');
    if (!gig) {
      return res.status(404).json({ error: 'Gig not found' });
    }

    const attachments = await Attachment.find({ type: 'gig', foreign_key_id: gigId });
    return res.json({ gig, attachments });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.getMyGigs = async (req, res) => {
  try {
    const userId = req.user.userId;
    const gigs = await Gig.find({ user_id: userId }).sort({ created_at: -1 });
    return res.json(gigs);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.updateGig = async (req, res) => {
  try {
    const { gigId } = req.params;
    const { title, description, price } = req.body;
    const userId = req.user.userId;

    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ error: 'Gig not found' });
    }
    if (gig.user_id.toString() !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    gig.title = title || gig.title;
    gig.description = description || gig.description;
    gig.price = price || gig.price;
    await gig.save();

    return res.json({ message: 'Gig updated', gig });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteGig = async (req, res) => {
  try {
    const { gigId } = req.params;
    const userId = req.user.userId;

    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ error: 'Gig not found' });
    }
    if (gig.user_id.toString() !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Delete gig and attachments
    await Gig.findByIdAndDelete(gigId);
    await Attachment.deleteMany({ type: 'gig', foreign_key_id: gigId });

    return res.json({ message: 'Gig deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};


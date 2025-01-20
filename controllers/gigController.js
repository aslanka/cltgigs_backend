const Gig = require('../models/Gig');
const Bid = require('../models/Bid');
const Attachment = require('../models/Attachment');
const { resizeImage } = require('../middlewares/upload');
const { findZipcodesWithinWithDistance } = require('../services/zipcodeService');

exports.getAllGigs = async (req, res) => {
  try {
    const {
      searchTerm = '',
      category = 'All',
      sortBy = 'date_desc',
      page = 1,
      limit = 20,
      zipCode,
      distance,
      minBudget,
      maxBudget,
      isVolunteer,
      tags,
    } = req.query;

    const filter = {};

    // Search by text (title or description)
    if (searchTerm) {
      filter.$text = { $search: searchTerm };
    }

    // Filter by category
    if (category && category !== 'All') {
      filter.category = category;
    }

    // Filter by tags (array of strings)
    if (tags) {
      filter.tags = { $in: tags.split(',') };
    }

    // Filter by volunteer status
    if (isVolunteer !== undefined) {
      filter.is_volunteer = isVolunteer === 'true';
    }

    // Filter by budget range
    if (minBudget && maxBudget) {
      filter.calculated_average_budget = {
        $gte: parseFloat(minBudget),
        $lte: parseFloat(maxBudget),
      };
    } else if (minBudget) {
      filter.calculated_average_budget = { $gte: parseFloat(minBudget) };
    } else if (maxBudget) {
      filter.calculated_average_budget = { $lte: parseFloat(maxBudget) };
    }

    // Filter by zipcode and distance
    let distanceMap = {};
    if (zipCode && distance) {
      try {
        const nearbyZipsWithDistance = await findZipcodesWithinWithDistance(
          zipCode,
          parseFloat(distance)
        );
        filter.zipcode = { $in: nearbyZipsWithDistance.map((nz) => nz.zip) };
        nearbyZipsWithDistance.forEach((nz) => {
          distanceMap[nz.zip] = nz.distance;
        });
      } catch (error) {
        console.error('Error fetching nearby zip codes:', error);
      }
    }

    // Sorting criteria
    let sortCriteria;
    if (searchTerm) {
      sortCriteria = { score: { $meta: 'textScore' } };
    } else {
      switch (sortBy) {
        case 'price_asc':
          sortCriteria = { calculated_average_budget: 1 };
          break;
        case 'price_desc':
          sortCriteria = { calculated_average_budget: -1 };
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

    // Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Query gigs with filters, sorting, and pagination
    let query = Gig.find(filter)
      .populate('user_id', 'name profile_pic_url')
      .skip(skip)
      .limit(limitNum);

    if (searchTerm) {
      query = query.sort(sortCriteria).select({ score: { $meta: 'textScore' } });
    } else {
      query = query.sort(sortCriteria);
    }

    // Execute queries in parallel
    const [gigs, total] = await Promise.all([
      query.exec(),
      Gig.countDocuments(filter),
    ]);

    // Fetch attachments for gigs
    const gigIds = gigs.map((gig) => gig._id);
    const attachments = await Attachment.find({
      type: 'gig',
      foreign_key_id: { $in: gigIds },
    });

    const attachmentsByGigId = {};
    attachments.forEach((att) => {
      attachmentsByGigId[att.foreign_key_id] = att;
    });

    // Add attachments and distance to gigs
    const gigsWithAttachments = gigs.map((gig) => {
      const gigObj = gig.toObject();
      gigObj.attachment = attachmentsByGigId[gig._id] || null;
      if (distanceMap[gig.zipcode]) {
        gigObj.distance = distanceMap[gig.zipcode];
      }
      return gigObj;
    });

    // Aggregate bid counts for all fetched gigs
    const bidsAgg = await Bid.aggregate([
      { $match: { gig_id: { $in: gigIds } } },
      { $group: { _id: '$gig_id', count: { $sum: 1 } } },
    ]);

    const bidCountMap = {};
    bidsAgg.forEach((b) => {
      bidCountMap[b._id.toString()] = b.count;
    });

    // Add bid count to gigs
    gigsWithAttachments.forEach((gig) => {
      gig.bidCount = bidCountMap[gig._id.toString()] || 0;
    });

    return res.json({ gigs: gigsWithAttachments, total });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};


exports.createGig = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      zipcode,
      start_date,
      completion_date,
      team_size,
      gig_tasks,
      budget_range_min,
      budget_range_max,
      is_volunteer,
      tags,
    } = req.body;

    const userId = req.user.userId;

    // Validate budget fields if not a volunteer gig
    if (!is_volunteer) {
      if (!budget_range_min || !budget_range_max) {
        return res.status(400).json({ error: 'Budget range is required for non-volunteer gigs' });
      }
      if (isNaN(budget_range_min) || isNaN(budget_range_max)) {
        return res.status(400).json({ error: 'Budget range must be valid numbers' });
      }
      if (budget_range_min > budget_range_max) {
        return res.status(400).json({ error: 'Budget range min must be less than or equal to max' });
      }
    }

    // Calculate average budget if not a volunteer gig
    const calculated_average_budget = is_volunteer
      ? null
      : (parseFloat(budget_range_min) + parseFloat(budget_range_max)) / 2;

    // Create gig object
    const gig = new Gig({
      user_id: userId,
      title,
      description,
      category,
      zipcode,
      start_date: start_date || null,
      completion_date: completion_date || null,
      team_size: team_size || 1,
      gig_tasks: gig_tasks || [],
      budget_range_min: is_volunteer ? null : parseFloat(budget_range_min),
      budget_range_max: is_volunteer ? null : parseFloat(budget_range_max),
      calculated_average_budget,
      is_volunteer,
      tags: tags || [],
    });

    // Save gig to database
    await gig.save();

    // Handle attachment if file is uploaded
    if (req.file) {
      try {
        await resizeImage(req.file.path);
        await Attachment.create({
          type: 'gig',
          foreign_key_id: gig._id,
          file_url: req.file.path,
        });
      } catch (error) {
        console.error('Error handling attachment:', error);
        return res.status(500).json({ error: 'Failed to process attachment' });
      }
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


const Gig = require('../models/Gig');
const Bid = require('../models/Bid');
const Attachment = require('../models/Attachment');
const { processImage } = require('../middlewares/upload');
const { findZipcodesWithinWithDistance } = require('../services/zipcodeService');
const fs = require('fs').promises;
const sanitize = require('mongo-sanitize');

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
      serviceOffered,
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

    if (serviceOffered !== undefined) {
      filter.service_offered = serviceOffered === 'true';
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
      gig_tasks: gigTasksRaw,
      budget_range_min,
      budget_range_max,
      is_volunteer: isVolunteerString,
      service_offered: serviceOfferedString, // Add this line
      tags,
    } = req.body;

    const userId = req.user.userId;

    // Convert string boolean to actual boolean
    const is_volunteer = isVolunteerString === 'true';
    const service_offered = serviceOfferedString === 'true'; // Add this line

    // Parse gig tasks from JSON string
    let gig_tasks = [];
    if (gigTasksRaw) {
      try {
        gig_tasks = JSON.parse(gigTasksRaw);
        if (!Array.isArray(gig_tasks)) {
          return res.status(400).json({ error: 'Gig tasks must be an array' });
        }
      } catch (err) {
        return res.status(400).json({ error: 'Invalid gig tasks format' });
      }
    }

    // Validate budget fields if not a volunteer gig
    if (!is_volunteer) {
      if (!budget_range_min || !budget_range_max) {
        return res.status(400).json({ error: 'Budget range is required for non-volunteer gigs' });
      }
      if (isNaN(budget_range_min) || isNaN(budget_range_max)) {
        return res.status(400).json({ error: 'Budget range must be valid numbers' });
      }
      if (parseFloat(budget_range_min) > parseFloat(budget_range_max)) {
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
      service_offered, // Add this line
      start_date: start_date || null,
      completion_date: completion_date || null,
      team_size: team_size || 1,
      gig_tasks,
      budget_range_min: is_volunteer ? null : parseFloat(budget_range_min),
      budget_range_max: is_volunteer ? null : parseFloat(budget_range_max),
      calculated_average_budget,
      is_volunteer,
      tags: tags ? tags.split(',') : [],
    });

    // Save gig to database
    await gig.save();

    // Handle attachment if file is uploaded
    if (req.file) {
      try {
        const isImage = req.file.mimetype.startsWith('image/');
        if (isImage) {
          await processImage(req.file.path);
        }

        const stats = await fs.stat(req.file.path);
        
        await Attachment.create({
          type: 'gig',
          foreign_key_id: gig._id,
          file_url: `/uploads/${req.file.filename}`,
          uploaded_by: userId,
          mime_type: isImage ? 'image/webp' : req.file.mimetype,
          file_size: stats.size
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
    const userId = req.user.userId;

    const gig = await Gig.findById(gigId);
    if (!gig) return res.status(404).json({ error: 'Gig not found' });
    if (gig.user_id.toString() !== userId) return res.status(403).json({ error: 'Forbidden' });

    // Handle volunteer status first
    const isVolunteer = req.body.is_volunteer === 'true';
    gig.is_volunteer = isVolunteer;

    // Reset budget fields for volunteer gigs
    if (isVolunteer) {
      gig.budget_range_min = null;
      gig.budget_range_max = null;
      gig.calculated_average_budget = null;
    } else {
      // Validate and set budget for paid gigs
      const min = parseFloat(req.body.budget_range_min);
      const max = parseFloat(req.body.budget_range_max);

      if (isNaN(min) || isNaN(max) || min < 0 || max < 0 || min > max) {
        return res.status(400).json({ error: 'Invalid budget range' });
      }

      gig.budget_range_min = min;
      gig.budget_range_max = max;
      gig.calculated_average_budget = (min + max) / 2;
    }

    // Update other fields
    gig.title = req.body.title || gig.title;
    gig.description = req.body.description || gig.description;
    gig.category = req.body.category || gig.category;
    gig.zipcode = req.body.zipcode || gig.zipcode;
    gig.start_date = req.body.start_date || null;
    gig.completion_date = req.body.completion_date || null;
    gig.team_size = parseInt(req.body.team_size) || 1;

    // Handle tasks
    try {
      gig.gig_tasks = req.body.gig_tasks ? JSON.parse(req.body.gig_tasks) : [];
    } catch (e) {
      return res.status(400).json({ error: 'Invalid tasks format' });
    }

    // Handle tags
    gig.tags = req.body.tags ? 
      req.body.tags.split(',').map(t => t.trim()).filter(t => t) : 
      [];

    // Handle file upload
    if (req.file) {
      try {
        const isImage = req.file.mimetype.startsWith('image/');
        if (isImage) {
          await processImage(req.file.path);
        }

        const stats = await fs.stat(req.file.path);

        await Attachment.deleteMany({ type: 'gig', foreign_key_id: gigId });
        await Attachment.create({
          type: 'gig',
          foreign_key_id: gigId,
          file_url: `/uploads/${req.file.filename}`,
          uploaded_by: req.user._id,
          mime_type: isImage ? 'image/webp' : req.file.mimetype,
          file_size: stats.size
        });
      } catch (error) {
        console.error('Error handling attachment:', error);
        return res.status(500).json({ error: 'Failed to process attachment' });
      }
    }

    const updatedGig = await gig.save();
    res.json({ message: 'Gig updated successfully', gig: updatedGig });

  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: 'Server error during update' });
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


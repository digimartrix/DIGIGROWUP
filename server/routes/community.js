import express from 'express';
import CommunityPost from '../models/CommunityPost.js';
import CommunityComment from '../models/CommunityComment.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET /api/community - Get post feed (filtered by category if provided)
router.get('/', protect, async (req, res, next) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const posts = await CommunityPost.find(filter)
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: posts });
  } catch (err) { next(err); }
});

// POST /api/community - Create forum post
router.post('/', protect, async (req, res, next) => {
  try {
    const { title, content, category } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required.' });
    }

    const post = await CommunityPost.create({
      userId: req.user.id,
      authorName: req.user.name || 'Anonymous Learner',
      title,
      content,
      category: category || 'Programming',
      likes: [],
      savedBy: []
    });

    res.status(201).json({ success: true, message: 'Post published successfully.', data: post });
  } catch (err) { next(err); }
});

// POST /api/community/:id/like - Like or unlike post
router.post('/:id/like', protect, async (req, res, next) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });

    const index = post.likes.indexOf(req.user.id);
    if (index === -1) {
      post.likes.push(req.user.id);
    } else {
      post.likes.splice(index, 1);
    }

    await post.save();
    res.json({ success: true, data: post });
  } catch (err) { next(err); }
});

// POST /api/community/:id/save - Bookmark or unsave post
router.post('/:id/save', protect, async (req, res, next) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });

    const index = post.savedBy.indexOf(req.user.id);
    if (index === -1) {
      post.savedBy.push(req.user.id);
    } else {
      post.savedBy.splice(index, 1);
    }

    await post.save();
    res.json({ success: true, data: post });
  } catch (err) { next(err); }
});

// GET /api/community/:id/comments - Get post comments
router.get('/:id/comments', protect, async (req, res, next) => {
  try {
    const comments = await CommunityComment.find({ postId: req.params.id })
      .sort({ createdAt: 1 })
      .lean();
    res.json({ success: true, data: comments });
  } catch (err) { next(err); }
});

// POST /api/community/:id/comments - Add a comment
router.post('/:id/comments', protect, async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ success: false, message: 'Comment content is required.' });

    const comment = await CommunityComment.create({
      postId: req.params.id,
      userId: req.user.id,
      authorName: req.user.name || 'Learner',
      content
    });

    res.status(201).json({ success: true, data: comment });
  } catch (err) { next(err); }
});

export default router;

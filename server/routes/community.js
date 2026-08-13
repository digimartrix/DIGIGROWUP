import express from 'express';
import CommunityPost from '../models/CommunityPost.js';
import CommunityComment from '../models/CommunityComment.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET /api/community - Get post feed (filtered by category if provided)
router.get('/', protect, async (req, res, next) => {
  try {
    const { category } = req.query;
    const count = await CommunityPost.countDocuments({});
    
    // Auto-seed initial engaging discussions if empty
    if (count === 0) {
      await CommunityPost.create([
        {
          userId: req.user.id,
          authorName: 'Devanand K. (Lead Architect)',
          title: '🔥 React 19 Server Actions & Optimistic UI Patterns in Production',
          content: 'We recently migrated our state management pipelines to use useOptimistic and form actions. What are your thoughts on reducing Redux boilerplate in favor of native React 19 primitives?',
          category: 'Programming',
          likes: [req.user.id],
          savedBy: []
        },
        {
          userId: req.user.id,
          authorName: 'Priyanka Sen (UX Lead)',
          title: '💡 Best Practices for CSS Subgrid & Container Queries in 2026',
          content: 'Sharing our internal design system checklist for responsive card layouts using container queries instead of media queries. How are you handling legacy browser fallbacks?',
          category: 'UI/UX',
          likes: [],
          savedBy: []
        },
        {
          userId: req.user.id,
          authorName: 'Veda Sarathi V. (Ecosystem Mentor)',
          title: '🚀 Cracking Machine Coding Rounds: Top 5 Architectural Patterns',
          content: 'When facing 90-minute live machine coding interviews at Uber or Google, always prioritize state isolation, pure helper functions, and custom debounce hooks. What challenges are you facing in mock interviews?',
          category: 'Career',
          likes: [req.user.id],
          savedBy: [req.user.id]
        }
      ]);
    }

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

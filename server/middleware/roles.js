// Role-based access control middleware
// Usage: router.get('/admin-only', protect, requireRole('admin'), handler)
// Usage: router.get('/instructor-or-admin', protect, requireRole('instructor', 'admin'), handler)

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}.` 
      });
    }
    next();
  };
};

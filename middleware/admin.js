exports.adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: '❌ Admin access only! You are not authorized.' });
    }
  };
  
  exports.verifyAdminSecret = (req, res, next) => {
    const adminSecret = req.headers['x-admin-secret'];
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ message: '❌ Invalid admin secret key!' });
    }
    next();
  };
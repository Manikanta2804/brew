exports.sellerOnly = (req, res, next) => {
    if (req.user && req.user.role === 'seller') {
      if (!req.user.isApproved) {
        return res.status(403).json({ message: '❌ Your seller account is pending approval by admin.' });
      }
      next();
    } else {
      res.status(403).json({ message: '❌ Seller access only!' });
    }
  };
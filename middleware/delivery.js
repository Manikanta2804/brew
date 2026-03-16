exports.deliveryOnly = (req, res, next) => {
    if (req.user && req.user.role === 'delivery') {
      if (!req.user.isApproved) {
        return res.status(403).json({ message: '❌ Your delivery account is pending approval.' });
      }
      next();
    } else {
      res.status(403).json({ message: '❌ Delivery boy access only!' });
    }
  };
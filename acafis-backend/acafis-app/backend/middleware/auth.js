const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Vérifier token JWT
exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Accès non autorisé — Token manquant' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Utilisateur introuvable' });
    }
    if (!req.user.isActive) {
      return res.status(401).json({ success: false, message: 'Compte désactivé' });
    }
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token invalide ou expiré' });
  }
};

// Vérifier rôles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Rôle '${req.user.role}' non autorisé pour cette action`
      });
    }
    next();
  };
};

// Générer tokens JWT
exports.generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '24h'
  });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d'
  });
  return { accessToken, refreshToken };
};

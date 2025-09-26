import jwt from 'jsonwebtoken';

export const auth = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// ✅ ADD THIS NEW MIDDLEWARE
// This middleware checks if the user is an admin or a builder.
export const adminOrBuilderOnly = (req, res, next) => {
  const { role } = req.user;

  if (role === 'admin' || role === 'builder') {
    next(); // User has permission, proceed to the next function
  } else {
    // User is a worker or another role, deny access
    res.status(403).json({ message: 'Forbidden: You do not have permission to perform this action.' });
  }
};
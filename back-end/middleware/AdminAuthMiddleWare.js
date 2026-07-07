const jwt = require('jsonwebtoken');

// Admin Authentication Middleware
function adminAuth(req, res, next) {
  // Get the token from the request headers
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Check if the decoded token contains the admin role
    if (decoded.role !== 'Admin') {
      return res.status(403).json({ error: 'You are not authorized to access this resource' });
    }

    // Add the decoded user ID to the request object for further use
    req.userId = decoded.userId;

    // Move to the next middleware or route handler
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = adminAuth;
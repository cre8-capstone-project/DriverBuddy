// Cocoy's Update: Authenticate requests using JWT
import admin from 'firebase-admin';

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log(authHeader);
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('Unauthorized: Token missing or expired');
    return res.status(401).json({message: 'Unauthorized: Token missing or expired'});
  }
  const token = authHeader.split(' ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    console.log('User authenticated:', decodedToken);
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(403).json({message: 'Forbidden: Invalid or expired token'});
  }
};

export default authenticateToken;

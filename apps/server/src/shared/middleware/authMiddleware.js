import { AppError } from '../errors/AppError.js';
import { verifyToken } from '../utils/security.js';
import { prisma } from '../../config/prisma.js';

export async function authenticate(req, _res, next) {
  try {
    let token = null;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('You are not logged in. Please log in to get access.', 401));
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return next(new AppError('Invalid or expired token. Please log in again.', 401));
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        charityProfile: true,
        donorProfile: true,
      },
    });

    if (!currentUser) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    req.user = currentUser;
    next();
  } catch (err) {
    next(err);
  }
}

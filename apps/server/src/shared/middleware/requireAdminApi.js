import { Router } from 'express';
import { clerkMiddleware, createClerkClient, getAuth } from '@clerk/express';

import { env } from '../../config/env.js';
import { AppError } from '../errors/AppError.js';

// Composable Clerk-backed guard for the Admin API.
//
// Chain: clerkMiddleware (verifies the Clerk session JWT sent by the web app
// via `auth().getToken()` in the Authorization header) -> getAuth -> role check
// against the Clerk user's publicMetadata/unsafeMetadata `role`.
//
// Mounting:
//   app.use('/api/admin', requireAdminApi(), adminRouter);
//
// Returns a Router so the guard can be reused verbatim across admin sub-areas.
export function requireAdminApi() {
  const router = Router();

  router.use(
    clerkMiddleware({
      secretKey: env.clerkSecretKey,
      publishableKey: env.clerkPublishableKey,
    }),
  );

  router.use(async (req, _res, next) => {
    try {
      const { userId } = getAuth(req);

      if (!userId) {
        return next(
          new AppError('You are not logged in. Please log in to get access.', 401),
        );
      }

      if (!env.clerkSecretKey) {
        return next(
          new AppError(
            'Admin API unavailable: CLERK_SECRET_KEY is not configured on the server.',
            500,
          ),
        );
      }

      const clerk = createClerkClient({ secretKey: env.clerkSecretKey });
      const user = await clerk.users.getUser(userId);
      const role = user.publicMetadata?.role ?? user.unsafeMetadata?.role;

      if (role !== 'admin') {
        return next(new AppError('Forbidden: admin access only.', 403));
      }

      req.admin = {
        id: user.id,
        role,
      };

      next();
    } catch (err) {
      next(err);
    }
  });

  return router;
}

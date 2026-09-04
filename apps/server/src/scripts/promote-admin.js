// Usage: pnpm --filter server admin:promote <email>
// Sets the Clerk user's publicMetadata.role to "admin" (Share a Plate team).
import { env } from '../config/env.js';

const email = process.argv[2];

if (!email) {
  console.error('Usage: pnpm --filter server admin:promote <email>');
  process.exit(1);
}

if (!env.clerkSecretKey) {
  console.error('[promote-admin] CLERK_SECRET_KEY is not set.');
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${env.clerkSecretKey}`,
  'Content-Type': 'application/json',
};

const searchUrl = `https://api.clerk.com/v1/users?email_address=${encodeURIComponent(email)}`;

const searchRes = await fetch(searchUrl, { headers });

if (!searchRes.ok) {
  console.error(`[promote-admin] Search failed: ${searchRes.status} ${searchRes.statusText}`);
  process.exit(1);
}

const users = await searchRes.json();
const user = users.find((u) =>
  u.email_addresses?.some((addr) => addr.email_address.toLowerCase() === email.toLowerCase()),
);

if (!user) {
  console.error(`[promote-admin] No Clerk user found for "${email}".`);
  process.exit(1);
}

const patchRes = await fetch(`https://api.clerk.com/v1/users/${user.id}`, {
  method: 'PATCH',
  headers,
  body: JSON.stringify({
    public_metadata: {
      ...(user.public_metadata ?? {}),
      role: 'admin',
    },
  }),
});

if (!patchRes.ok) {
  console.error(`[promote-admin] Update failed: ${patchRes.status} ${patchRes.statusText}`);
  process.exit(1);
}

console.log(`[promote-admin] "${email}" (${user.id}) is now an admin.`);

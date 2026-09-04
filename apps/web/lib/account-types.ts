export type UserRole = 'donor' | 'charity';

export type AccountType = {
  role: UserRole;
  label: string;
  headline: string;
  description: string;
  examples: string[];
  orgLabel: string;
  orgPlaceholder: string;
  value: string;
};

export const ACCOUNT_TYPES: Record<UserRole, AccountType> = {
  donor: {
    role: 'donor',
    label: 'Food Supplier',
    headline: 'I run a restaurant, hotel, bakery or caterer',
    description:
      'List surplus meals and let verified charities rescue them before they go to waste.',
    examples: ['Restaurant', 'Hotel', 'Bakery', 'Banquet hall'],
    orgLabel: 'Establishment name',
    orgPlaceholder: 'e.g. Grand Colombo Hotel',
    value: 'donor',
  },
  charity: {
    role: 'charity',
    label: 'Food Requester',
    headline: "I run a children's home, shelter or charity",
    description:
      'Rescue nearby surplus food and bring safe, dependable meals to the people you care for.',
    examples: ["Children's home", 'Elderly home', 'Shelter', 'Community kitchen'],
    orgLabel: 'Organization name',
    orgPlaceholder: 'e.g. Little Hearts Children’s Home',
    value: 'charity',
  },
};

export const ACCOUNT_TYPE_LIST: AccountType[] = [ACCOUNT_TYPES.donor, ACCOUNT_TYPES.charity];

export function isUserRole(value: unknown): value is UserRole {
  return value === 'donor' || value === 'charity';
}

export function homeForRole(role: UserRole | null | undefined): string {
  if (role === 'charity') return '/charity';
  if (role === 'donor') return '/donor';
  return '/';
}

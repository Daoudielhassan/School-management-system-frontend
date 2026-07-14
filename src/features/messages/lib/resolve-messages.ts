import type { UserData } from '@/features/users';

/** Display label for a message's sender/receiver, resolved by id from the users list. */
export function userLabel(users: UserData[], userId: string): string {
  const user = users.find((u) => u.id === userId);
  if (!user) return userId;
  const name = [user.firstname, user.lastname].filter(Boolean).join(' ').trim();
  return name || user.email;
}

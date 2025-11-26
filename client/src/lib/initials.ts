/**
 * Safely generates user initials from username
 */
export function getInitials(user: any): string {
  if (!user || !user.username) return "U";
  return (user.username[0] || "U").toUpperCase();
}

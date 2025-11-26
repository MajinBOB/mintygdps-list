/**
 * Safely generates user initials with multiple fallback options
 * Handles missing firstName/lastName gracefully
 */
export function getInitials(user: any): string {
  if (!user) return "U";

  // Try to get full name from firstName + lastName
  let fullName = "";
  if (user.firstName || user.lastName) {
    fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  }
  // Fall back to user.name if available
  else if (user.name && typeof user.name === "string") {
    fullName = user.name.trim();
  }

  // Extract initials from full name
  if (fullName) {
    const initials = fullName
      .split(" ")
      .map((word: string) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    if (initials) return initials;
  }

  // Fall back to username if available
  if (user.username && typeof user.username === "string") {
    const userInitials = user.username
      .split(" ")
      .map((word: string) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
    if (userInitials) return userInitials;
  }

  // Final fallback
  return "U";
}

export function calculateProfileCompletion(profile) {
  if (!profile) return 0;

  const checks = [
    Boolean(profile.fullName?.trim()),
    Boolean(profile.gender),
    Boolean(profile.address?.trim()),
    Boolean(profile.dateOfBirth),
    Array.isArray(profile.skills) && profile.skills.length > 0,
    Boolean(profile.education?.trim()),
    profile.experienceYears !== "" &&
      profile.experienceYears !== null &&
      profile.experienceYears !== undefined,
    Boolean(profile.email?.trim()),
    Boolean(profile.phoneNumber?.trim()),
    Boolean(profile.desiredPosition?.trim()),
    Array.isArray(profile.preferredJobTypes) &&
      profile.preferredJobTypes.length > 0,
    Boolean(profile.portfolioLink?.trim()),
    Boolean(profile.profilePictureUrl || profile.profilePicture?.name),
    Boolean(profile.resumePdf?.name),
  ];

  const filled = checks.filter(Boolean).length;
  return Math.round((filled / checks.length) * 100);
}

export function getDisplayName(profile) {
  if (!profile?.fullName?.trim()) {
    const emailName = profile?.email?.split("@")[0];
    return emailName
      ? emailName.charAt(0).toUpperCase() + emailName.slice(1)
      : "User";
  }
  return profile.fullName.trim().split(" ")[0];
}

export function formatDate(dateString) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

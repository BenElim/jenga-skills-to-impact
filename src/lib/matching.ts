// Transparent rule-based matching. Swap `scoreMatch` for an AI scorer later; keep the same return shape.
export type MatchInput = {
  volunteer: { skills: string[]; interests: string[]; availability?: string | null; location?: string | null };
  project: { required_skills: string[]; category: string; commitment?: string | null; location: string };
};
export type MatchResult = { score: number; matchedSkills: string[]; missingSkills: string[]; reasons: string[] };

const norm = (s: string) => s.trim().toLowerCase();

export function scoreMatch({ volunteer, project }: MatchInput): MatchResult {
  const vs = new Set(volunteer.skills.map(norm));
  const req = project.required_skills;
  const matchedSkills = req.filter((s) => vs.has(norm(s)));
  const missingSkills = req.filter((s) => !vs.has(norm(s)));
  const reasons: string[] = [];

  // Skills: 60 pts
  const skillPts = req.length ? (matchedSkills.length / req.length) * 60 : 30;
  if (matchedSkills.length) reasons.push(`Has ${matchedSkills.length} of ${req.length} required skills: ${matchedSkills.join(", ")}`);
  else if (req.length) reasons.push("No required skills listed on profile yet");

  // Interest in category: 20 pts
  const interested = volunteer.interests.map(norm).includes(norm(project.category));
  if (interested) reasons.push(`Interested in ${project.category}`);
  const interestPts = interested ? 20 : 0;

  // Availability: 10 pts
  const avail = norm(volunteer.availability ?? "");
  const commit = norm(project.commitment ?? "");
  const availMatch = !!avail && (avail === "flexible" || avail === commit);
  if (availMatch) reasons.push(`Available ${volunteer.availability}`);
  const availPts = availMatch ? 10 : 0;

  // Location: 10 pts (same city)
  const city = (s?: string | null) => norm((s ?? "").split(",")[0] ?? "");
  const locMatch = !!city(volunteer.location) && city(volunteer.location) === city(project.location);
  if (locMatch) reasons.push(`Based in ${project.location.split(",")[0]}`);
  const locPts = locMatch ? 10 : 0;

  return { score: Math.round(skillPts + interestPts + availPts + locPts), matchedSkills, missingSkills, reasons };
}

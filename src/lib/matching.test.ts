import { describe, it, expect } from "vitest";
import { scoreMatch } from "./matching";

const project = { required_skills: ["ICT", "Communication"], category: "Education", commitment: "weekends", location: "Nairobi, Kenya" };

describe("scoreMatch", () => {
  it("gives 100 for full skill, interest, availability and city match", () => {
    const r = scoreMatch({ volunteer: { skills: ["ict", "Communication"], interests: ["Education"], availability: "weekends", location: "Nairobi" }, project });
    expect(r.score).toBe(100);
  });
  it("weights skills at 60 points", () => {
    const r = scoreMatch({ volunteer: { skills: ["ICT"], interests: [], availability: "weekdays", location: "Mombasa" }, project });
    expect(r.score).toBe(30);
    expect(r.missingSkills).toEqual(["Communication"]);
  });
});

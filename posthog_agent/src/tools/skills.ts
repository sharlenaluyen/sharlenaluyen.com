import data from "../../data/skills.json";
import type { Skills } from "../types";

export function getSkills(category?: string): Skills | { error: string; validCategories: string[] } {
  const skills = data as Skills;
  if (!category) return skills;
  const key = Object.keys(skills).find((k) => k.toLowerCase() === category.toLowerCase());
  if (!key) return { error: `Unknown category '${category}'.`, validCategories: Object.keys(skills) };
  return { [key]: skills[key] };
}

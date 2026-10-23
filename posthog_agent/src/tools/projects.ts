import data from "../../data/projects.json";
import type { Project } from "../types";

export function searchProjects(query?: string, tag?: string): Project[] {
  let projects = data as Project[];
  if (tag) {
    const t = tag.toLowerCase();
    projects = projects.filter((p) => p.tags.some((x) => x.toLowerCase() === t));
  }
  if (query) {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    projects = projects.filter((p) => {
      const haystack = [p.name, p.description, ...p.tags].join(" ").toLowerCase();
      return words.every((w) => haystack.includes(w));
    });
  }
  return projects;
}

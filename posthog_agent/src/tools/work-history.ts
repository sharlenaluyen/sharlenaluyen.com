import data from "../../data/work-history.json";
import type { WorkRole } from "../types";

export function getWorkHistory(company?: string): WorkRole[] {
  const roles = data as WorkRole[]; // stored most recent first
  if (!company) return roles;
  const needle = company.toLowerCase();
  return roles.filter((r) => r.company.toLowerCase().includes(needle));
}

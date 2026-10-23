export interface WorkRole {
  company: string;
  title: string;
  dates: string;
  location: string;
  team?: string;
  stack: string[];
  highlights: string[];
}

export interface Project {
  name: string;
  description: string;
  tags: string[];
  link: string;
  agentFacing: boolean;
}

export type Skills = Record<string, string[]>;

export interface Education {
  degree: string;
  school: string;
  awards: string[];
}

export interface WhyPosthog {
  summary: string;
  talkingPoints: string[];
}

export const CONTACT_METHODS = ["email", "linkedin", "calendly"] as const;
export type ContactMethod = (typeof CONTACT_METHODS)[number];

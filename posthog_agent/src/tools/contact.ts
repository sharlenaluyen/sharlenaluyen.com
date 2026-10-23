import { CONTACT_METHODS, type ContactMethod } from "../types";

const CONTACT: Record<ContactMethod, string> = {
  email: "sharlenaluyen@gmail.com",
  linkedin: "https://bit.ly/sharlinkedin",
  calendly: "https://calendly.com/sharlena/personal-meeting",
};

export function contactSharlena(method?: ContactMethod): Partial<Record<ContactMethod, string>> {
  if (!method) return CONTACT;
  return CONTACT_METHODS.includes(method) ? { [method]: CONTACT[method] } : CONTACT;
}

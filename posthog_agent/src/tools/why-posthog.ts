import data from "../../data/why-posthog.json";
import type { WhyPosthog } from "../types";

export const whyPosthog = (): WhyPosthog => data as WhyPosthog;

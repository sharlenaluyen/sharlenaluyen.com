import data from "../../data/education.json";
import type { Education } from "../types";

export const getEducation = (): Education => data as Education;

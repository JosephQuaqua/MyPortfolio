import type { OpportunityType, ProjectStatus } from "../types/cms";

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  in_progress: "In progress",
  completed: "Completed",
  deployed: "Deployed",
};

export const OPPORTUNITY_TYPES: OpportunityType[] = [
  "Full-Time",
  "Part-Time",
  "Contract",
  "Freelance",
  "Internship",
  "Collaboration",
  "Other",
];

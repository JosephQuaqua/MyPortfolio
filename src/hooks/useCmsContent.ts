import { fetchEducation, fetchCertifications } from "../services/education";
import { fetchExperiences } from "../services/experiences";
import { fetchProjectBySlug, fetchPublishedProjects } from "../services/projects";
import { fetchSkillGroups } from "../services/skills";
import { useAsyncData } from "./useAsyncData";

export const useExperiences = () => useAsyncData(fetchExperiences);
export const useProjects = () => useAsyncData(fetchPublishedProjects);
export const useProject = (slug: string) => useAsyncData(() => fetchProjectBySlug(slug), [slug]);
export const useSkillGroups = () => useAsyncData(fetchSkillGroups);
export const useEducation = () => useAsyncData(fetchEducation);
export const useCertifications = () => useAsyncData(fetchCertifications);

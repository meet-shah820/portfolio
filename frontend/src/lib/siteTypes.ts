export type ProfileExperience = {
  title: string;
  company: string;
  period?: string;
  description?: string;
  highlights?: string[];
};

export type ProfileEducation = {
  degree: string;
  institution: string;
  period?: string;
  description?: string;
};

export type ProfileAvailability = {
  title: string;
  subtitle: string;
};

export type ProfileDoc = {
  _id: string;
  key?: string;
  fullName: string;
  tagline: string;
  bio: string;
  email: string;
  phone: string;
  location: string;
  githubUrl: string;
  linkedinUrl: string;
  instagramUrl: string;
  experienceYears: string;
  aboutLead: string;
  aboutStory: string[];
  experience: ProfileExperience[];
  education: ProfileEducation[];
  availability?: ProfileAvailability;
};

export type AchievementDoc = {
  _id: string;
  title: string;
  issuer: string;
  date: string;
  category: string;
  iconKey: "Shield" | "Trophy" | "Star" | "Zap" | "Target";
  color: string;
  sortOrder?: number;
};

export type SkillDoc = {
  _id: string;
  name: string;
  value: number;
};

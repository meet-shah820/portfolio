export type ProjectStatus = "Live" | "Beta" | "Development";

export type ProjectDoc = {
  _id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  tech: string[];
  stars: number;
  forks: number;
  demoUrl?: string;
  repoUrl?: string;
  span?: string;
  gradient?: string;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
};

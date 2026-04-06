import type { ProfileDoc } from "./siteTypes";

/** Used when the API is offline so contact links still match your details. */
export const FALLBACK_PROFILE: Omit<ProfileDoc, "_id"> = {
  fullName: "Meet Shah",
  tagline: "Software Engineering Student | Founding Engineer at PilotMVP | Full Stack Developer",
  bio: "Architecting cutting-edge web applications with the MERN stack.",
  email: "shahmeet8210@gmail.com",
  phone: "+1 (437) 879-4969",
  location: "Toronto, ON",
  githubUrl: "https://github.com/meet-shah820",
  linkedinUrl: "https://www.linkedin.com/in/meetshah82/",
  instagramUrl: "https://www.instagram.com/meetshah672//",
  experienceYears: "5Y",
  aboutLead:
    "A passionate full-stack developer with a mission to build the future of web technologies.",
  aboutStory: [],
  experience: [],
  education: [],
  availability: {
    title: "Available for Work",
    subtitle: "Currently open to new opportunities",
  },
};

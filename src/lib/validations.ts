import { z } from "zod";

export const registerSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must include at least one uppercase letter")
    .regex(/[a-z]/, "Password must include at least one lowercase letter")
    .regex(/\d/, "Password must include at least one number")
    .regex(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/, "Password must include at least one special character"),
  profilePhoto: z.string().optional(),
  phoneVerified: z.boolean().optional(),
  role: z.enum(["student", "company", "mentor", "college", "admin"]).default("student"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const onboardingSchema = z.object({
  college: z.string().min(2, "College name is required"),
  city: z.string().min(2, "City is required"),
  degree: z.string().min(1, "Degree is required"),
  branch: z.string().min(1, "Branch is required"),
  year: z.string().min(1, "Year is required"),
});

export const taskSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  degree: z.string().min(1, "Degree is required"),
  branch: z.string().min(1, "Branch is required"),
  difficulty: z.enum(["Easy", "Medium", "Hard"]).default("Medium"),
  points: z.number().min(1).max(100).default(10),
  deadline: z.string().min(1, "Deadline is required"),
  category: z.string().optional(),
});

export const submissionSchema = z.object({
  taskId: z.string().min(1, "Task ID is required"),
  fileUrl: z.string().optional(),
  externalLink: z.string().url("Invalid URL").optional().or(z.literal("")),
  description: z.string().max(300, "Description must be under 300 words").optional(),
});

export const companySchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  industry: z.string().optional(),
  description: z.string().optional(),
});

export const mentorSchema = z.object({
  expertise: z.string().optional(),
  experience: z.string().optional(),
  designation: z.string().optional(),
  organization: z.string().optional(),
});

export const collegeSchema = z.object({
  collegeName: z.string().min(2, "College name is required"),
  address: z.string().optional(),
  state: z.string().optional(),
  naacRating: z.string().optional(),
});

export const internshipSchema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string().min(10, "Description is required"),
  branches: z.array(z.string()).min(1, "Select at least one branch"),
  degrees: z.array(z.string()).min(1, "Select at least one degree"),
  duration: z.string().optional(),
  isPaid: z.boolean().default(false),
  stipend: z.string().optional(),
  deadline: z.string().min(1, "Deadline is required"),
});

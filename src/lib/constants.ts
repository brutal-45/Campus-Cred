export const DEGREE_BRANCH_MAP: Record<string, string[]> = {
  "B.Tech": [
    "CSE",
    "ECE",
    "Mechanical",
    "Civil",
    "EEE",
    "IT",
    "Chemical",
    "Aerospace",
    "Biotech",
    "Metallurgy",
    "Artificial Intelligence & ML",
    "Data Science",
    "Cyber Security",
  ],
  "B.E": [
    "CSE",
    "ECE",
    "Mechanical",
    "Civil",
    "EEE",
    "IT",
    "Chemical",
    "Aerospace",
    "Biotech",
    "Metallurgy",
  ],
  "BBA": [
    "Marketing",
    "Finance",
    "HR",
    "Operations",
    "International Business",
    "Entrepreneurship",
  ],
  "BCA": [
    "Web Development",
    "App Development",
    "Database Management",
    "AI/ML",
    "Cybersecurity",
  ],
  "B.Sc": [
    "Physics",
    "Chemistry",
    "Biology",
    "Mathematics",
    "Computer Science",
    "Biotechnology",
    "Statistics",
    "Data Science",
  ],
  "B.Com": [
    "Accounting",
    "Taxation",
    "Audit",
    "Banking",
    "Finance",
    "E-Commerce",
  ],
  "BA": [
    "English",
    "Psychology",
    "Sociology",
    "Journalism",
    "Political Science",
    "History",
    "Economics",
  ],
  "MBA": [
    "Marketing",
    "Finance",
    "HR",
    "Operations",
    "International Business",
    "Entrepreneurship",
    "Business Analytics",
    "Digital Marketing",
  ],
  "MCA": [
    "Web Development",
    "App Development",
    "Database Management",
    "AI/ML",
    "Cybersecurity",
    "Software Engineering",
  ],
  "M.Sc": [
    "Physics",
    "Chemistry",
    "Biology",
    "Mathematics",
    "Computer Science",
    "Biotechnology",
    "Statistics",
  ],
  "M.Com": [
    "Accounting",
    "Taxation",
    "Audit",
    "Banking",
    "Finance",
    "E-Commerce",
  ],
  "MA": [
    "English",
    "Psychology",
    "Sociology",
    "Journalism",
    "Political Science",
    "History",
    "Economics",
  ],
  "Diploma": [
    "Electrical",
    "Mechanical",
    "Civil",
    "Computer",
    "Electronics",
    "Automobile",
  ],
  "LLB": [
    "Corporate Law",
    "Criminal Law",
    "Constitutional Law",
  ],
  "MBBS": [
    "General Medicine",
    "Nursing",
    "Pharmacy",
    "Physiotherapy",
  ],
  "B.Pharm": [
    "Pharmaceutics",
    "Pharmacology",
    "Pharmaceutical Chemistry",
    "Pharmacognosy",
  ],
  "B.Arch": [
    "Architectural Design",
    "Urban Planning",
    "Landscape Architecture",
    "Interior Design",
  ],
  "BFA": [
    "Painting",
    "Sculpture",
    "Applied Art",
    "Visual Communication",
  ],
  "B.Des": [
    "UI/UX Design",
    "Graphic Design",
    "Product Design",
    "Animation",
    "Fashion Design",
    "Interior Design",
  ],
};

export const DEGREES = Object.keys(DEGREE_BRANCH_MAP);
export const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year"];

export const TASK_CATEGORIES = [
  { id: "development", label: "Development", icon: "code", color: "#3B82F6" },
  { id: "design", label: "Design", icon: "palette", color: "#7C3AED" },
  { id: "marketing", label: "Marketing", icon: "megaphone", color: "#F59E0B" },
  { id: "data", label: "Data Science", icon: "barChart", color: "#10B981" },
  { id: "writing", label: "Content Writing", icon: "penTool", color: "#EF4444" },
  { id: "research", label: "Research", icon: "microscope", color: "#6366F1" },
];

export const DIFFICULTY_LEVELS = ["Easy", "Medium", "Hard"] as const;

export const LEVEL_THRESHOLDS = [
  { level: "Starter", minScore: 0, maxScore: 100, icon: "🌱", color: "#4ADE80", gradient: "from-green-400 to-emerald-600", bgClass: "bg-green-100 text-green-700 border-green-200" },
  { level: "Achiever", minScore: 101, maxScore: 300, icon: "⚡", color: "#FBBF24", gradient: "from-yellow-400 to-amber-600", bgClass: "bg-amber-100 text-amber-700 border-amber-200" },
  { level: "Expert", minScore: 301, maxScore: 600, icon: "🔥", color: "#F97316", gradient: "from-orange-400 to-red-600", bgClass: "bg-orange-100 text-orange-700 border-orange-200" },
  { level: "Elite", minScore: 601, maxScore: 900, icon: "💎", color: "#8B5CF6", gradient: "from-purple-400 to-violet-600", bgClass: "bg-purple-100 text-purple-700 border-purple-200" },
  { level: "Legend", minScore: 901, maxScore: 1000, icon: "👑", color: "#EAB308", gradient: "from-yellow-300 to-amber-500", bgClass: "bg-yellow-100 text-yellow-700 border-yellow-200" },
];

// CampusCred Score point allocations
export const SCORE_BREAKDOWN = {
  TASK_COMPLETED: 50,        // +50 per task completed
  QUALITY_SUBMISSION_MIN: 10, // +10 to +50 based on rating
  QUALITY_SUBMISSION_MAX: 50,
  CERTIFICATE_EARNED: 30,    // +30 per certificate
  STREAK_PER_DAY: 5,         // +5 per day of streak
  PEER_REVIEW_GIVEN: 10,     // +10 per peer review given
  REFERRAL: 20,              // +20 per referral
  LINKEDIN_SHARE: 5,         // +5 per LinkedIn share
  EARLY_SUBMISSION: 15,      // +15 early submission bonus
  MAX_SCORE: 1000,
} as const;

export const PLATFORM_NAME = "CampusCred";
export const PLATFORM_TAGLINE = "Earn Real Work. Gain Real Cred.";
export const PLATFORM_DOMAIN = "campuscred.in";
export const PLATFORM_DESCRIPTION =
  "India's most trusted student career ecosystem. Complete real-world tasks, earn verified digital certificates, apply for micro-internships, build a public portfolio, and get hired — all 100% free for students.";

export const SAMPLE_COMPANIES = [
  "TCS", "Infosys", "Wipro", "Razorpay", "Zomato",
  "Swiggy", "CRED", "Flipkart", "PhonePe", "Freshworks",
  "Zerodha", "Groww", "Meesho", "UpGrad", "Unacademy",
];

export const COMPANY_LOGOS: Record<string, string> = {
  TCS: "/assets/logos/tcs.svg",
  Infosys: "/assets/logos/infosys.svg",
  Wipro: "/assets/logos/wipro.svg",
  Razorpay: "/assets/logos/razorpay.svg",
  Zomato: "/assets/logos/zomato.svg",
  Swiggy: "/assets/logos/swiggy.svg",
  CRED: "/assets/logos/cred.svg",
  Flipkart: "/assets/logos/flipkart.svg",
  PhonePe: "/assets/logos/phonepe.svg",
  Freshworks: "/assets/logos/freshworks.svg",
  Zerodha: "/assets/logos/zerodha.svg",
  Groww: "/assets/logos/groww.svg",
  Meesho: "/assets/logos/meesho.svg",
  UpGrad: "/assets/logos/upgrad.svg",
  Unacademy: "/assets/logos/unacademy.svg",
};

export const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    college: "IIT Delhi",
    branch: "B.Tech CSE",
    quote:
      "CampusCred transformed my college experience. The real-world tasks gave me practical skills that no textbook could teach. The verified certificate helped me land my dream internship at Razorpay!",
    avatar: "PS",
  },
  {
    name: "Rahul Verma",
    college: "VIT Vellore",
    branch: "B.Tech IT",
    quote:
      "I went from having zero projects to a full portfolio. The tasks are challenging and the feedback from mentors is incredibly valuable. Best platform for students serious about their career!",
    avatar: "RV",
  },
  {
    name: "Ananya Patel",
    college: "Christ University",
    branch: "BBA Marketing",
    quote:
      "As a non-tech student, I thought platforms like this weren't for me. CampusCred proved me wrong! I completed marketing tasks, got certified, and built a credible portfolio that impressed recruiters.",
    avatar: "AP",
  },
  {
    name: "Arjun Reddy",
    college: "NIT Warangal",
    branch: "MCA",
    quote:
      "The leaderboard and streak system kept me motivated. I went from Starter to Expert in 2 months. The QR-verified certificates are recognized by companies — I got hired directly through the platform!",
    avatar: "AR",
  },
  {
    name: "Sneha Iyer",
    college: "NLSIU Bangalore",
    branch: "Law",
    quote:
      "Even law students need practical experience! CampusCred had legal research tasks and contract drafting challenges. The certificate added real credibility to my CV during campus placements.",
    avatar: "SI",
  },
];

export const HOW_IT_WORKS_STEPS = [
  {
    step: 1,
    title: "Choose Your Path",
    description:
      "Select your degree and branch to discover tasks tailored to your field. We match opportunities to your skills and academic background.",
    icon: "graduation-cap",
  },
  {
    step: 2,
    title: "Complete Real Tasks",
    description:
      "Work on real-world projects from companies and industry experts. Submit your work and get it reviewed by professional mentors.",
    icon: "code",
  },
  {
    step: 3,
    title: "Build Your Cred",
    description:
      "Earn verified digital certificates with QR codes, build a public portfolio, and get discovered by companies hiring through CampusCred.",
    icon: "award",
  },
];

export const USER_ROLES = [
  { id: "student", label: "Student", icon: "graduation-cap", color: "#3B82F6", description: "Complete tasks, earn certificates, get hired" },
  { id: "company", label: "Company", icon: "building", color: "#10B981", description: "Post internships, discover talent" },
  { id: "mentor", label: "Mentor", icon: "users", color: "#7C3AED", description: "Review submissions, guide students" },
  { id: "college", label: "College", icon: "landmark", color: "#F59E0B", description: "Track student progress, partner with us" },
] as const;

// Indian cities are now in /src/data/indianCities.ts (700+ cities with states)

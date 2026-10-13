/**
 * ==============================================================================
 * PORTFOLIO CONFIGURATION - KISHOR KUMAR (DATA ANALYST)
 * ==============================================================================
 * 
 * INSTRUCTIONS FOR USER (Kishor Kumar):
 * 1. To add your real links, simply paste your URLs between the quotation marks.
 *    Example: github: "https://github.com/your-username"
 * 2. If you leave a link empty (""), the website will gracefully display a 
 *    "Link not added yet" state or hide the button. NO fake links are ever created!
 * 3. Profile Photo:
 *    - You can upload your photo directly from the website UI (it saves automatically!).
 *    - OR you can save your photo as "assets/profile.jpg" and set photo: "assets/profile.jpg".
 * 4. Resume:
 *    - Place your resume in the assets folder as "assets/Kishor_Kumar_Resume.pdf".
 *    - Update the resume path below if your filename differs.
 * ==============================================================================
 */

const portfolioConfig = {
  // ----------------------------------------------------------------------------
  // 1. Personal & Professional Information
  // ----------------------------------------------------------------------------
  profile: {
    name: "Kishor Kumar",
    title: "Data Analyst",
    experienceYears: "2+",
    location: "Open to Remote & Relocation",
    availability: "Available for Data Analyst Roles",
    
    // Path to your profile photo (leave empty "" to use the interactive uploader or fallback avatar)
    photo: "/uploads/images/1791877477102_WhatsApp_Image_2026-10-13_at_11_58_49.jpeg", 
    
    // Professional Summary (Used across Hero and meta tags)
    shortDescription: "Data Analyst with 2+ years of experience in data analysis, reporting, business insights, and process automation. Skilled in SQL, Python, Power BI, Excel, data visualization, data cleaning, and exploratory data analysis. Passionate about transforming raw data into meaningful business insights and actionable decisions.",
    
    // Contact & Profile Links (Enter your real links here)
    email: "kishorsk1702@gmail.com",
    github: "https://github.com/kishor1702",
    linkedin: "https://www.linkedin.com/in/kishor-kumar-s-68b087245",
    medium: "",
    website: "",
    
    // Resume File or Link
    resumeUrl: "/uploads/resumes/1791872844619_Kishor_Kumar_S_CV.pdf"
  },

  // ----------------------------------------------------------------------------
  // 2. About Me Section Data
  // ----------------------------------------------------------------------------
  about: {
    heading: "Turning Complex Data into Strategic Business Decisions",
    paragraphs: [
      "I am a passionate Data Analyst with 2+ years of hands-on experience deciphering complex datasets, identifying actionable trends, and engineering automated reporting solutions that drive operational efficiency and bottom-line growth.",
      "My core expertise revolves around the modern analytics toolkit: crafting robust SQL queries and relational models (PostgreSQL/MySQL), performing deep statistical explorations and data cleaning with Python (Pandas, NumPy), and architecting interactive, executive-ready Power BI & Excel dashboards.",
      "Beyond crunching numbers, I bridge the gap between technical data architecture and business stakeholders. Whether uncovering customer churn factors, auditing financial transactions, or optimizing supply chain bottlenecks, I thrive on turning messy raw data into crisp, strategic stories."
    ],
    highlights: [
      {
        icon: "fa-database",
        title: "Relational Modeling & SQL",
        desc: "Complex joins, window functions, CTEs, query optimization, and subqueries across multi-million row datasets."
      },
      {
        icon: "fa-chart-pie",
        title: "Business Intelligence & Power BI",
        desc: "Interactive dashboards with DAX measures, dynamic KPI cards, drill-downs, and automated refresh pipelines."
      },
      {
        icon: "fa-code",
        title: "Python Data Processing & EDA",
        desc: "Exploratory Data Analysis, automated ETL scripts, handling missing values/outliers, and statistical distributions."
      },
      {
        icon: "fa-bolt",
        title: "Automation & Problem Solving",
        desc: "Eliminating manual reporting hours, engineering self-serve dashboards, and presenting actionable executive takeaways."
      }
    ],
    stats: [
      { value: "2+", label: "Years of Experience" },
      { value: "11+", label: "Analytics Projects" },
      { value: "4+", label: "Power BI Dashboards" },
      { value: "30%", label: "Avg. Reporting Time Saved" }
    ]
  },

  // ----------------------------------------------------------------------------
  // 3. Technical & Analytical Skills
  // ----------------------------------------------------------------------------
  skills: [
    {
      category: "Programming & Analytics",
      icon: "fa-laptop-code",
      accent: "cyan",
      items: [
        { name: "Python", level: "Advanced", icon: "fa-brands fa-python" },
        { name: "SQL", level: "Advanced", icon: "fa-solid fa-database" },
        { name: "PostgreSQL", level: "Proficient", icon: "fa-solid fa-server" },
        { name: "Pandas", level: "Advanced", icon: "fa-solid fa-table" },
        { name: "NumPy", level: "Proficient", icon: "fa-solid fa-calculator" }
      ]
    },
    {
      category: "Data Visualization",
      icon: "fa-chart-line",
      accent: "blue",
      items: [
        { name: "Power BI", level: "Advanced", icon: "fa-solid fa-chart-column" },
        { name: "DAX", level: "Proficient", icon: "fa-solid fa-square-root-variable" },
        { name: "Advanced Excel", level: "Advanced", icon: "fa-solid fa-file-excel" },
        { name: "Matplotlib", level: "Proficient", icon: "fa-solid fa-chart-area" },
        { name: "Seaborn", level: "Proficient", icon: "fa-solid fa-chart-simple" }
      ]
    },
    {
      category: "Analytics & Methodology",
      icon: "fa-brain",
      accent: "indigo",
      items: [
        { name: "Data Cleaning", level: "Expert", icon: "fa-solid fa-broom" },
        { name: "EDA (Exploratory Analysis)", level: "Expert", icon: "fa-solid fa-magnifying-glass-chart" },
        { name: "Data Transformation", level: "Advanced", icon: "fa-solid fa-arrows-rotate" },
        { name: "Statistical Analysis", level: "Proficient", icon: "fa-solid fa-square-poll-vertical" },
        { name: "Business Analysis", level: "Advanced", icon: "fa-solid fa-briefcase" },
        { name: "KPI Analysis & Metrics", level: "Advanced", icon: "fa-solid fa-bullseye" }
      ]
    }
  ],

  // ----------------------------------------------------------------------------
  // 4. Projects Portfolio
  // ----------------------------------------------------------------------------
  projects: [
    // --- PYTHON PROJECTS ---
    {
      id: "py-ecommerce",
      title: "E-Commerce Sales & Customer Behavior Analysis",
      category: "Python",
      badge: "Customer Analytics",
      description: "Conducted exploratory data analysis on 100K+ transaction records to uncover buying patterns, customer lifetime value distributions, and revenue drivers.",
      technologies: ["Python", "Pandas", "NumPy", "Matplotlib", "Seaborn", "RFM Segmentation"],
      keyQuestions: [
        "Which customer segments generate 80% of repeat annual revenue?",
        "What are the peak checkout hours and cart abandonment drop-off periods?",
        "How do regional promotional discounts correlate with customer churn rate?"
      ],
      githubUrl: "", // Paste your real GitHub repository link here
      liveUrl: ""    // Paste live demo or notebook link here (if any)
    },
    {
      id: "py-employee-attrition",
      title: "Employee Attrition & Workforce Analytics",
      category: "Python",
      badge: "HR Intelligence",
      description: "Diagnosed historical employee turnover metrics across multiple departments using statistical correlation, demographic clustering, and hypothesis testing.",
      technologies: ["Python", "Pandas", "NumPy", "Seaborn", "Statistical Modeling"],
      keyQuestions: [
        "What primary friction factors (commute, salary hike, tenure, overtime) drive talent attrition?",
        "Which department experiences the highest flight risk among high performers?",
        "What retention policy adjustments could save an estimated $120K in re-hiring costs?"
      ],
      githubUrl: "",
      liveUrl: ""
    },
    {
      id: "py-loan-risk",
      title: "Loan Default Risk Analysis",
      category: "Python",
      badge: "Risk & Credit",
      description: "Assessed financial lending datasets to identify borrower risk indicators, loan default likelihood, and debt-to-income distribution thresholds.",
      technologies: ["Python", "Pandas", "NumPy", "EDA", "Risk Modeling"],
      keyQuestions: [
        "How do debt-to-income (DTI) ratios correlate with loan non-fulfillment?",
        "What credit score bands represent the optimum trade-off between volume and default risk?",
        "Which sub-grade loans require stricter underwriting criteria to mitigate loss?"
      ],
      githubUrl: "https://github.com/kishor1702/loan-default-risk-analytics/blob/main/python/02_load_home_credit.py",
      liveUrl: ""
    },
    {
      id: "py-food-delivery",
      title: "Food Delivery Operations & Delivery Performance Analysis",
      category: "Python",
      badge: "Operations Analytics",
      description: "Analyzed logistics data from on-demand food delivery runs to uncover order fulfillment bottlenecks, peak rush hour delays, and delivery partner efficiency.",
      technologies: ["Python", "Pandas", "NumPy", "Matplotlib", "KPI Analytics"],
      keyQuestions: [
        "What variables (weather, traffic density, kitchen prep time) cause longest delays?",
        "How can dispatch algorithms balance orders across high-density city clusters?",
        "What is the average customer rating impact when delivery exceeds 35 minutes?"
      ],
      githubUrl: "",
      liveUrl: ""
    },

    // --- SQL PROJECTS ---
    {
      id: "sql-banking",
      title: "Banking Customer Transaction Analytics",
      category: "SQL",
      badge: "Financial Analytics",
      description: "Built modular PostgreSQL analytical scripts utilizing Window Functions and Common Table Expressions (CTEs) to audit transactional velocity and churn flags.",
      technologies: ["SQL", "PostgreSQL", "Window Functions", "CTEs", "Cohort Analysis"],
      keyQuestions: [
        "How to detect anomalous high-frequency debit spikes indicating fraud risk?",
        "What are the month-over-month account balance progression curves by demographic?",
        "Which cohort of checking accounts turned dormant after the first 90 days?"
      ],
      githubUrl: "",
      liveUrl: ""
    },
    {
      id: "sql-retail-inventory",
      title: "Retail Sales & Inventory Intelligence",
      category: "SQL",
      badge: "Supply Chain",
      description: "Engineered complex SQL queries across multi-store retail databases to measure stock turnover rates, SKU velocities, and recurring inventory stockouts.",
      technologies: ["SQL", "PostgreSQL", "Complex Joins", "Subqueries", "Aggregations"],
      keyQuestions: [
        "Which top 15% SKUs generate 70% of gross margin across regional outlets?",
        "What is the safety stock burn rate during seasonal promotional spikes?",
        "Where are supply-chain lead times exceeding vendor SLAs by more than 5 business days?"
      ],
      githubUrl: "",
      liveUrl: ""
    },
    {
      id: "sql-hr-workforce",
      title: "HR Workforce Analytics",
      category: "SQL",
      badge: "Organizational Data",
      description: "Structured recursive queries and aggregations to analyze organizational hierarchy, tenure progressions, and salary parity across enterprise divisions.",
      technologies: ["SQL", "PostgreSQL", "Recursive CTEs", "Grouping Sets", "Performance Indexing"],
      keyQuestions: [
        "How does promotion frequency correlate with employee tenure across management levels?",
        "What is the compensation distribution across gender, department, and experience bands?",
        "What is the net headcount change month-over-month accounting for hiring and exits?"
      ],
      githubUrl: "",
      liveUrl: ""
    }
  ],

  // ----------------------------------------------------------------------------
  // 5. Dedicated Power BI Dashboards
  // ----------------------------------------------------------------------------
  powerBiDashboards: [
    {
      id: "pbi-sales",
      name: "Sales Performance Dashboard",
      badge: "Commercial Intelligence",
      businessObjective: "Provide executive leadership with continuous visibility into sales pipeline health, regional revenue generation, and sales rep quota fulfillment.",
      kpis: [
        "Total Revenue ($1.2M+)",
        "Gross Margin (42.5%)",
        "YoY Sales Growth (+18.4%)",
        "Avg. Order Value ($148)"
      ],
      previewColor: "linear-gradient(135deg, #0d324d 0%, #7f5a83 100%)",
      reportUrl: "", // Paste your real Power BI Web/Embed link here
      githubUrl: ""  // Paste documentation or PBIS repo link if applicable
    },
    {
      id: "pbi-hr",
      name: "HR Analytics Dashboard",
      badge: "People Analytics",
      businessObjective: "Empower People Ops leaders to monitor talent acquisition velocity, voluntary attrition rates, demographic diversity, and employee satisfaction trends.",
      kpis: [
        "Attrition Rate (11.2%)",
        "Active Headcount (1,450)",
        "Avg. Employee Tenure (3.4 Yrs)",
        "Time-to-Fill (26 Days)"
      ],
      previewColor: "linear-gradient(135deg, #1f4037 0%, #99f2c8 100%)",
      reportUrl: "",
      githubUrl: ""
    },
    {
      id: "pbi-banking",
      name: "Banking Analytics Dashboard",
      badge: "Credit & Deposits",
      businessObjective: "Monitor branch-level deposit inflows, loan portfolio performance, non-performing asset (NPA) exposure, and credit risk distributions.",
      kpis: [
        "Total Loan Portfolio ($84M)",
        "NPA Ratio (1.8%)",
        "Net Interest Margin (3.6%)",
        "Deposit Growth (+14.2%)"
      ],
      previewColor: "linear-gradient(135deg, #141e30 0%, #243b55 100%)",
      reportUrl: "",
      githubUrl: ""
    },
    {
      id: "pbi-customer-revenue",
      name: "Customer & Revenue Analytics Dashboard",
      badge: "Cohort Analytics",
      businessObjective: "Deliver granular visibility into customer retention cohorts, customer lifetime value (LTV), repeat purchase frequency, and subscription churn factors.",
      kpis: [
        "Customer Lifetime Value ($860)",
        "Monthly Recurring Revenue ($210K)",
        "Repeat Purchase Rate (38%)",
        "Customer Churn (2.1%)"
      ],
      previewColor: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
      reportUrl: "",
      githubUrl: ""
    }
  ],

  // ----------------------------------------------------------------------------
  // 6. Professional Profiles
  // ----------------------------------------------------------------------------
  professionalProfiles: [
    {
      platform: "LinkedIn",
      icon: "fa-brands fa-linkedin-in",
      accent: "#0a66c2",
      description: "Connect with me professionally, view recommendations, and stay updated with my data analytics insights and career milestones.",
      buttonLabel: "View LinkedIn Profile",
      urlConfigKey: "linkedin"
    },
    {
      platform: "GitHub",
      icon: "fa-brands fa-github",
      accent: "#2ea44f",
      description: "Explore my open-source analytical repositories, structured SQL scripts, Jupyter notebooks, and data cleaning workflows.",
      buttonLabel: "Explore GitHub Profile",
      urlConfigKey: "github"
    },
    {
      platform: "Medium",
      icon: "fa-brands fa-medium",
      accent: "#00ab6c",
      description: "Read my technical articles covering practical SQL queries, data visualization best practices, and exploratory data analysis tutorials.",
      buttonLabel: "Read Articles on Medium",
      urlConfigKey: "medium"
    },
    {
      platform: "Portfolio / Website",
      icon: "fa-solid fa-globe",
      accent: "#38bdf8",
      description: "My personal digital portfolio showcasing end-to-end analytical solutions, business case studies, and interactive dashboards.",
      buttonLabel: "Visit Personal Website",
      urlConfigKey: "website"
    }
  ],

  // ----------------------------------------------------------------------------
  // 7. Resume Highlights (Displayed alongside download/view buttons)
  // ----------------------------------------------------------------------------
  resumeData: {
    fileName: "Kishor_Kumar_S_CV.pdf",
    filePath: "/uploads/resumes/1791872844619_Kishor_Kumar_S_CV.pdf", // Configurable path
    viewUrl: "/api/resume/preview", // Cloud preview endpoint, falls back to filePath
    lastUpdated: "Updated for 2026",
    summaryTitle: "Ready to Add Immediate Data Value",
    summaryPoints: [
      "2+ Years of commercial experience delivering end-to-end analytics and executive reporting.",
      "Expertise in SQL (CTEs, Window Functions, Indexing), Python (Pandas, NumPy, Seaborn), and Power BI (DAX).",
      "Proven record in reducing manual reporting workload by 30% via automated SQL pipelines.",
      "Strong communication skills translating ambiguous business goals into quantified KPI dashboards."
    ]
  }
};

// Make accessible to browser window
if (typeof window !== "undefined") {
  window.portfolioConfig = portfolioConfig;
}

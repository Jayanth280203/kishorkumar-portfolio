/**
 * ==============================================================================
 * KISHOR KUMAR PORTFOLIO - PERSISTENT DATABASE ENGINE
 * Atomic file-backed persistence with draft/publish workflows and seed loader
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_FILE = path.join(__dirname, '..', 'data', 'portfolio_db.json');
const DB_TMP = path.join(__dirname, '..', 'data', 'portfolio_db.json.tmp');

class PortfolioDatabase {
  constructor() {
    this.data = null;
    this.init();
  }

  init() {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        this.data = JSON.parse(raw);
        if (!this.data.enquiries) {
          this.data.enquiries = [];
        }
        // Verify admin exists and update credentials if environment specifies new ones
        this.ensureAdminCredentials();
      } catch (err) {
        console.error('Error reading database file, recreating from seed:', err);
        this.createSeedData();
      }
    } else {
      this.createSeedData();
    }
  }

  ensureAdminCredentials() {
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@kishorkumar.dev').toLowerCase();
    const adminPass = process.env.ADMIN_PASSWORD || 'Kishor@Analytics2026!';

    if (!this.data.admin || this.data.admin.email !== adminEmail) {
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(adminPass, salt);
      this.data.admin = {
        email: adminEmail,
        passwordHash: hash,
        updatedAt: new Date().toISOString()
      };
      this.save();
    }
  }

  createSeedData() {
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@kishorkumar.dev').toLowerCase();
    const adminPass = process.env.ADMIN_PASSWORD || 'Kishor@Analytics2026!';
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(adminPass, salt);

    // Initial base content
    const baseContent = {
      siteSettings: {
        websiteName: "Kishor Kumar",
        logoBadge: "KK",
        logoTitle: "Kishor Kumar",
        logoSubtitle: "Data Analyst",
        footerCopyright: "© 2026 Kishor Kumar. All rights reserved.",
        footerTagline: "Data-driven analytics, business intelligence, and process automation."
      },
      navLabels: {
        home: "Home",
        about: "About",
        experience: "Experience",
        skills: "Skills",
        projects: "Projects",
        dashboards: "Dashboards",
        resume: "Resume",
        contact: "Contact",
        ctaButton: "Let's Talk"
      },
      hero: {
        statusBadge: "Open to Data Analyst Opportunities",
        name: "Kishor Kumar",
        professionalTitle: "Data Analyst",
        shortDescription: "Data Analyst with 2+ years of experience in data analysis, reporting, business insights, and process automation. Skilled in SQL, Python, Power BI, Excel, data visualization, data cleaning, and exploratory data analysis. Passionate about transforming raw data into meaningful business insights and actionable decisions.",
        chips: [
          { icon: "fa-database", text: "SQL & PostgreSQL" },
          { icon: "fa-brands fa-python", text: "Python & Pandas" },
          { icon: "fa-chart-column", text: "Power BI & DAX" },
          { icon: "fa-file-excel", text: "Advanced Excel" },
          { icon: "fa-bolt", text: "Process Automation" }
        ],
        buttons: {
          viewProjects: "View Projects",
          github: "GitHub",
          linkedin: "LinkedIn",
          downloadResume: "Download Resume"
        }
      },
      profile: {
        name: "Kishor Kumar",
        title: "Data Analyst",
        photo: "", // Empty defaults to fallback SVG or upload
        email: "",
        github: "",
        linkedin: "",
        medium: "",
        website: "",
        location: "India (Open to Remote, Hybrid & Relocation)",
        availability: "Available for Full-Time Roles"
      },
      about: {
        heading: "Turning Complex Data into Strategic Business Decisions",
        lead: "A data-driven problem solver connecting raw relational data to executive decisions.",
        paragraphs: [
          "I am a passionate Data Analyst with 2+ years of hands-on experience deciphering complex datasets, identifying actionable trends, and engineering automated reporting solutions that drive operational efficiency and bottom-line growth.",
          "My core expertise revolves around the modern analytics toolkit: crafting robust SQL queries and relational models (PostgreSQL/MySQL), performing deep statistical explorations and data cleaning with Python (Pandas, NumPy), and architecting interactive, executive-ready Power BI & Excel dashboards.",
          "Beyond crunching numbers, I bridge the gap between technical data architecture and business stakeholders. Whether uncovering customer churn factors, auditing financial transactions, or optimizing supply chain bottlenecks, I thrive on turning messy raw data into crisp, strategic stories."
        ],
        highlights: [
          {
            id: "hl-1",
            icon: "fa-database",
            title: "Relational Modeling & SQL",
            desc: "Complex joins, window functions, CTEs, query optimization, and subqueries across multi-million row datasets."
          },
          {
            id: "hl-2",
            icon: "fa-chart-pie",
            title: "Business Intelligence & Power BI",
            desc: "Interactive dashboards with DAX measures, dynamic KPI cards, drill-downs, and automated refresh pipelines."
          },
          {
            id: "hl-3",
            icon: "fa-code",
            title: "Python Data Processing & EDA",
            desc: "Exploratory Data Analysis, automated ETL scripts, handling missing values/outliers, and statistical distributions."
          },
          {
            id: "hl-4",
            icon: "fa-bolt",
            title: "Automation & Problem Solving",
            desc: "Eliminating manual reporting hours, engineering self-serve dashboards, and presenting actionable executive takeaways."
          }
        ],
        stats: [
          { id: "stat-1", value: "2+", label: "Years of Experience" },
          { id: "stat-2", value: "11+", label: "Analytics Projects" },
          { id: "stat-3", value: "4+", label: "Power BI Dashboards" },
          { id: "stat-4", value: "30%", label: "Avg. Reporting Time Saved" }
        ]
      },
      experience: [
        {
          id: "exp-1",
          jobTitle: "Data Analyst",
          company: "Analytics & Business Intelligence Practice",
          location: "Bengaluru, India (Hybrid)",
          startDate: "2024-02",
          endDate: "Present",
          isCurrent: true,
          description: "Responsible for developing automated ETL scripts, performing statistical exploratory analysis, and delivering C-level Power BI reporting across financial and retail operations.",
          achievements: [
            "Engineered automated SQL pipelines (PostgreSQL & CTEs), slashing weekly reporting generation time by 30%.",
            "Designed and deployed 4 multi-page Power BI dashboards tracking sales velocity, cohort retention, and inventory levels.",
            "Conducted comprehensive Exploratory Data Analysis (EDA) on 150K+ transactional records to detect anomalous revenue drop-offs."
          ]
        },
        {
          id: "exp-2",
          jobTitle: "Junior Data Analyst / Trainee",
          company: "Digital Commerce Intelligence",
          location: "Remote",
          startDate: "2023-01",
          endDate: "2024-01",
          isCurrent: false,
          description: "Assisted in data wrangling, cleaning dirty unstructured logs, generating weekly Excel reports, and maintaining database hygiene.",
          achievements: [
            "Cleaned and standardized multi-source customer datasets using Python (Pandas) and regex transformations.",
            "Built advanced Excel workbooks with VLOOKUP/INDEX-MATCH, dynamic Pivot Tables, and automated macros.",
            "Collaborated with operations leads to translate business requirements into quantified KPI metrics."
          ]
        }
      ],
      skills: [
        {
          id: "skill-cat-1",
          category: "Programming & Analytics",
          icon: "fa-laptop-code",
          accent: "cyan",
          items: [
            { id: "s-1", name: "Python", level: "Advanced", icon: "fa-brands fa-python" },
            { id: "s-2", name: "SQL", level: "Advanced", icon: "fa-solid fa-database" },
            { id: "s-3", name: "PostgreSQL", level: "Proficient", icon: "fa-solid fa-server" },
            { id: "s-4", name: "Pandas", level: "Advanced", icon: "fa-solid fa-table" },
            { id: "s-5", name: "NumPy", level: "Proficient", icon: "fa-solid fa-calculator" }
          ]
        },
        {
          id: "skill-cat-2",
          category: "Data Visualization",
          icon: "fa-chart-line",
          accent: "blue",
          items: [
            { id: "s-6", name: "Power BI", level: "Advanced", icon: "fa-solid fa-chart-column" },
            { id: "s-7", name: "DAX", level: "Proficient", icon: "fa-solid fa-square-root-variable" },
            { id: "s-8", name: "Advanced Excel", level: "Advanced", icon: "fa-solid fa-file-excel" },
            { id: "s-9", name: "Matplotlib", level: "Proficient", icon: "fa-solid fa-chart-area" },
            { id: "s-10", name: "Seaborn", level: "Proficient", icon: "fa-solid fa-chart-simple" }
          ]
        },
        {
          id: "skill-cat-3",
          category: "Analytics & Methodology",
          icon: "fa-brain",
          accent: "indigo",
          items: [
            { id: "s-11", name: "Data Cleaning", level: "Expert", icon: "fa-solid fa-broom" },
            { id: "s-12", name: "EDA (Exploratory Analysis)", level: "Expert", icon: "fa-solid fa-magnifying-glass-chart" },
            { id: "s-13", name: "Data Transformation", level: "Advanced", icon: "fa-solid fa-arrows-rotate" },
            { id: "s-14", name: "Statistical Analysis", level: "Proficient", icon: "fa-solid fa-square-poll-vertical" },
            { id: "s-15", name: "Business Analysis", level: "Advanced", icon: "fa-solid fa-briefcase" },
            { id: "s-16", name: "KPI Analysis & Metrics", level: "Advanced", icon: "fa-solid fa-bullseye" }
          ]
        }
      ],
      githubSection: {
        tag: "Open Source & Code Repositories",
        title: "Explore My GitHub Projects",
        description: "Explore my data analytics projects, SQL analysis, Python notebooks, dashboards, and data-driven solutions.",
        buttonLabel: "Explore GitHub Profile",
        features: [
          "Clean, documented SQL scripts",
          "Reproducible Jupyter Notebooks",
          "EDA & Visualizations"
        ]
      },
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
          reportUrl: "",
          githubUrl: "",
          isPublished: true
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
          reportUrl: "",
          githubUrl: "",
          isPublished: true
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
          reportUrl: "",
          githubUrl: "",
          isPublished: true
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
          reportUrl: "",
          githubUrl: "",
          isPublished: true
        }
      ],
      resumeSection: {
        heading: "Professional Resume",
        subtitle: "Comprehensive breakdown of technical capabilities, projects, and commercial impact.",
        valuePropositionTitle: "Core Value Proposition",
        summaryPoints: [
          "2+ Years of commercial experience delivering end-to-end analytics and executive reporting.",
          "Expertise in SQL (CTEs, Window Functions, Indexing), Python (Pandas, NumPy, Seaborn), and Power BI (DAX).",
          "Proven record in reducing manual reporting workload by 30% via automated SQL pipelines.",
          "Strong communication skills translating ambiguous business goals into quantified KPI dashboards."
        ],
        downloadButtonLabel: "Download Resume",
        viewButtonLabel: "View Resume"
      },
      socialProfiles: [
        {
          id: "soc-linkedin",
          platform: "LinkedIn",
          icon: "fa-brands fa-linkedin-in",
          accent: "#0a66c2",
          description: "Connect with me professionally, view recommendations, and stay updated with my data analytics insights and career milestones.",
          buttonLabel: "View LinkedIn Profile",
          url: ""
        },
        {
          id: "soc-github",
          platform: "GitHub",
          icon: "fa-brands fa-github",
          accent: "#2ea44f",
          description: "Explore my open-source analytical repositories, structured SQL scripts, Jupyter notebooks, and data cleaning workflows.",
          buttonLabel: "Explore GitHub Profile",
          url: ""
        },
        {
          id: "soc-medium",
          platform: "Medium",
          icon: "fa-brands fa-medium",
          accent: "#00ab6c",
          description: "Read my technical articles covering practical SQL queries, data visualization best practices, and exploratory data analysis tutorials.",
          buttonLabel: "Read Articles on Medium",
          url: ""
        },
        {
          id: "soc-website",
          platform: "Portfolio / Website",
          icon: "fa-solid fa-globe",
          accent: "#38bdf8",
          description: "My personal digital portfolio showcasing end-to-end analytical solutions, business case studies, and interactive dashboards.",
          buttonLabel: "Visit Personal Website",
          url: ""
        }
      ],
      contact: {
        tag: "Let's Connect",
        heading: "Get in Touch",
        subtitle: "Have a data analyst role or analytical problem to solve? I'd love to discuss how I can help.",
        description: "I am actively seeking Data Analyst opportunities where I can apply my SQL, Python, and Power BI skills to drive real business value.",
        emailLabel: "Direct Email",
        linkedinLabel: "LinkedIn",
        githubLabel: "GitHub",
        locationText: "Open to Remote, Hybrid, & Relocation Opportunities",
        submitButtonLabel: "Send Message"
      },
      seo: {
        metaTitle: "Kishor Kumar | Data Analyst Portfolio",
        metaDescription: "Data Analyst with 2+ years experience in SQL, Python, Power BI, Advanced Excel, data cleaning, EDA, business insights, and automated reporting.",
        keywords: "Data Analyst, Kishor Kumar, SQL, Python, Power BI, DAX, Excel, Data Cleaning, EDA, Business Intelligence",
        ogImage: "assets/profile.jpg"
      }
    };

    // Projects Seed
    const seedProjects = [
      {
        id: "proj-py-ecommerce",
        title: "E-Commerce Sales & Customer Behavior Analysis",
        category: "Python",
        badge: "Customer Analytics",
        shortDescription: "Conducted exploratory data analysis on 100K+ transaction records to uncover buying patterns, customer lifetime value distributions, and revenue drivers.",
        detailedDescription: "In-depth retail transactional study focusing on recency, frequency, and monetary (RFM) segmentation to identify high-value cohorts and optimize promotional spend.",
        technologies: ["Python", "Pandas", "NumPy", "Matplotlib", "Seaborn", "RFM Segmentation"],
        projectOverview: "Modern e-commerce platforms generate massive volumes of customer touchpoints. This project cleaned 100K+ transaction rows to model shopping behavior and improve checkout conversions.",
        keyPoints: [
          { id: "kp-1-1", text: "Customer segmentation via RFM to classify VIP, loyal, and at-risk shoppers.", order: 1 },
          { id: "kp-1-2", text: "Identified that top 20% customers contribute to 76% of total repeat revenue.", order: 2 },
          { id: "kp-1-3", text: "Analyzed checkout bottlenecks and uncovered 42% cart drop-off during peak midnight hours.", order: 3 }
        ],
        keyFindings: "VIP buyers purchase at 3.2x higher order value when personalized discount codes are triggered within 7 days of initial signup.",
        businessImpact: "Provided actionable merchandising recommendations to re-engage lapsed customers, projecting a 14% lift in repeat customer rate.",
        githubUrl: "",
        liveUrl: "",
        dashboardUrl: "",
        thumbnailUrl: "",
        featured: true,
        displayOrder: 1,
        isPublished: true,
        updatedAt: new Date().toISOString()
      },
      {
        id: "proj-py-attrition",
        title: "Employee Attrition & Workforce Analytics",
        category: "Python",
        badge: "HR Intelligence",
        shortDescription: "Diagnosed historical employee turnover metrics across multiple departments using statistical correlation, demographic clustering, and hypothesis testing.",
        detailedDescription: "A comprehensive workforce analytics project examining key attrition drivers such as overtime hours, commute distance, promotion stagnation, and compensation disparity.",
        technologies: ["Python", "Pandas", "NumPy", "Seaborn", "Statistical Modeling"],
        projectOverview: "Excessive employee turnover leads to substantial recruitment and retraining costs. This project utilized exploratory data analysis and hypothesis testing to identify flight risks.",
        keyPoints: [
          { id: "kp-2-1", text: "Analyzed correlation between employee overtime and voluntary resignation rates.", order: 1 },
          { id: "kp-2-2", text: "Pinpointed high turnover velocity in sales representatives after 18-24 months of tenure.", order: 2 },
          { id: "kp-2-3", text: "Evaluated compensation quartiles against peer industry benchmarks to highlight flight-risk employees.", order: 3 }
        ],
        keyFindings: "Employees logging regular overtime were 2.8x more likely to leave unless rewarded with lateral growth or promotion within 2 years.",
        businessImpact: "Assisted HR leadership in restructuring overtime compensation and career pathing, targeting a $120K annual reduction in replacement overhead.",
        githubUrl: "",
        liveUrl: "",
        dashboardUrl: "",
        thumbnailUrl: "",
        featured: true,
        displayOrder: 2,
        isPublished: true,
        updatedAt: new Date().toISOString()
      },
      {
        id: "proj-py-loan-risk",
        title: "Loan Default Risk Analysis",
        category: "Python",
        badge: "Risk & Credit",
        shortDescription: "Assessed financial lending datasets to identify borrower risk indicators, loan default likelihood, and debt-to-income distribution thresholds.",
        detailedDescription: "Exploratory risk modeling project examining loan applicants, historical charge-offs, credit utilization ratios, and payment histories to safeguard capital.",
        technologies: ["Python", "Pandas", "NumPy", "EDA", "Risk Modeling"],
        projectOverview: "Financial institutions require rigorous underwriting thresholds to minimize non-performing loans without needlessly restricting credit access.",
        keyPoints: [
          { id: "kp-3-1", text: "Mapped credit score tiers against historical default frequencies.", order: 1 },
          { id: "kp-3-2", text: "Identified debt-to-income (DTI) thresholds exceeding 28% as primary default triggers.", order: 2 },
          { id: "kp-3-3", text: "Evaluated loan grade distribution to identify sub-grades with unsustainable loss ratios.", order: 3 }
        ],
        keyFindings: "Borrowers with revolv-credit utilization exceeding 65% experienced 3.4x higher default rates, regardless of annual income bracket.",
        businessImpact: "Delivered recommendations to tighten underwriting on borderline grade C/D loans, lowering projected charge-offs by 18%.",
        githubUrl: "",
        liveUrl: "",
        dashboardUrl: "",
        thumbnailUrl: "",
        featured: true,
        displayOrder: 3,
        isPublished: true,
        updatedAt: new Date().toISOString()
      },
      {
        id: "proj-py-food-delivery",
        title: "Food Delivery Operations & Delivery Performance Analysis",
        category: "Python",
        badge: "Operations Analytics",
        shortDescription: "Analyzed logistics data from on-demand food delivery runs to uncover order fulfillment bottlenecks, peak rush hour delays, and delivery partner efficiency.",
        detailedDescription: "Operational performance analysis examining delivery times, traffic conditions, weather impact, and kitchen prep delays across major city zones.",
        technologies: ["Python", "Pandas", "NumPy", "Matplotlib", "KPI Analytics"],
        projectOverview: "Customer satisfaction in quick-commerce depends heavily on delivery punctuality. This project dissected fulfillment cycles to optimize courier dispatching.",
        keyPoints: [
          { id: "kp-4-1", text: "Dissected transit cycle into kitchen prep time vs delivery transit time.", order: 1 },
          { id: "kp-4-2", text: "Uncovered that 60% of late delivery penalties originated from restaurant prep lag during 7-9 PM.", order: 2 },
          { id: "kp-4-3", text: "Analyzed delivery partner density across geo-clusters to balance dispatch load.", order: 3 }
        ],
        keyFindings: "Orders exceeding 35 minutes saw customer retention drop by 22% on subsequent weekly orders.",
        businessImpact: "Formulated a dynamic dispatch buffer algorithm that improved peak-hour SLA compliance by 15%.",
        githubUrl: "",
        liveUrl: "",
        dashboardUrl: "",
        thumbnailUrl: "",
        featured: false,
        displayOrder: 4,
        isPublished: true,
        updatedAt: new Date().toISOString()
      },
      {
        id: "proj-sql-banking",
        title: "Banking Customer Transaction Analytics",
        category: "SQL",
        badge: "Financial Analytics",
        shortDescription: "Built modular PostgreSQL analytical scripts utilizing Window Functions and Common Table Expressions (CTEs) to audit transactional velocity and churn flags.",
        detailedDescription: "Complex SQL audit modeling transaction patterns, velocity surges, dormant checking accounts, and suspicious high-frequency transfers.",
        technologies: ["SQL", "PostgreSQL", "Window Functions", "CTEs", "Cohort Analysis"],
        projectOverview: "Relational banking databases require efficient analytical queries to identify customer behavior trends without locking operational OLTP tables.",
        keyPoints: [
          { id: "kp-5-1", text: "Constructed rolling 30-day balance averages utilizing SQL Window Functions (AVG, SUM OVER).", order: 1 },
          { id: "kp-5-2", text: "Flagged anomalous debit velocity surges exceeding 4 standard deviations from customer mean.", order: 2 },
          { id: "kp-5-3", text: "Detected 14% dormant account rate within first 90 days of onboarding.", order: 3 }
        ],
        keyFindings: "Accounts with zero digital wallet transactions in the first 30 days exhibited an 85% probability of becoming dormant by month 6.",
        businessImpact: "Supported fraud and anti-money laundering (AML) audits while creating early-warning indicators for retail bank relationship managers.",
        githubUrl: "",
        liveUrl: "",
        dashboardUrl: "",
        thumbnailUrl: "",
        featured: true,
        displayOrder: 5,
        isPublished: true,
        updatedAt: new Date().toISOString()
      },
      {
        id: "proj-sql-retail",
        title: "Retail Sales & Inventory Intelligence",
        category: "SQL",
        badge: "Supply Chain",
        shortDescription: "Engineered complex SQL queries across multi-store retail databases to measure stock turnover rates, SKU velocities, and recurring inventory stockouts.",
        detailedDescription: "Multi-table relational schema analysis calculating inventory turnover ratios, carrying costs, reorder trigger alerts, and supplier delivery lag.",
        technologies: ["SQL", "PostgreSQL", "Complex Joins", "Subqueries", "Aggregations"],
        projectOverview: "Stockouts cause lost sales, while overstock leads to steep holding costs. This SQL project designed inventory replenishment intelligence.",
        keyPoints: [
          { id: "kp-6-1", text: "Calculated stock turnover ratio and days-of-inventory-on-hand across 500+ SKUs.", order: 1 },
          { id: "kp-6-2", text: "Identified high-margin products with frequent stockouts during holiday promotions.", order: 2 },
          { id: "kp-6-3", text: "Built automated alerts for lead-time variances exceeding supplier SLAs by >5 days.", order: 3 }
        ],
        keyFindings: "Top 15% SKUs drove 68% of retail gross margin but experienced stockouts 12% of peak shopping days.",
        businessImpact: "Enabled automated safety stock reorder triggers, reducing inventory holding costs by 9% while cutting lost sales.",
        githubUrl: "",
        liveUrl: "",
        dashboardUrl: "",
        thumbnailUrl: "",
        featured: true,
        displayOrder: 6,
        isPublished: true,
        updatedAt: new Date().toISOString()
      },
      {
        id: "proj-sql-hr",
        title: "HR Workforce Analytics",
        category: "SQL",
        badge: "Organizational Data",
        shortDescription: "Structured recursive queries and aggregations to analyze organizational hierarchy, tenure progressions, and salary parity across enterprise divisions.",
        detailedDescription: "Relational database analysis auditing reporting structures, promotion intervals, compensation distributions, and departmental headcount flux.",
        technologies: ["SQL", "PostgreSQL", "Recursive CTEs", "Grouping Sets", "Performance Indexing"],
        projectOverview: "Enterprise org charts and compensation records require complex relational querying to ensure equitable career trajectories and payroll optimization.",
        keyPoints: [
          { id: "kp-7-1", text: "Implemented Recursive CTEs to traverse multi-tiered management hierarchies.", order: 1 },
          { id: "kp-7-2", text: "Analyzed salary equity across gender and tenure bands using SQL GROUPING SETS.", order: 2 },
          { id: "kp-7-3", text: "Calculated net headcount additions vs voluntary exits by quarter.", order: 3 }
        ],
        keyFindings: "Identified promotional lag in engineering departments where average time-in-role exceeded company benchmark by 14 months.",
        businessImpact: "Supplied executive leadership with data-driven compensation adjustments and streamlined reporting structures.",
        githubUrl: "",
        liveUrl: "",
        dashboardUrl: "",
        thumbnailUrl: "",
        featured: false,
        displayOrder: 7,
        isPublished: true,
        updatedAt: new Date().toISOString()
      }
    ];

    // Resumes Seed
    const seedResumes = [
      {
        id: "res-initial",
        filename: "Kishor_Kumar_Resume.pdf",
        originalName: "Kishor_Kumar_Data_Analyst_Resume.pdf",
        path: "assets/Kishor_Kumar_Resume.pdf",
        fileSize: 1022,
        mimeType: "application/pdf",
        uploadDate: new Date().toISOString(),
        source: "local",
        isActive: true
      }
    ];

    // Full database structure
    this.data = {
      admin: {
        email: adminEmail,
        passwordHash: hash,
        updatedAt: new Date().toISOString()
      },
      draft: {
        content: JSON.parse(JSON.stringify(baseContent)),
        projects: JSON.parse(JSON.stringify(seedProjects))
      },
      published: {
        content: JSON.parse(JSON.stringify(baseContent)),
        projects: JSON.parse(JSON.stringify(seedProjects))
      },
      resumes: seedResumes,
      activeResumeId: "res-initial",
      media: [],
      hasUnpublishedChanges: false,
      lastUpdated: new Date().toISOString(),
      lastPublished: new Date().toISOString()
    };

    this.save();
    console.log('Database initialized and seeded successfully.');
  }

  save() {
    try {
      const json = JSON.stringify(this.data, null, 2);
      fs.writeFileSync(DB_TMP, json, 'utf8');
      fs.renameSync(DB_TMP, DB_FILE);
      return true;
    } catch (err) {
      console.error('Database save error:', err);
      return false;
    }
  }

  // ----------------------------------------------------------------------------
  // Public Access Methods
  // ----------------------------------------------------------------------------
  getPublicContent() {
    const pub = this.data.published || {};
    const content = pub.content || {};
    const projects = (pub.projects || []).filter(p => p.isPublished !== false);

    // Get active resume reference
    const activeResume = (this.data.resumes || []).find(r => r.id === this.data.activeResumeId) || (this.data.resumes || [])[0] || null;

    return {
      siteSettings: content.siteSettings,
      navLabels: content.navLabels,
      hero: content.hero,
      profile: content.profile,
      about: content.about,
      experience: content.experience,
      skills: content.skills,
      githubSection: content.githubSection,
      powerBiDashboards: (content.powerBiDashboards || []).filter(d => d.isPublished !== false),
      resumeSection: content.resumeSection,
      socialProfiles: (content.socialProfiles || [])
        .filter(s => s.isEnabled !== false && s.url && s.url.trim() !== '')
        .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)),
      contact: content.contact,
      seo: content.seo,
      projects: projects,
      activeResume: activeResume ? {
        id: activeResume.id,
        filename: activeResume.originalName || activeResume.filename,
        downloadUrl: '/api/resume/download',
        viewUrl: '/api/resume/preview',
        uploadDate: activeResume.uploadDate
      } : null,
      lastPublished: this.data.lastPublished
    };
  }

  // ----------------------------------------------------------------------------
  // Admin Access Methods
  // ----------------------------------------------------------------------------
  getAdminData() {
    return {
      draft: this.data.draft,
      published: this.data.published,
      resumes: this.data.resumes,
      activeResumeId: this.data.activeResumeId,
      media: this.data.media,
      enquiries: this.data.enquiries || [],
      enquiryStats: this.getEnquiryStats(),
      hasUnpublishedChanges: this.data.hasUnpublishedChanges,
      lastUpdated: this.data.lastUpdated,
      lastPublished: this.data.lastPublished,
      adminEmail: this.data.admin.email
    };
  }

  updateDraftSection(sectionKey, sectionData) {
    if (!this.data.draft.content) this.data.draft.content = {};
    this.data.draft.content[sectionKey] = sectionData;
    this.data.hasUnpublishedChanges = true;
    this.data.lastUpdated = new Date().toISOString();
    return this.save();
  }

  updateFullDraftContent(contentObject) {
    this.data.draft.content = contentObject;
    this.data.hasUnpublishedChanges = true;
    this.data.lastUpdated = new Date().toISOString();
    return this.save();
  }

  publishAll() {
    this.data.published = JSON.parse(JSON.stringify(this.data.draft));
    this.data.hasUnpublishedChanges = false;
    this.data.lastPublished = new Date().toISOString();
    this.data.lastUpdated = new Date().toISOString();
    return this.save();
  }

  // ----------------------------------------------------------------------------
  // Project Management Methods
  // ----------------------------------------------------------------------------
  getProjects(draft = true) {
    const list = draft ? this.data.draft.projects : this.data.published.projects;
    return (list || []).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }

  getProjectById(id, draft = true) {
    const list = this.getProjects(draft);
    return list.find(p => p.id === id);
  }

  saveProject(projectData) {
    if (!this.data.draft.projects) this.data.draft.projects = [];
    const index = this.data.draft.projects.findIndex(p => p.id === projectData.id);

    projectData.updatedAt = new Date().toISOString();

    if (index >= 0) {
      this.data.draft.projects[index] = { ...this.data.draft.projects[index], ...projectData };
    } else {
      if (!projectData.id) projectData.id = 'proj-' + Date.now();
      if (projectData.displayOrder === undefined) {
        projectData.displayOrder = this.data.draft.projects.length + 1;
      }
      this.data.draft.projects.push(projectData);
    }

    this.data.hasUnpublishedChanges = true;
    this.data.lastUpdated = new Date().toISOString();
    this.save();
    return projectData;
  }

  deleteProject(id) {
    if (!this.data.draft.projects) return false;
    this.data.draft.projects = this.data.draft.projects.filter(p => p.id !== id);
    this.data.hasUnpublishedChanges = true;
    this.data.lastUpdated = new Date().toISOString();
    return this.save();
  }

  duplicateProject(id) {
    const original = this.getProjectById(id, true);
    if (!original) return null;

    const copy = JSON.parse(JSON.stringify(original));
    copy.id = 'proj-' + Date.now();
    copy.title = `${copy.title} (Copy)`;
    copy.isPublished = false;
    copy.displayOrder = (this.data.draft.projects || []).length + 1;
    copy.updatedAt = new Date().toISOString();

    this.data.draft.projects.push(copy);
    this.data.hasUnpublishedChanges = true;
    this.data.lastUpdated = new Date().toISOString();
    this.save();
    return copy;
  }

  reorderProjects(orderArray) {
    // orderArray is array of { id, displayOrder }
    const projects = this.data.draft.projects || [];
    orderArray.forEach(item => {
      const proj = projects.find(p => p.id === item.id);
      if (proj) {
        proj.displayOrder = item.displayOrder;
      }
    });
    this.data.hasUnpublishedChanges = true;
    this.data.lastUpdated = new Date().toISOString();
    return this.save();
  }

  // ----------------------------------------------------------------------------
  // Resume Management Methods
  // ----------------------------------------------------------------------------
  getResumes() {
    return this.data.resumes || [];
  }

  getActiveResume() {
    const resumes = this.data.resumes || [];
    return resumes.find(r => r.id === this.data.activeResumeId) || resumes[0] || null;
  }

  addResume(resumeRecord) {
    if (!this.data.resumes) this.data.resumes = [];
    
    // Mark previous as not active if this one is active
    if (resumeRecord.isActive) {
      this.data.resumes.forEach(r => r.isActive = false);
      this.data.activeResumeId = resumeRecord.id;
    }

    this.data.resumes.unshift(resumeRecord);
    this.data.hasUnpublishedChanges = true;
    this.data.lastUpdated = new Date().toISOString();
    this.save();
    return resumeRecord;
  }

  setActiveResume(resumeId) {
    const resumes = this.data.resumes || [];
    const target = resumes.find(r => r.id === resumeId);
    if (!target) return false;

    resumes.forEach(r => r.isActive = (r.id === resumeId));
    this.data.activeResumeId = resumeId;
    this.data.hasUnpublishedChanges = true;
    this.data.lastUpdated = new Date().toISOString();
    return this.save();
  }

  deleteResume(resumeId) {
    if (!this.data.resumes) return false;
    const resumeToDelete = this.data.resumes.find(r => r.id === resumeId);
    if (!resumeToDelete) return false;

    // Delete file from disk if in uploads
    if (resumeToDelete.path && resumeToDelete.path.startsWith('uploads/')) {
      const fullPath = path.join(__dirname, '..', resumeToDelete.path);
      if (fs.existsSync(fullPath)) {
        try { fs.unlinkSync(fullPath); } catch (e) { console.warn('Could not unlink resume file:', e); }
      }
    }

    this.data.resumes = this.data.resumes.filter(r => r.id !== resumeId);

    // If active resume was deleted, make the latest one active
    if (this.data.activeResumeId === resumeId && this.data.resumes.length > 0) {
      this.data.resumes[0].isActive = true;
      this.data.activeResumeId = this.data.resumes[0].id;
    }

    this.data.hasUnpublishedChanges = true;
    this.data.lastUpdated = new Date().toISOString();
    return this.save();
  }

  // ----------------------------------------------------------------------------
  // Media Management Methods
  // ----------------------------------------------------------------------------
  getMedia() {
    return this.data.media || [];
  }

  addMedia(mediaItem) {
    if (!this.data.media) this.data.media = [];
    this.data.media.unshift(mediaItem);
    this.data.lastUpdated = new Date().toISOString();
    this.save();
    return mediaItem;
  }

  deleteMedia(mediaId) {
    if (!this.data.media) return false;
    const item = this.data.media.find(m => m.id === mediaId);
    if (!item) return false;

    if (item.path && item.path.startsWith('uploads/')) {
      const fullPath = path.join(__dirname, '..', item.path);
      if (fs.existsSync(fullPath)) {
        try { fs.unlinkSync(fullPath); } catch (e) { console.warn('Could not unlink media file:', e); }
      }
    }

    this.data.media = this.data.media.filter(m => m.id !== mediaId);
    this.data.lastUpdated = new Date().toISOString();
    return this.save();
  }

  // ----------------------------------------------------------------------------
  // Social Profiles Management Methods
  // ----------------------------------------------------------------------------
  getSocialProfiles(draft = true) {
    const list = draft
      ? (this.data.draft && this.data.draft.content && this.data.draft.content.socialProfiles) || []
      : (this.data.published && this.data.published.content && this.data.published.content.socialProfiles) || [];
    return [...list].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }

  saveSocialProfile(profileData) {
    if (!this.data.draft.content) this.data.draft.content = {};
    if (!this.data.draft.content.socialProfiles) this.data.draft.content.socialProfiles = [];

    const list = this.data.draft.content.socialProfiles;
    const index = list.findIndex(p => p.id === profileData.id);

    if (profileData.isEnabled === undefined) {
      profileData.isEnabled = Boolean(profileData.url && profileData.url.trim() !== '');
    }

    if (index >= 0) {
      list[index] = { ...list[index], ...profileData };
    } else {
      if (!profileData.id) {
        profileData.id = 'soc-' + Date.now();
      }
      if (profileData.displayOrder === undefined) {
        profileData.displayOrder = list.length + 1;
      }
      list.push(profileData);
    }

    this.data.hasUnpublishedChanges = true;
    this.data.lastUpdated = new Date().toISOString();
    this.save();
    return profileData;
  }

  deleteSocialProfile(id) {
    if (!this.data.draft.content || !this.data.draft.content.socialProfiles) return false;
    this.data.draft.content.socialProfiles = this.data.draft.content.socialProfiles.filter(p => p.id !== id);
    this.data.hasUnpublishedChanges = true;
    this.data.lastUpdated = new Date().toISOString();
    return this.save();
  }

  reorderSocialProfiles(orderArray) {
    if (!this.data.draft.content || !this.data.draft.content.socialProfiles) return false;
    const list = this.data.draft.content.socialProfiles;
    orderArray.forEach(item => {
      const p = list.find(x => x.id === item.id);
      if (p) {
        p.displayOrder = item.displayOrder;
      }
    });
    this.data.hasUnpublishedChanges = true;
    this.data.lastUpdated = new Date().toISOString();
    return this.save();
  }

  toggleSocialProfile(id) {
    if (!this.data.draft.content || !this.data.draft.content.socialProfiles) return null;
    const p = this.data.draft.content.socialProfiles.find(x => x.id === id);
    if (!p) return null;
    p.isEnabled = !p.isEnabled;
    this.data.hasUnpublishedChanges = true;
    this.data.lastUpdated = new Date().toISOString();
    this.save();
    return p;
  }

  // ----------------------------------------------------------------------------
  // Contact Enquiries Management Methods
  // ----------------------------------------------------------------------------
  getEnquiries(filter = {}) {
    if (!this.data.enquiries) this.data.enquiries = [];
    let list = [...this.data.enquiries];

    if (filter.status && filter.status !== 'all') {
      list = list.filter(e => e.status === filter.status);
    }

    if (filter.search && filter.search.trim() !== '') {
      const q = filter.search.toLowerCase().trim();
      list = list.filter(e =>
        (e.name && e.name.toLowerCase().includes(q)) ||
        (e.email && e.email.toLowerCase().includes(q)) ||
        (e.subject && e.subject.toLowerCase().includes(q)) ||
        (e.message && e.message.toLowerCase().includes(q))
      );
    }

    // Newest first
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  getEnquiryById(id) {
    if (!this.data.enquiries) return null;
    return this.data.enquiries.find(e => e.id === id) || null;
  }

  addEnquiry(enquiryData) {
    if (!this.data.enquiries) this.data.enquiries = [];
    const newEnquiry = {
      id: 'enq-' + Date.now(),
      name: (enquiryData.name || '').trim(),
      email: (enquiryData.email || '').trim().toLowerCase(),
      subject: (enquiryData.subject || '').trim(),
      message: (enquiryData.message || '').trim(),
      status: 'unread', // 'unread', 'read', 'archived'
      createdAt: new Date().toISOString(),
      readAt: null
    };

    this.data.enquiries.unshift(newEnquiry);
    // Instant direct database save (independent of CMS publish)
    this.save();
    return newEnquiry;
  }

  updateEnquiryStatus(id, status) {
    if (!this.data.enquiries) return null;
    const enquiry = this.data.enquiries.find(e => e.id === id);
    if (!enquiry) return null;
    enquiry.status = status;
    if (status === 'read' && !enquiry.readAt) {
      enquiry.readAt = new Date().toISOString();
    }
    this.save();
    return enquiry;
  }

  deleteEnquiry(id) {
    if (!this.data.enquiries) return false;
    const initialLen = this.data.enquiries.length;
    this.data.enquiries = this.data.enquiries.filter(e => e.id !== id);
    if (this.data.enquiries.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  getEnquiryStats() {
    const list = this.data.enquiries || [];
    const total = list.length;
    const unread = list.filter(e => e.status === 'unread').length;
    const read = list.filter(e => e.status === 'read').length;
    const archived = list.filter(e => e.status === 'archived').length;
    const latest = list.length > 0 ? list[0].createdAt : null;
    return { total, unread, read, archived, latest };
  }
}

const db = new PortfolioDatabase();
module.exports = db;

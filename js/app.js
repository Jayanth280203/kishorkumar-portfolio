/**
 * ==============================================================================
 * KISHOR KUMAR - DATA ANALYST PORTFOLIO ENGINE (js/app.js)
 * High-performance Public Viewer Client with Live API Sync & Offline Fallback
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Application State
  const state = {
    content: null,
    currentFilter: 'all'
  };

  // 1. Fetch Live Published Content (with offline fallback)
  await loadPublishedContent();

  // 2. Initialize Navigation & Interactivity
  initNavigation();
  initBackToTop();

  // 3. Render Public Sections
  renderBrandingAndSEO();
  renderHero();
  renderAboutSection();
  renderExperienceSection();
  renderSkillsSection();
  renderProjectsSection();
  renderGitHubBanner();
  renderPowerBiDashboards();
  renderResumeSection();
  renderProfessionalProfiles();
  renderContactSection();
  renderFooter();

  // ----------------------------------------------------------------------------
  // DATA FETCHING & SYNC
  // ----------------------------------------------------------------------------
  async function loadPublishedContent() {
    try {
      const res = await fetch('/api/public/content');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          state.content = json.data;
          return;
        }
      }
    } catch (err) {
      console.info('Live API unavailable, falling back to static config.js:', err.message);
    }

    // Fallback to static config.js if offline or direct file:// access
    if (window.portfolioConfig) {
      state.content = convertStaticConfigToModel(window.portfolioConfig);
    }
  }

  function convertStaticConfigToModel(cfg) {
    return {
      siteSettings: {
        websiteName: cfg.profile?.name || "Kishor Kumar",
        logoBadge: "KK",
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
        name: cfg.profile?.name || "Kishor Kumar",
        professionalTitle: cfg.profile?.title || "Data Analyst",
        shortDescription: cfg.profile?.shortDescription || "",
        chips: [
          { icon: "fa-database", text: "SQL & PostgreSQL" },
          { icon: "fa-brands fa-python", text: "Python & Pandas" },
          { icon: "fa-chart-column", text: "Power BI & DAX" },
          { icon: "fa-file-excel", text: "Advanced Excel" },
          { icon: "fa-bolt", text: "Process Automation" }
        ]
      },
      profile: cfg.profile || {},
      about: cfg.about || {},
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
        }
      ],
      skills: cfg.skills || [],
      githubSection: {
        tag: "Open Source & Code Repositories",
        title: "Explore My GitHub Projects",
        description: "Explore my data analytics projects, SQL analysis, Python notebooks, dashboards, and data-driven solutions.",
        buttonLabel: "Explore GitHub Profile"
      },
      powerBiDashboards: cfg.powerBiDashboards || [],
      resumeSection: cfg.resumeData || {},
      socialProfiles: cfg.professionalProfiles || [],
      contact: {
        tag: "Let's Connect",
        heading: "Get in Touch",
        subtitle: "Have a data analyst role or analytical problem to solve? I'd love to discuss how I can help.",
        description: "I am actively seeking Data Analyst opportunities where I can apply my SQL, Python, and Power BI skills to drive real business value."
      },
      projects: cfg.projects || [],
      activeResume: {
        filename: "Kishor_Kumar_Resume.pdf",
        downloadUrl: cfg.profile?.resumeUrl || "assets/Kishor_Kumar_Resume.pdf",
        viewUrl: cfg.profile?.resumeUrl || "assets/Kishor_Kumar_Resume.pdf"
      }
    };
  }

  // ----------------------------------------------------------------------------
  // NAVIGATION & SCROLL LISTENER
  // ----------------------------------------------------------------------------
  // NAVIGATION & SCROLL LISTENER
  // ----------------------------------------------------------------------------
  function initNavigation() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Sticky navbar shadow on scroll
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });

    // Mobile menu toggle
    if (navToggle && navMenu) {
      navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('open');
        navMenu.classList.toggle('open');
      });

      navLinks.forEach(link => {
        link.addEventListener('click', () => {
          navToggle.classList.remove('open');
          navMenu.classList.remove('open');
        });
      });
    }

    // Top-Left Logo / Avatar Dropdown Menu
    const brandWrap = document.getElementById('navBrandWrap');
    const brandBtn = document.getElementById('navBrandBtn');
    const menuPortfolio = document.getElementById('menuItemPortfolio');
    const menuSettings = document.getElementById('menuItemSettings');
    const menuAdminLogin = document.getElementById('menuItemAdminLogin');
    const menuAdminDashboard = document.getElementById('menuItemAdminDashboard');
    const menuAdminLogout = document.getElementById('menuItemAdminLogout');

    if (brandBtn && brandWrap) {
      brandBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = brandWrap.classList.toggle('open');
        brandBtn.setAttribute('aria-expanded', isOpen);
      });

      // Close dropdown on outside click
      document.addEventListener('click', (e) => {
        if (!brandWrap.contains(e.target)) {
          brandWrap.classList.remove('open');
          brandBtn.setAttribute('aria-expanded', 'false');
        }
      });
    }

    // Check admin authentication status to update menu
    async function checkNavAuth() {
      try {
        const res = await fetch('/api/auth/me');
        const json = await res.json();
        if (res.ok && json.authenticated) {
          if (menuAdminLogin) menuAdminLogin.style.display = 'none';
          if (menuAdminDashboard) menuAdminDashboard.style.display = 'flex';
          if (menuAdminLogout) menuAdminLogout.style.display = 'flex';
        } else {
          if (menuAdminLogin) menuAdminLogin.style.display = 'flex';
          if (menuAdminDashboard) menuAdminDashboard.style.display = 'none';
          if (menuAdminLogout) menuAdminLogout.style.display = 'none';
        }
      } catch (_) {
        if (menuAdminLogin) menuAdminLogin.style.display = 'flex';
        if (menuAdminDashboard) menuAdminDashboard.style.display = 'none';
        if (menuAdminLogout) menuAdminLogout.style.display = 'none';
      }
    }
    checkNavAuth();

    // Admin Logout button in menu
    if (menuAdminLogout) {
      menuAdminLogout.addEventListener('click', async () => {
        brandWrap?.classList.remove('open');
        try {
          await fetch('/api/auth/logout', { method: 'POST' });
          showToast('Logged out of admin session.', 'info');
          checkNavAuth();
        } catch (_) {}
      });
    }

    // Modals initialization
    initPublicModals(checkNavAuth);

    // Active link highlighting on scroll
    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', () => {
      let currentId = '';
      const scrollPos = window.scrollY + 140;

      sections.forEach(sec => {
        const top = sec.offsetTop;
        const height = sec.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
          currentId = sec.getAttribute('id');
        }
      });

      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentId}`) {
          link.classList.add('active');
        }
      });
    });
  }

  // ----------------------------------------------------------------------------
  // PUBLIC MODALS (Admin Login & Appearance Settings)
  // ----------------------------------------------------------------------------
  function initPublicModals(onAuthChange) {
    const brandWrap = document.getElementById('navBrandWrap');

    // 1. Admin Login Modal
    const loginModal = document.getElementById('publicAdminLoginModal');
    const openLoginBtn = document.getElementById('menuItemAdminLogin');
    const closeLoginBtn = document.getElementById('closePublicLoginBtn');
    const loginForm = document.getElementById('publicLoginForm');
    const loginAlert = document.getElementById('publicLoginAlert');
    const loginAlertText = document.getElementById('publicLoginAlertText');
    const loginSubmitBtn = document.getElementById('pubLoginSubmitBtn');

    if (openLoginBtn && loginModal) {
      openLoginBtn.addEventListener('click', () => {
        brandWrap?.classList.remove('open');
        loginModal.classList.add('active');
        loginAlert.style.display = 'none';
      });
    }

    if (closeLoginBtn && loginModal) {
      closeLoginBtn.addEventListener('click', () => {
        loginModal.classList.remove('active');
      });
    }

    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('pubLoginEmail').value.trim();
        const password = document.getElementById('pubLoginPassword').value;

        loginAlert.style.display = 'none';
        loginSubmitBtn.disabled = true;
        loginSubmitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Authenticating...';

        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });
          const json = await res.json();

          if (res.ok && json.success) {
            loginModal.classList.remove('active');
            showToast('Authenticated! Redirecting to Admin Editor...', 'success');
            if (onAuthChange) onAuthChange();
            setTimeout(() => {
              window.location.href = '/admin';
            }, 600);
          } else {
            loginAlert.style.display = 'flex';
            loginAlertText.textContent = json.error || 'Authentication failed. Please verify credentials.';
          }
        } catch (_) {
          loginAlert.style.display = 'flex';
          loginAlertText.textContent = 'Server connection error. Please try again.';
        } finally {
          loginSubmitBtn.disabled = false;
          loginSubmitBtn.innerHTML = '<i class="fa-solid fa-lock-open"></i> Sign In to CMS';
        }
      });
    }

    // 2. Appearance Settings Modal
    const settingsModal = document.getElementById('publicSettingsModal');
    const openSettingsBtn = document.getElementById('menuItemSettings');
    const closeSettingsBtn = document.getElementById('closePublicSettingsBtn');
    const closeSettingsFooterBtn = document.getElementById('closePublicSettingsFooterBtn');

    if (openSettingsBtn && settingsModal) {
      openSettingsBtn.addEventListener('click', () => {
        brandWrap?.classList.remove('open');
        settingsModal.classList.add('active');
      });
    }

    const closeSettings = () => settingsModal?.classList.remove('active');
    if (closeSettingsBtn) closeSettingsBtn.addEventListener('click', closeSettings);
    if (closeSettingsFooterBtn) closeSettingsFooterBtn.addEventListener('click', closeSettings);

    // Accent theme selection
    document.querySelectorAll('.theme-accent-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const accent = btn.getAttribute('data-accent');
        applyAccentTheme(accent);
        showToast(`Theme updated to ${btn.textContent.trim()}`, 'success');
      });
    });

    // Apply saved theme
    const savedAccent = localStorage.getItem('kk_portfolio_theme') || 'cyan';
    applyAccentTheme(savedAccent);
  }

  function applyAccentTheme(theme) {
    localStorage.setItem('kk_portfolio_theme', theme);
    const root = document.documentElement;

    if (theme === 'blue') {
      root.style.setProperty('--accent-cyan', '#3b82f6');
      root.style.setProperty('--accent-cyan-light', '#60a5fa');
      root.style.setProperty('--shadow-cyan-glow', '0 0 25px rgba(59, 130, 246, 0.35)');
    } else if (theme === 'indigo') {
      root.style.setProperty('--accent-cyan', '#818cf8');
      root.style.setProperty('--accent-cyan-light', '#a5b4fc');
      root.style.setProperty('--shadow-cyan-glow', '0 0 25px rgba(99, 102, 241, 0.35)');
    } else if (theme === 'emerald') {
      root.style.setProperty('--accent-cyan', '#34d399');
      root.style.setProperty('--accent-cyan-light', '#6ee7b7');
      root.style.setProperty('--shadow-cyan-glow', '0 0 25px rgba(16, 185, 129, 0.35)');
    } else {
      // Default Cyan
      root.style.setProperty('--accent-cyan', '#06b6d4');
      root.style.setProperty('--accent-cyan-light', '#22d3ee');
      root.style.setProperty('--shadow-cyan-glow', '0 0 25px rgba(6, 182, 212, 0.35)');
    }
  }

  // ----------------------------------------------------------------------------
  // BRANDING & SEO
  // ----------------------------------------------------------------------------
  function renderBrandingAndSEO() {
    const c = state.content || {};
    const s = c.siteSettings || {};
    const n = c.navLabels || {};
    const seo = c.seo || {};

    // Page & Meta Titles
    if (seo.metaTitle) {
      document.title = seo.metaTitle;
      const metaTitleElem = document.getElementById('metaPageTitle');
      if (metaTitleElem) metaTitleElem.textContent = seo.metaTitle;
    }
    if (seo.metaDescription) {
      document.getElementById('metaDescription')?.setAttribute('content', seo.metaDescription);
      document.getElementById('ogDesc')?.setAttribute('content', seo.metaDescription);
    }
    if (seo.keywords) {
      document.getElementById('metaKeywords')?.setAttribute('content', seo.keywords);
    }

    // Navbar branding & labels
    setText('navLogoBadge', s.logoBadge || 'KK');
    setText('navBrandName', s.logoTitle || s.websiteName || 'Kishor Kumar');
    setText('navBrandRole', s.logoSubtitle || 'Data Analyst');

    setText('navLinkHome', n.home || 'Home');
    setText('navLinkAbout', n.about || 'About');
    setText('navLinkExperience', n.experience || 'Experience');
    setText('navLinkSkills', n.skills || 'Skills');
    setText('navLinkProjects', n.projects || 'Projects');
    setText('navLinkDashboards', n.dashboards || 'Dashboards');
    setText('navLinkResume', n.resume || 'Resume');
    setText('navLinkContact', n.contact || 'Contact');
    setText('navCtaBtn', n.ctaButton || "Let's Talk");
  }

  // ----------------------------------------------------------------------------
  // 1. HERO SECTION
  // ----------------------------------------------------------------------------
  function renderHero() {
    const c = state.content || {};
    const p = c.profile || {};
    const h = c.hero || {};

    // Profile photo display with load and error fallbacks
    const heroImg = document.getElementById('heroProfileImg');
    const heroFallback = document.getElementById('heroAvatarFallback');
    let photoUrl = (p.photo || h.photo || '').trim();
    if (photoUrl && !photoUrl.startsWith('http://') && !photoUrl.startsWith('https://') && !photoUrl.startsWith('/')) {
      photoUrl = '/' + photoUrl;
    }

    if (photoUrl && photoUrl !== '') {
      if (heroImg) {
        heroImg.onload = () => {
          heroImg.style.display = 'block';
          if (heroFallback) heroFallback.style.display = 'none';
        };
        heroImg.onerror = () => {
          heroImg.style.display = 'none';
          if (heroFallback) heroFallback.style.display = 'flex';
        };
        heroImg.src = photoUrl;
        if (heroImg.complete && heroImg.naturalWidth > 0) {
          heroImg.style.display = 'block';
          if (heroFallback) heroFallback.style.display = 'none';
        }
      }
    } else {
      if (heroImg) {
        heroImg.src = '';
        heroImg.style.display = 'none';
      }
      if (heroFallback) heroFallback.style.display = 'flex';
    }

    setText('heroStatusText', h.statusBadge || p.availability || 'Open to Data Analyst Opportunities');
    setText('heroName', h.name || p.name || 'Kishor Kumar');
    
    const roleElem = document.getElementById('heroTitle');
    if (roleElem) {
      roleElem.innerHTML = `<i class="fa-solid fa-chart-pie"></i> ${escapeHtml(h.professionalTitle || p.title || 'Data Analyst')}`;
    }

    setText('heroDescription', h.shortDescription || p.shortDescription || '');

    // Chips
    const chipsBar = document.getElementById('heroChipsBar');
    if (chipsBar && h.chips && h.chips.length > 0) {
      chipsBar.innerHTML = h.chips.map(chip => `
        <span class="hero-chip"><i class="${chip.icon}"></i> ${escapeHtml(chip.text)}</span>
      `).join('');
    }

    // Hero buttons
    const btnGithub = document.getElementById('heroBtnGithub');
    const btnLinkedin = document.getElementById('heroBtnLinkedin');

    if (btnGithub) {
      if (p.github && p.github.trim() !== '') {
        btnGithub.href = p.github;
        btnGithub.target = '_blank';
        btnGithub.rel = 'noopener noreferrer';
        btnGithub.style.display = 'inline-flex';
      } else {
        btnGithub.style.display = 'none';
      }
    }

    if (btnLinkedin) {
      if (p.linkedin && p.linkedin.trim() !== '') {
        btnLinkedin.href = p.linkedin;
        btnLinkedin.target = '_blank';
        btnLinkedin.rel = 'noopener noreferrer';
        btnLinkedin.style.display = 'inline-flex';
      } else {
        btnLinkedin.style.display = 'none';
      }
    }
  }

  // ----------------------------------------------------------------------------
  // 2. ABOUT ME SECTION
  // ----------------------------------------------------------------------------
  function renderAboutSection() {
    const a = state.content?.about || {};

    setText('aboutSubtitle', a.lead || 'A data-driven problem solver connecting raw data to strategic executive decisions.');
    setText('aboutLead', a.heading || 'Turning Complex Data into Strategic Business Decisions');

    const body = document.getElementById('aboutBody');
    if (body && a.paragraphs) {
      body.innerHTML = a.paragraphs.map(p => `<p>${escapeHtml(p)}</p>`).join('');
    }

    const highlights = document.getElementById('aboutHighlights');
    if (highlights && a.highlights) {
      highlights.innerHTML = a.highlights.map(hl => `
        <div class="highlight-box">
          <div class="highlight-box-icon"><i class="fa-solid ${hl.icon}"></i></div>
          <h4 class="highlight-box-title">${escapeHtml(hl.title)}</h4>
          <p class="highlight-box-desc">${escapeHtml(hl.desc)}</p>
        </div>
      `).join('');
    }

    const stats = document.getElementById('aboutStatsBanner');
    if (stats && a.stats) {
      stats.innerHTML = a.stats.map(s => `
        <div class="stat-card">
          <div class="stat-value">${escapeHtml(s.value)}</div>
          <div class="stat-label">${escapeHtml(s.label)}</div>
        </div>
      `).join('');
    }
  }

  // ----------------------------------------------------------------------------
  // 3. PROFESSIONAL EXPERIENCE SECTION
  // ----------------------------------------------------------------------------
  function renderExperienceSection() {
    const experiences = state.content?.experience || [];
    const container = document.getElementById('experienceTimelineContainer');
    if (!container) return;

    if (experiences.length === 0) {
      container.innerHTML = '<p style="text-align:center; color:var(--text-muted);">Experience details available upon request.</p>';
      return;
    }

    container.innerHTML = experiences.map(exp => `
      <div class="highlight-box" style="background: var(--bg-card); border-radius: var(--border-radius-card); padding: 2rem;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:0.5rem; margin-bottom: 0.75rem;">
          <div>
            <h3 style="font-size: 1.3rem; font-weight: 700; color: #fff;">${escapeHtml(exp.jobTitle)}</h3>
            <span style="color: var(--accent-cyan); font-weight: 600; font-size: 1rem;">${escapeHtml(exp.company)}</span>
            <span style="color: var(--text-dim); font-size: 0.85rem;"> • ${escapeHtml(exp.location || 'Remote')}</span>
          </div>
          <div style="background: rgba(37, 99, 235, 0.15); border: 1px solid rgba(37, 99, 235, 0.35); padding: 0.35rem 0.85rem; border-radius: var(--border-radius-pill); font-size: 0.82rem; color: #38bdf8; font-weight: 600;">
            <i class="fa-solid fa-calendar-days"></i> ${escapeHtml(exp.startDate)} — ${exp.isCurrent ? 'Present' : escapeHtml(exp.endDate || '')}
          </div>
        </div>

        <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.6; margin-bottom: 1rem;">
          ${escapeHtml(exp.description || '')}
        </p>

        ${(exp.achievements && exp.achievements.length > 0) ? `
          <div style="background: rgba(9, 17, 33, 0.65); border: 1px solid var(--border-light); border-radius: 12px; padding: 1.1rem;">
            <div style="font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: var(--accent-cyan); margin-bottom: 0.5rem;">
              <i class="fa-solid fa-trophy"></i> Key Commercial Achievements
            </div>
            <ul style="display: flex; flex-direction: column; gap: 0.45rem;">
              ${exp.achievements.map(ach => `
                <li style="display:flex; align-items:flex-start; gap:0.5rem; font-size:0.88rem; color:var(--text-muted); line-height:1.45;">
                  <i class="fa-solid fa-check" style="color:#4ade80; font-size:0.8rem; margin-top:3px; flex-shrink:0;"></i>
                  <span>${escapeHtml(ach)}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        ` : ''}
      </div>
    `).join('');
  }

  // ----------------------------------------------------------------------------
  // 4. SKILLS SECTION
  // ----------------------------------------------------------------------------
  function renderSkillsSection() {
    const skills = state.content?.skills || [];
    const container = document.getElementById('skillsGrid');
    if (!container) return;

    container.innerHTML = skills.map(cat => `
      <div class="skill-category-card">
        <div class="skill-category-header">
          <div class="skill-category-icon ${cat.accent || 'cyan'}">
            <i class="fa-solid ${cat.icon}"></i>
          </div>
          <h3 class="skill-category-title">${escapeHtml(cat.category)}</h3>
        </div>
        <div class="skill-chips-list">
          ${(cat.items || []).map(item => {
            const levelClass = (item.level || 'proficient').toLowerCase();
            return `
              <div class="skill-chip-item">
                <div class="skill-chip-name">
                  <i class="${item.icon}"></i>
                  <span>${escapeHtml(item.name)}</span>
                </div>
                <span class="skill-level-badge ${levelClass}">${escapeHtml(item.level)}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `).join('');
  }

  // ----------------------------------------------------------------------------
  // 5. PROJECTS SECTION (Filtering & Clickable Links)
  // ----------------------------------------------------------------------------
  function renderProjectsSection() {
    const projects = state.content?.projects || [];
    const grid = document.getElementById('projectsGrid');
    const filterBtns = document.querySelectorAll('#projectsFilterBar .filter-btn');

    if (!grid) return;

    function renderFiltered(filter) {
      let filtered = projects;
      if (filter !== 'all') {
        filtered = projects.filter(p => (p.category || '').toLowerCase() === filter.toLowerCase());
      }

      if (filtered.length === 0) {
        grid.innerHTML = '<p style="grid-column:1/-1; text-align:center; color:var(--text-muted); padding:3rem;">No projects found in this category.</p>';
        return;
      }

      grid.innerHTML = filtered.map(p => {
        const catClass = (p.category || 'python').toLowerCase().replace(/\s+/g, '-');
        const hasGithub = p.githubUrl && p.githubUrl.trim() !== '';
        const hasLive = p.liveUrl && p.liveUrl.trim() !== '';
        const hasDash = p.dashboardUrl && p.dashboardUrl.trim() !== '';

        // Extract key points array (handles string or object formats)
        const keyPointsList = (p.keyPoints || []).map(kp => typeof kp === 'object' ? kp.text : kp);

        return `
          <div class="project-card">
            <div class="project-meta-row">
              <span class="project-category-badge ${catClass}">${escapeHtml(p.category)}</span>
              <span class="project-tag-badge">${escapeHtml(p.badge || '')}</span>
            </div>

            <h3 class="project-title">${escapeHtml(p.title)}</h3>
            <p class="project-description">${escapeHtml(p.shortDescription)}</p>

            ${keyPointsList.length > 0 ? `
              <div class="project-questions-box">
                <div class="project-questions-title">
                  <i class="fa-solid fa-circle-question"></i> Key Questions & Analysis Solved
                </div>
                <div class="project-questions-list">
                  ${keyPointsList.map(q => `
                    <div class="project-question-item">
                      <i class="fa-solid fa-chevron-right"></i>
                      <span>${escapeHtml(q)}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <div class="project-tech-tags">
              ${(p.technologies || []).map(t => `<span class="tech-tag">${escapeHtml(t)}</span>`).join('')}
            </div>

            <div class="project-card-actions">
              ${hasGithub ? `
                <a href="${escapeHtml(p.githubUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-secondary" title="View repository source code">
                  <i class="fa-brands fa-github"></i> View on GitHub
                </a>
              ` : ''}

              ${hasLive ? `
                <a href="${escapeHtml(p.liveUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-secondary" title="Open live analysis">
                  <i class="fa-solid fa-arrow-up-right-from-square"></i> Live Demo
                </a>
              ` : ''}

              ${hasDash ? `
                <a href="${escapeHtml(p.dashboardUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-primary" title="Launch interactive dashboard">
                  <i class="fa-solid fa-chart-column"></i> View Dashboard
                </a>
              ` : ''}

              ${(!hasGithub && !hasLive && !hasDash) ? `
                <span style="font-size:0.75rem; color:var(--text-dim); font-weight:500;">
                  <i class="fa-solid fa-lock"></i> Code available upon recruiter request
                </span>
              ` : ''}
            </div>
          </div>
        `;
      }).join('');
    }

    renderFiltered('all');

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.getAttribute('data-filter');
        renderFiltered(filter);
      });
    });
  }

  // ----------------------------------------------------------------------------
  // 6. GITHUB BANNER
  // ----------------------------------------------------------------------------
  function renderGitHubBanner() {
    const gh = state.content?.githubSection || {};
    const profile = state.content?.profile || {};

    setText('githubBannerTag', gh.tag || 'Open Source & Code Repositories');
    setText('githubBannerTitle', gh.title || 'Explore My GitHub Projects');
    setText('githubBannerDesc', gh.description || 'Explore my data analytics projects, SQL analysis, Python notebooks, dashboards, and data-driven solutions.');

    const btn = document.getElementById('githubBannerBtn');
    if (btn) {
      if (profile.github && profile.github.trim() !== '') {
        btn.href = profile.github;
        btn.target = '_blank';
        btn.rel = 'noopener noreferrer';
        btn.onclick = null;
      } else {
        btn.href = '#';
        btn.onclick = (e) => {
          e.preventDefault();
          showToast('GitHub link will be configured by the administrator in the dashboard.', 'info');
        };
      }
    }
  }

  // ----------------------------------------------------------------------------
  // 7. POWER BI SECTION
  // ----------------------------------------------------------------------------
  function renderPowerBiDashboards() {
    const dashboards = state.content?.powerBiDashboards || [];
    const grid = document.getElementById('dashboardsGrid');
    if (!grid) return;

    if (dashboards.length === 0) {
      grid.innerHTML = '<p style="text-align:center; color:var(--text-muted); grid-column:1/-1;">No dashboards published yet.</p>';
      return;
    }

    grid.innerHTML = dashboards.map(dash => {
      const hasUrl = dash.reportUrl && dash.reportUrl.trim() !== '';

      return `
        <div class="dashboard-card">
          <div class="dashboard-preview-window">
            <div class="dashboard-window-top">
              <div class="dashboard-window-dots">
                <span></span><span></span><span></span>
              </div>
              <span class="dashboard-window-badge"><i class="fa-solid fa-chart-simple"></i> Power BI Report</span>
            </div>

            <div class="dashboard-mock-metrics">
              <div class="mock-metric-tile">
                <div class="mock-metric-label">KPI Metric</div>
                <div class="mock-metric-val">99.4%</div>
              </div>
              <div class="mock-metric-tile">
                <div class="mock-metric-label">Volume</div>
                <div class="mock-metric-val">+24.8%</div>
              </div>
              <div class="mock-metric-tile">
                <div class="mock-metric-label">Efficiency</div>
                <div class="mock-metric-val">Optimal</div>
              </div>
            </div>
          </div>

          <div class="dashboard-card-body">
            <h3 class="dashboard-title">${escapeHtml(dash.name)}</h3>
            <p class="dashboard-objective">${escapeHtml(dash.businessObjective)}</p>

            <div class="dashboard-kpis-box">
              <div class="dashboard-kpis-title">
                <i class="fa-solid fa-bullseye"></i> Tracked KPIs & Metrics
              </div>
              <div class="dashboard-kpis-list">
                ${(dash.kpis || []).map(kpi => `<span class="kpi-chip">${escapeHtml(kpi)}</span>`).join('')}
              </div>
            </div>

            <div class="dashboard-card-footer">
              ${hasUrl ? `
                <a href="${escapeHtml(dash.reportUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
                  <i class="fa-solid fa-arrow-up-right-from-square"></i> View Dashboard
                </a>
              ` : `
                <button type="button" class="btn btn-primary btn-sm" onclick="alert('Power BI dashboard link will be published soon!')">
                  <i class="fa-solid fa-chart-column"></i> View Dashboard
                </button>
              `}
              <span style="font-size: 0.78rem; color: var(--text-dim); font-weight:600;">
                <i class="fa-solid fa-layer-group"></i> DAX & Modeling
              </span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // ----------------------------------------------------------------------------
  // 8. RESUME SECTION
  // ----------------------------------------------------------------------------
  function renderResumeSection() {
    const resSec = state.content?.resumeSection || {};
    const pointsList = document.getElementById('resumePointsList');

    if (pointsList && resSec.summaryPoints) {
      pointsList.innerHTML = resSec.summaryPoints.map(pt => `
        <div class="resume-point-item">
          <i class="fa-solid fa-circle-check"></i>
          <span>${escapeHtml(pt)}</span>
        </div>
      `).join('');
    }

    setText('lblDownloadResume', resSec.downloadButtonLabel || 'Download Resume');
    setText('lblViewResume', resSec.viewButtonLabel || 'View Resume');
  }

  // ----------------------------------------------------------------------------
  // 9. PROFESSIONAL PROFILES
  // ----------------------------------------------------------------------------
  function renderProfessionalProfiles() {
    const rawProfiles = state.content?.socialProfiles || [];
    const p = state.content?.profile || {};
    const grid = document.getElementById('profilesGrid');
    if (!grid) return;

    // Filter only enabled profiles that have a valid non-empty URL
    const activeProfiles = rawProfiles.filter(item => {
      if (item.isEnabled === false) return false;
      let url = (item.url || '').trim();
      if (!url && item.platform) {
        const key = item.platform.toLowerCase();
        if (key.includes('linkedin')) url = (p.linkedin || '').trim();
        else if (key.includes('github')) url = (p.github || '').trim();
        else if (key.includes('medium')) url = (p.medium || '').trim();
        else if (key.includes('website') || key.includes('portfolio')) url = (p.website || '').trim();
      }
      return Boolean(url && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')));
    });

    if (activeProfiles.length === 0) {
      grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: var(--text-dim); padding: 2rem;">Professional profile links will appear here once published.</div>';
      return;
    }

    grid.innerHTML = activeProfiles.map(item => {
      let url = (item.url || '').trim();
      if (!url && item.platform) {
        const key = item.platform.toLowerCase();
        if (key.includes('linkedin')) url = (p.linkedin || '').trim();
        else if (key.includes('github')) url = (p.github || '').trim();
        else if (key.includes('medium')) url = (p.medium || '').trim();
        else if (key.includes('website') || key.includes('portfolio')) url = (p.website || '').trim();
      }

      return `
        <div class="profile-platform-card">
          <div class="profile-platform-icon-wrap" style="color: ${item.accent || '#38bdf8'};">
            <i class="${escapeHtml(item.icon || 'fa-solid fa-link')}"></i>
          </div>
          <h3 class="profile-platform-name">${escapeHtml(item.platform)}</h3>
          <p class="profile-platform-desc">${escapeHtml(item.description || '')}</p>
          <div>
            <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm" style="width:100%;">
              <i class="${escapeHtml(item.icon || 'fa-solid fa-arrow-up-right-from-square')}"></i> ${escapeHtml(item.buttonLabel || 'View Profile')}
            </a>
          </div>
        </div>
      `;
    }).join('');
  }

  // ----------------------------------------------------------------------------
  // 10. CONTACT SECTION
  // ----------------------------------------------------------------------------
  function renderContactSection() {
    const p = state.content?.profile || {};
    const emailVal = document.getElementById('contactEmailVal');
    const emailItem = document.getElementById('contactEmailItem');
    const linkedinVal = document.getElementById('contactLinkedinVal');
    const githubVal = document.getElementById('contactGithubVal');
    const form = document.getElementById('contactForm');
    const formAlert = document.getElementById('contactFormAlert');
    const submitBtn = document.getElementById('contactSubmitBtn');

    if (p.email && p.email.trim() !== '') {
      if (emailVal) emailVal.textContent = p.email;
      if (emailItem) emailItem.href = `mailto:${p.email}`;
    } else {
      if (emailVal) emailVal.textContent = 'Contact via Message Form';
      if (emailItem) {
        emailItem.href = '#';
        emailItem.onclick = (e) => {
          e.preventDefault();
          document.getElementById('formName')?.focus();
        };
      }
    }

    if (linkedinVal) linkedinVal.textContent = p.linkedin ? 'Connected Profile' : 'Available on LinkedIn';
    if (githubVal) githubVal.textContent = p.github ? 'Active Repositories' : 'Available on GitHub';

    if (form && !form.dataset.initialized) {
      form.dataset.initialized = 'true';
      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('formName')?.value.trim() || '';
        const email = document.getElementById('formEmail')?.value.trim() || '';
        const subject = document.getElementById('formSubject')?.value.trim() || '';
        const message = document.getElementById('formMessage')?.value.trim() || '';
        const honeypot = document.getElementById('formHoneypot')?.value.trim() || '';

        // Anti-spam honeypot silent trap
        if (honeypot) {
          form.reset();
          if (formAlert) {
            formAlert.style.display = 'flex';
            formAlert.style.background = 'rgba(16, 185, 129, 0.15)';
            formAlert.style.border = '1px solid rgba(16, 185, 129, 0.3)';
            formAlert.style.color = '#34d399';
            formAlert.innerHTML = '<i class="fa-solid fa-circle-check"></i> <span>Thank you! Your message has been received.</span>';
          }
          showToast('Thank you! Your message has been received.', 'success');
          return;
        }

        // Basic client validation
        if (!name || name.length < 2) {
          showToast('Please enter your full name.', 'error');
          document.getElementById('formName')?.focus();
          return;
        }

        if (!email || !email.includes('@')) {
          showToast('Please enter a valid email address.', 'error');
          document.getElementById('formEmail')?.focus();
          return;
        }

        if (!subject || subject.length < 2) {
          showToast('Please enter a subject for your message.', 'error');
          document.getElementById('formSubject')?.focus();
          return;
        }

        if (!message || message.length < 10) {
          showToast('Please write a message with at least 10 characters.', 'error');
          document.getElementById('formMessage')?.focus();
          return;
        }

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending Message...';
        }

        if (formAlert) formAlert.style.display = 'none';

        try {
          const res = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name,
              email,
              subject,
              message,
              company_website_hp: honeypot
            })
          });

          const json = await res.json();

          if (res.ok && json.success) {
            form.reset();
            if (formAlert) {
              formAlert.style.display = 'flex';
              formAlert.style.background = 'rgba(16, 185, 129, 0.15)';
              formAlert.style.border = '1px solid rgba(16, 185, 129, 0.3)';
              formAlert.style.color = '#34d399';
              formAlert.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>${escapeHtml(json.message || 'Thank you! Your message has been received.')}</span>`;
              setTimeout(() => { if (formAlert) formAlert.style.display = 'none'; }, 8000);
            }
            showToast('Message sent successfully! Kishor will get back to you shortly.', 'success');
          } else {
            if (formAlert) {
              formAlert.style.display = 'flex';
              formAlert.style.background = 'rgba(239, 68, 68, 0.15)';
              formAlert.style.border = '1px solid rgba(239, 68, 68, 0.3)';
              formAlert.style.color = '#f87171';
              formAlert.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> <span>${escapeHtml(json.error || 'Failed to send message.')}</span>`;
            }
            showToast(json.error || 'Failed to send message.', 'error');
          }
        } catch (err) {
          if (formAlert) {
            formAlert.style.display = 'flex';
            formAlert.style.background = 'rgba(239, 68, 68, 0.15)';
            formAlert.style.border = '1px solid rgba(239, 68, 68, 0.3)';
            formAlert.style.color = '#f87171';
            formAlert.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> <span>Network error. Please try again or reach out via email.</span>';
          }
          showToast('Network error sending message.', 'error');
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Message';
          }
        }
      });
    }
  }

  // ----------------------------------------------------------------------------
  // FOOTER
  // ----------------------------------------------------------------------------
  function renderFooter() {
    const s = state.content?.siteSettings || {};
    setText('footerBrandName', s.websiteName || 'Kishor Kumar');
    setText('footerCopyrightText', s.footerCopyright || '© 2026 Kishor Kumar. All rights reserved.');
    setText('footerTaglineText', s.footerTagline || 'Crafted with clean HTML, CSS & JavaScript for high performance.');
  }

  // ----------------------------------------------------------------------------
  // BACK TO TOP
  // ----------------------------------------------------------------------------
  function initBackToTop() {
    const btn = document.getElementById('backToTopBtn');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ----------------------------------------------------------------------------
  // UTILITIES
  // ----------------------------------------------------------------------------
  function setText(id, text) {
    const el = document.getElementById(id);
    if (el && text !== undefined) el.textContent = text;
  }

  function escapeHtml(str) {
    if (typeof str !== 'string') return str || '';
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }

  function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fa-solid fa-circle-info"></i> <span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3800);
  }
});

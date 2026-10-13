/**
 * ==============================================================================
 * KISHOR KUMAR - ADMIN DASHBOARD CLIENT ENGINE (js/admin.js)
 * Full CMS Controller, Authentication, Projects, Key Points & Media Management
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // Global State
  const adminState = {
    isAuthenticated: false,
    adminEmail: '',
    data: null,
    activeTab: 'overview',
    hasUnsavedChanges: false,
    pendingProjectKeyPoints: [],
    pendingExpAchievements: [],
    gdriveConfig: null
  };

  // ----------------------------------------------------------------------------
  // INITIALIZATION
  // ----------------------------------------------------------------------------
  checkAuth();
  initEventListeners();

  // ----------------------------------------------------------------------------
  // AUTHENTICATION CHECK & LOGIN
  // ----------------------------------------------------------------------------
  async function checkAuth() {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (res.ok && data.authenticated) {
        adminState.isAuthenticated = true;
        adminState.adminEmail = data.admin.email;
        showDashboard();
        loadAdminData();
      } else {
        showLogin();
      }
    } catch (err) {
      console.warn('Auth check failed:', err);
      showLogin();
    }
  }

  function showLogin() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('adminDashboardShell').style.display = 'none';
  }

  function showDashboard() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminDashboardShell').style.display = 'flex';
    document.getElementById('sidebarAdminEmail').textContent = adminState.adminEmail;
  }

  // Login Form Submission
  const loginForm = document.getElementById('adminLoginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;
      const errorAlert = document.getElementById('loginErrorAlert');
      const errorText = document.getElementById('loginErrorText');
      const submitBtn = document.getElementById('loginSubmitBtn');

      errorAlert.style.display = 'none';
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Authenticating...';

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (res.ok && data.success) {
          adminState.isAuthenticated = true;
          adminState.adminEmail = data.admin.email;
          showDashboard();
          loadAdminData();
          showToast('Welcome back, ' + data.admin.email, 'success');
        } else {
          errorAlert.style.display = 'flex';
          errorText.textContent = data.error || 'Authentication failed.';
        }
      } catch (err) {
        errorAlert.style.display = 'flex';
        errorText.textContent = 'Server connection error. Please try again.';
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-lock-open"></i> Secure Sign In';
      }
    });
  }

  // Logout
  const logoutBtn = document.getElementById('sidebarLogoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
      } catch (_) {}
      adminState.isAuthenticated = false;
      showToast('Logged out successfully.', 'info');
      showLogin();
    });
  }

  // ----------------------------------------------------------------------------
  // LOAD COMPLETE ADMIN DATA
  // ----------------------------------------------------------------------------
  async function loadAdminData() {
    try {
      const res = await fetch('/api/admin/content');
      const json = await res.json();
      if (res.ok && json.success) {
        adminState.data = json.data;
        renderAllSections();
        updatePublishBadge(adminState.data.hasUnpublishedChanges);
      } else {
        showToast('Failed to load portfolio data.', 'error');
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
      showToast('Network error loading admin data.', 'error');
    }
  }

  function updatePublishBadge(hasUnpublished) {
    const badge = document.getElementById('publishStatusBadge');
    if (!badge) return;
    if (hasUnpublished) {
      badge.className = 'status-badge draft';
      badge.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Draft Changes Pending';
    } else {
      badge.className = 'status-badge published';
      badge.innerHTML = '<i class="fa-solid fa-circle-check"></i> Published Live';
    }
  }

  // ----------------------------------------------------------------------------
  // RENDER SECTIONS
  // ----------------------------------------------------------------------------
  function renderAllSections() {
    if (!adminState.data) return;
    const draft = adminState.data.draft || {};
    const content = draft.content || {};
    const projects = draft.projects || [];

    renderOverviewTab(projects, content);
    renderProfileTab(content);
    renderExperienceTab(content.experience || []);
    renderSkillsTab(content.skills || []);
    renderProjectsTab(projects);
    renderResumeTab();
    renderMediaTab();
    renderSocialTab(content);
    renderSectionsTab(content);
    renderSeoTab(content.seo || {});
    loadEnquiries();
  }

  // 1. Overview Tab
  function renderOverviewTab(projects, content) {
    const total = projects.length;
    const published = projects.filter(p => p.isPublished !== false).length;
    const drafts = total - published;

    document.getElementById('statTotalProjects').textContent = total;
    document.getElementById('statPublishedProjects').textContent = published;
    document.getElementById('statDraftProjects').textContent = drafts;

    const enqStats = adminState.data?.enquiryStats || { total: 0, unread: 0 };
    const statUnread = document.getElementById('statUnreadEnquiries');
    const statTotal = document.getElementById('statTotalEnquiries');
    if (statUnread) statUnread.textContent = enqStats.unread || 0;
    if (statTotal) statTotal.textContent = enqStats.total || 0;

    const badge = document.getElementById('enquiriesBadge');
    if (badge) {
      if (enqStats.unread > 0) {
        badge.style.display = 'inline-block';
        badge.textContent = enqStats.unread;
      } else {
        badge.style.display = 'none';
      }
    }

    const activeResume = (adminState.data.resumes || []).find(r => r.id === adminState.data.activeResumeId);
    if (activeResume) {
      document.getElementById('statActiveResumeName').textContent = activeResume.originalName || activeResume.filename;
    }

    const lastPub = adminState.data.lastPublished;
    if (lastPub) {
      document.getElementById('overviewLastPublished').textContent = new Date(lastPub).toLocaleString();
    }
  }

  // 2. Profile Tab
  function renderProfileTab(content) {
    const p = content.profile || {};
    const h = content.hero || {};
    const a = content.about || {};

    setVal('profName', p.name || h.name || '');
    setVal('profTitle', p.title || h.professionalTitle || '');
    setVal('profShortBio', p.shortDescription || h.shortDescription || '');
    setVal('profExpYears', p.experienceYears || '');
    setVal('profLocation', p.location || '');
    setVal('profAvailability', p.availability || '');
    let photoUrl = (p.photo || h.photo || '').trim();
    if (photoUrl && !photoUrl.startsWith('http://') && !photoUrl.startsWith('https://') && !photoUrl.startsWith('/')) {
      photoUrl = '/' + photoUrl;
    }
    setVal('profPhotoUrl', photoUrl);

    // Update circular profile preview image
    const previewImg = document.getElementById('adminPhotoPreviewImg');
    const fallback = document.getElementById('adminPhotoFallback');
    if (photoUrl && photoUrl !== '') {
      if (previewImg) {
        previewImg.onload = () => {
          previewImg.style.display = 'block';
          if (fallback) fallback.style.display = 'none';
        };
        previewImg.onerror = () => {
          previewImg.style.display = 'none';
          if (fallback) fallback.style.display = 'flex';
        };
        previewImg.src = photoUrl;
        if (previewImg.complete && previewImg.naturalWidth > 0) {
          previewImg.style.display = 'block';
          if (fallback) fallback.style.display = 'none';
        }
      }
    } else {
      if (previewImg) {
        previewImg.src = '';
        previewImg.style.display = 'none';
      }
      if (fallback) fallback.style.display = 'flex';
    }

    setVal('aboutHeading', a.heading || '');
    setVal('aboutLead', a.lead || '');
    setVal('aboutP1', a.paragraphs ? a.paragraphs[0] || '' : '');
    setVal('aboutP2', a.paragraphs ? a.paragraphs[1] || '' : '');
    setVal('aboutP3', a.paragraphs ? a.paragraphs[2] || '' : '');
  }

  // 3. Experience Tab
  function renderExperienceTab(experiences) {
    const container = document.getElementById('experienceListContainer');
    if (!container) return;

    if (!experiences || experiences.length === 0) {
      container.innerHTML = '<p style="color:var(--admin-text-muted); padding:1rem 0;">No experience entries added yet. Click "+ Add Experience" above.</p>';
      return;
    }

    container.innerHTML = experiences.map((exp) => `
      <div style="background: rgba(9,17,34,0.6); border: 1px solid var(--admin-border); border-radius: 12px; padding: 1.25rem; margin-bottom: 1rem;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 0.5rem; flex-wrap:wrap; gap:0.5rem;">
          <div>
            <h4 style="font-size: 1.05rem; color:#fff; font-weight:700;">${escapeHtml(exp.jobTitle)}</h4>
            <span style="font-size: 0.88rem; color:var(--admin-accent-cyan); font-weight:600;">${escapeHtml(exp.company)}</span>
            <span style="font-size: 0.82rem; color:var(--admin-text-dim);"> • ${escapeHtml(exp.location || 'Remote')} • ${escapeHtml(exp.startDate)} to ${exp.isCurrent ? 'Present' : escapeHtml(exp.endDate || '')}</span>
          </div>
          <div style="display:flex; gap:0.4rem;">
            <button type="button" class="admin-btn admin-btn-secondary admin-btn-sm" onclick="window.adminApp.editExperience('${exp.id}')" title="Edit Experience">
              <i class="fa-solid fa-pen-to-square"></i> Edit
            </button>
            <button type="button" class="admin-btn admin-btn-danger admin-btn-sm" onclick="window.adminApp.deleteExperience('${exp.id}')" title="Delete Experience">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
        <p style="font-size:0.88rem; color:var(--admin-text-muted); margin-bottom:0.75rem;">${escapeHtml(exp.description || '')}</p>
        ${(exp.achievements && exp.achievements.length > 0) ? `
          <ul style="padding-left:1.25rem; font-size:0.82rem; color:var(--admin-text-muted); line-height:1.5;">
            ${exp.achievements.map(ach => `<li>${escapeHtml(ach)}</li>`).join('')}
          </ul>
        ` : ''}
      </div>
    `).join('');
  }

  // 4. Skills Tab
  function renderSkillsTab(skillCategories) {
    const container = document.getElementById('skillsCategoriesContainer');
    if (!container) return;

    if (!skillCategories || skillCategories.length === 0) {
      container.innerHTML = '<p style="color:var(--admin-text-muted); padding:1rem 0;">No skill categories found. Click "+ Add Category" above.</p>';
      return;
    }

    container.innerHTML = skillCategories.map(cat => `
      <div style="background: rgba(9,17,34,0.6); border: 1px solid var(--admin-border); border-radius: 12px; padding: 1.25rem; margin-bottom: 1.25rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.85rem; flex-wrap:wrap; gap:0.5rem;">
          <h4 style="font-size: 1rem; color:#fff; font-weight:700; display:flex; align-items:center; gap:0.5rem; margin:0;">
            <i class="fa-solid ${cat.icon || 'fa-brain'}" style="color:var(--admin-accent-cyan);"></i> ${escapeHtml(cat.category)}
          </h4>
          <div style="display:flex; gap:0.4rem;">
            <button type="button" class="admin-btn admin-btn-primary admin-btn-sm" onclick="window.adminApp.openSkillModal('${cat.id}')">
              <i class="fa-solid fa-plus"></i> Add Skill
            </button>
            <button type="button" class="admin-btn admin-btn-secondary admin-btn-sm" onclick="window.adminApp.editSkillCategory('${cat.id}')" title="Edit Category">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button type="button" class="admin-btn admin-btn-danger admin-btn-sm" onclick="window.adminApp.deleteSkillCategory('${cat.id}')" title="Delete Category">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
        <div style="display:flex; flex-wrap:wrap; gap:0.5rem;">
          ${(cat.items || []).map(item => `
            <span style="background: rgba(255,255,255,0.06); border: 1px solid var(--admin-border); padding: 0.35rem 0.75rem; border-radius: 9999px; font-size: 0.82rem; color:#fff; display:inline-flex; align-items:center; gap:0.45rem;">
              <i class="${item.icon}"></i> ${escapeHtml(item.name)} 
              <span style="font-size:0.72rem; color:var(--admin-accent-cyan);">(${escapeHtml(item.level)})</span>
              <button type="button" style="background:none; border:none; color:var(--admin-text-dim); cursor:pointer; padding:0 2px;" onclick="window.adminApp.editSkill('${cat.id}', '${item.id}')" title="Edit">
                <i class="fa-solid fa-pen" style="font-size:0.68rem;"></i>
              </button>
              <button type="button" style="background:none; border:none; color:#f87171; cursor:pointer; padding:0 2px;" onclick="window.adminApp.deleteSkill('${cat.id}', '${item.id}')" title="Delete">
                <i class="fa-solid fa-xmark" style="font-size:0.75rem;"></i>
              </button>
            </span>
          `).join('')}
          ${(!cat.items || cat.items.length === 0) ? '<span style="font-size:0.8rem; color:var(--admin-text-dim);">No skills in this category yet. Click "+ Add Skill".</span>' : ''}
        </div>
      </div>
    `).join('');
  }

  // 5. Projects Tab
  function renderProjectsTab(projects) {
    const tbody = document.getElementById('projectsTableBody');
    if (!tbody) return;

    if (!projects || projects.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:2rem;">No projects found. Click "+ Add Project".</td></tr>';
      return;
    }

    tbody.innerHTML = projects.map(p => {
      const isPub = p.isPublished !== false;
      const techList = (p.technologies || []).slice(0, 3).join(', ');

      return `
        <tr>
          <td><span style="font-weight:700; color:var(--admin-accent-cyan);">${p.displayOrder || 1}</span></td>
          <td>
            <strong style="color:#fff;">${escapeHtml(p.title)}</strong>
            <div style="font-size:0.75rem; color:var(--admin-text-dim);">${escapeHtml(p.badge || '')}</div>
          </td>
          <td><span class="table-badge ${p.category.toLowerCase()}">${escapeHtml(p.category)}</span></td>
          <td style="font-size:0.8rem;">${escapeHtml(techList)}</td>
          <td>
            <span class="table-badge ${isPub ? 'published' : 'draft'}">
              ${isPub ? 'Published' : 'Draft'}
            </span>
          </td>
          <td>
            ${p.githubUrl ? `<a href="${escapeHtml(p.githubUrl)}" target="_blank" title="GitHub"><i class="fa-brands fa-github" style="color:#4ade80; margin-right:5px;"></i></a>` : ''}
            ${p.liveUrl ? `<a href="${escapeHtml(p.liveUrl)}" target="_blank" title="Live"><i class="fa-solid fa-arrow-up-right-from-square" style="color:#38bdf8; margin-right:5px;"></i></a>` : ''}
            ${p.dashboardUrl ? `<a href="${escapeHtml(p.dashboardUrl)}" target="_blank" title="Dashboard"><i class="fa-solid fa-chart-column" style="color:#fbbf24;"></i></a>` : ''}
          </td>
          <td style="text-align: right;">
            <button type="button" class="admin-btn admin-btn-secondary admin-btn-sm" onclick="window.adminApp.editProject('${p.id}')" title="Edit">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button type="button" class="admin-btn admin-btn-secondary admin-btn-sm" onclick="window.adminApp.duplicateProject('${p.id}')" title="Duplicate">
              <i class="fa-solid fa-copy"></i>
            </button>
            <button type="button" class="admin-btn admin-btn-outline admin-btn-sm" onclick="window.adminApp.toggleProjectPublish('${p.id}')" title="Toggle Publish">
              <i class="fa-solid ${isPub ? 'fa-eye-slash' : 'fa-eye'}"></i>
            </button>
            <button type="button" class="admin-btn admin-btn-danger admin-btn-sm" onclick="window.adminApp.deleteProject('${p.id}')" title="Delete">
              <i class="fa-solid fa-trash"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  // 6. Resume Tab
  function renderResumeTab() {
    const resumes = adminState.data.resumes || [];
    const activeId = adminState.data.activeResumeId;
    const tbody = document.getElementById('resumeTableBody');
    const activeBannerTitle = document.getElementById('activeResumeTitle');
    const activeBannerMeta = document.getElementById('activeResumeMeta');

    const active = resumes.find(r => r.id === activeId) || resumes[0];
    if (active && activeBannerTitle && activeBannerMeta) {
      activeBannerTitle.textContent = active.originalName || active.filename;
      const dateStr = active.uploadDate ? new Date(active.uploadDate).toLocaleDateString() : 'Active';
      const sizeStr = active.fileSize ? formatBytes(active.fileSize) : '';
      activeBannerMeta.textContent = `Uploaded: ${dateStr} • Size: ${sizeStr} • Source: ${active.source || 'Local'}`;
    }

    if (!tbody) return;
    if (resumes.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:1.5rem;">No resumes uploaded yet.</td></tr>';
      return;
    }

    tbody.innerHTML = resumes.map(r => {
      const isActive = (r.id === activeId);
      const dateStr = r.uploadDate ? new Date(r.uploadDate).toLocaleDateString() : '-';
      const sizeStr = r.fileSize ? formatBytes(r.fileSize) : '-';

      return `
        <tr>
          <td>
            <i class="fa-solid fa-file-pdf" style="color:#f87171; margin-right:6px;"></i>
            <strong style="color:#fff;">${escapeHtml(r.originalName || r.filename)}</strong>
          </td>
          <td>${dateStr}</td>
          <td>${sizeStr}</td>
          <td>
            ${isActive ? '<span class="table-badge published">Active Document</span>' : '<span style="color:var(--admin-text-dim); font-size:0.8rem;">Archived</span>'}
          </td>
          <td style="text-align:right;">
            ${!isActive ? `<button type="button" class="admin-btn admin-btn-primary admin-btn-sm" onclick="window.adminApp.setActiveResume('${r.id}')">Make Active</button>` : ''}
            <a href="/api/resume/download" class="admin-btn admin-btn-secondary admin-btn-sm" target="_blank" title="Download">
              <i class="fa-solid fa-download"></i>
            </a>
            ${!isActive ? `<button type="button" class="admin-btn admin-btn-danger admin-btn-sm" onclick="window.adminApp.deleteResume('${r.id}')" title="Delete"><i class="fa-solid fa-trash"></i></button>` : ''}
          </td>
        </tr>
      `;
    }).join('');
  }

  // 7. Media Tab
  function renderMediaTab() {
    const media = adminState.data.media || [];
    const grid = document.getElementById('mediaGrid');
    if (!grid) return;

    if (media.length === 0) {
      grid.innerHTML = '<p style="color:var(--admin-text-muted); grid-column:1/-1;">No images uploaded yet. Click "Upload Image" to add profile photos or screenshots.</p>';
      return;
    }

    grid.innerHTML = media.map(m => `
      <div class="media-card">
        <div class="media-thumb-wrap">
          <img src="${escapeHtml(m.url)}" alt="${escapeHtml(m.originalName)}" loading="lazy">
        </div>
        <div class="media-info">
          <span class="media-filename">${escapeHtml(m.originalName)}</span>
          <div class="media-actions">
            <button type="button" class="admin-btn admin-btn-secondary admin-btn-sm" onclick="window.adminApp.copyText('${escapeHtml(m.url)}')" title="Copy URL">
              <i class="fa-solid fa-copy"></i>
            </button>
            <button type="button" class="admin-btn admin-btn-danger admin-btn-sm" onclick="window.adminApp.deleteMedia('${m.id}')" title="Delete">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  // 8. Social Tab (Dynamic Profiles List)
  function renderSocialTab(content) {
    const listContainer = document.getElementById('socialProfilesListContainer');
    const profiles = [...(content.socialProfiles || [])].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

    // Fill direct contact details
    const p = content.profile || {};
    setVal('linkEmail', p.email || '');
    setVal('linkLocation', p.location || '');
    setVal('linkAvailability', p.availability || '');

    if (!listContainer) return;

    if (profiles.length === 0) {
      listContainer.innerHTML = '<p style="color:var(--admin-text-muted); padding:1rem 0;">No social profile links configured yet. Click "+ Add Profile Link" above to add your first profile.</p>';
      return;
    }

    listContainer.innerHTML = profiles.map((item, idx) => {
      const isEnabled = item.isEnabled !== false;
      const hasUrl = item.url && item.url.trim() !== '';

      return `
        <div style="background: rgba(9,17,34,0.6); border: 1px solid var(--admin-border); border-radius: 12px; padding: 1.15rem 1.25rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; transition: border-color 0.2s ease;">
          <div style="display: flex; align-items: center; gap: 1rem; min-width: 250px; flex: 1;">
            <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(6, 182, 212, 0.1); border: 1px solid rgba(6, 182, 212, 0.25); display: flex; align-items: center; justify-content: center; font-size: 1.35rem; color: ${escapeHtml(item.accent || '#06b6d4')}; flex-shrink: 0;">
              <i class="${escapeHtml(item.icon || 'fa-solid fa-link')}"></i>
            </div>
            <div style="min-width: 0;">
              <div style="display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap;">
                <h4 style="font-size: 1.05rem; font-weight: 700; color: #fff; margin: 0;">${escapeHtml(item.platform)}</h4>
                <span style="font-size: 0.72rem; padding: 0.15rem 0.55rem; border-radius: 999px; font-weight: 700; ${isEnabled ? 'background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3);' : 'background: rgba(100, 116, 139, 0.15); color: #94a3b8; border: 1px solid rgba(100, 116, 139, 0.3);'}">
                  ${isEnabled ? (hasUrl ? 'Publicly Visible' : 'Visible (No URL)') : 'Hidden / Disabled'}
                </span>
                <span style="font-size: 0.75rem; color: var(--admin-text-dim);">#${item.displayOrder || (idx + 1)}</span>
              </div>
              <div style="margin-top: 0.25rem; font-size: 0.85rem; color: var(--admin-accent-cyan); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 450px;">
                ${hasUrl ? `<a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: none;"><i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 0.75rem;"></i> ${escapeHtml(item.url)}</a>` : '<span style="color: #f87171;"><i class="fa-solid fa-triangle-exclamation"></i> No URL provided (card hidden publicly)</span>'}
              </div>
              ${item.description ? `<p style="font-size: 0.8rem; color: var(--admin-text-muted); margin: 0.35rem 0 0; line-height: 1.4;">${escapeHtml(item.description)}</p>` : ''}
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
            ${hasUrl ? `<button type="button" class="admin-btn admin-btn-secondary admin-btn-sm" onclick="window.open('${escapeHtml(item.url)}', '_blank')" title="Test Link"><i class="fa-solid fa-arrow-up-right-from-square"></i> Test</button>` : ''}
            <button type="button" class="admin-btn admin-btn-secondary admin-btn-sm" onclick="window.adminApp.toggleSocialProfile('${item.id}')" title="${isEnabled ? 'Disable / Hide from visitors' : 'Enable / Show to visitors'}">
              <i class="fa-solid ${isEnabled ? 'fa-eye-slash' : 'fa-eye'}"></i> ${isEnabled ? 'Hide' : 'Show'}
            </button>
            ${idx > 0 ? `<button type="button" class="admin-btn admin-btn-secondary admin-btn-sm" onclick="window.adminApp.moveSocialProfile(${idx}, -1)" title="Move Up"><i class="fa-solid fa-arrow-up"></i></button>` : ''}
            ${idx < profiles.length - 1 ? `<button type="button" class="admin-btn admin-btn-secondary admin-btn-sm" onclick="window.adminApp.moveSocialProfile(${idx}, 1)" title="Move Down"><i class="fa-solid fa-arrow-down"></i></button>` : ''}
            <button type="button" class="admin-btn admin-btn-secondary admin-btn-sm" onclick="window.adminApp.openSocialModal('${item.id}')" title="Edit Profile Link">
              <i class="fa-solid fa-pen"></i> Edit
            </button>
            <button type="button" class="admin-btn admin-btn-danger admin-btn-sm" onclick="window.adminApp.deleteSocialProfile('${item.id}')" title="Delete Profile Link">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  // 9. Sections Tab
  function renderSectionsTab(content) {
    const s = content.siteSettings || {};
    const n = content.navLabels || {};

    setVal('txtSiteName', s.websiteName || '');
    setVal('txtLogoBadge', s.logoBadge || '');
    setVal('txtNavCta', n.ctaButton || '');
    setVal('txtFooterCopyright', s.footerCopyright || '');
    setVal('txtFooterTagline', s.footerTagline || '');

    setVal('navLblHome', n.home || '');
    setVal('navLblAbout', n.about || '');
    setVal('navLblExperience', n.experience || '');
    setVal('navLblSkills', n.skills || '');
    setVal('navLblProjects', n.projects || '');
    setVal('navLblDashboards', n.dashboards || '');
    setVal('navLblResume', n.resume || '');
    setVal('navLblContact', n.contact || '');
  }

  // 10. SEO Tab
  function renderSeoTab(seo) {
    setVal('seoMetaTitle', seo.metaTitle || '');
    setVal('seoMetaDesc', seo.metaDescription || '');
    setVal('seoKeywords', seo.keywords || '');
    setVal('seoOgImage', seo.ogImage || '');
  }

  // ----------------------------------------------------------------------------
  // TAB NAVIGATION & LISTENERS
  // ----------------------------------------------------------------------------
  function initEventListeners() {
    // Tab switching
    document.querySelectorAll('.sidebar-link[data-tab]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = link.getAttribute('data-tab');
        switchTab(tab);
      });
    });

    // Mobile sidebar toggle
    const mobToggle = document.getElementById('adminMobileToggle');
    const sidebar = document.getElementById('adminSidebar');
    if (mobToggle && sidebar) {
      mobToggle.addEventListener('click', () => sidebar.classList.toggle('open'));
    }

    // Quick action buttons in Overview
    document.getElementById('qaNewProjectBtn')?.addEventListener('click', () => openProjectModal());
    document.getElementById('qaUploadResumeBtn')?.addEventListener('click', () => switchTab('resume'));
    document.getElementById('qaEditProfileBtn')?.addEventListener('click', () => switchTab('profile'));
    document.getElementById('qaManageMediaBtn')?.addEventListener('click', () => switchTab('media'));

    // Top Header Publish All Button
    document.getElementById('publishAllBtn')?.addEventListener('click', publishAllChanges);

    // Profile Form Save
    document.getElementById('profileForm')?.addEventListener('submit', handleProfileSubmit);

    // Contact Details Form Save
    document.getElementById('contactDetailsForm')?.addEventListener('submit', handleContactDetailsSubmit);

    // Sections Form Save
    document.getElementById('sectionsForm')?.addEventListener('submit', handleSectionsSubmit);

    // SEO Form Save
    document.getElementById('seoForm')?.addEventListener('submit', handleSeoSubmit);

    // Profile Photo controls
    initProfilePhotoControls();

    // Work Experience Modal & CRUD bindings
    initExperienceModal();

    // Skills Modals & CRUD bindings
    initSkillsModals();

    // Social Profiles Dynamic Modal & CRUD bindings
    initSocialControls();

    // Contact Enquiries Inbox bindings
    initEnquiriesControls();

    // Skills draft save button
    document.getElementById('saveSkillsBtn')?.addEventListener('click', async () => {
      await saveDraftSection('skills', adminState.data?.draft?.content?.skills || []);
      showToast('Skills configuration saved to draft.', 'success');
    });

    // Test link buttons
    document.querySelectorAll('.test-link-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        const url = document.getElementById(targetId)?.value.trim();
        if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
          window.open(url, '_blank', 'noopener,noreferrer');
        } else {
          showToast('Please enter a valid URL starting with http:// or https://', 'error');
        }
      });
    });

    // Project Modal bindings
    initProjectModal();

    // Resume Dropzone & Upload bindings
    initResumeDropzone();

    // Media Upload bindings
    initMediaUpload();

    // Google Drive Picker modal bindings
    initGoogleDriveModal();
  }

  function switchTab(tabId) {
    adminState.activeTab = tabId;

    document.querySelectorAll('.sidebar-link[data-tab]').forEach(l => {
      l.classList.toggle('active', l.getAttribute('data-tab') === tabId);
    });

    document.querySelectorAll('.admin-tab-pane').forEach(p => {
      p.classList.toggle('active', p.id === `pane-${tabId}`);
    });

    // Update Header title
    const titles = {
      overview: 'Dashboard Overview',
      profile: 'Profile & About Me',
      experience: 'Work Experience',
      skills: 'Technical & Analytical Skills',
      projects: 'Projects Management',
      enquiries: 'Contact Enquiries Inbox',
      resume: 'Resume Manager',
      media: 'Media Library',
      social: 'Social & Professional Links',
      sections: 'Website Sections & Branding',
      seo: 'SEO Settings'
    };
    document.getElementById('adminPageTitle').textContent = titles[tabId] || 'Dashboard';

    if (tabId === 'enquiries') {
      loadEnquiries();
    }

    // Close mobile sidebar if open
    document.getElementById('adminSidebar')?.classList.remove('open');
  }

  // ----------------------------------------------------------------------------
  // SAVE FORM HANDLERS
  // ----------------------------------------------------------------------------
  async function handleProfileSubmit(e) {
    e.preventDefault();
    if (!adminState.data) return;

    const draft = adminState.data.draft.content;

    // Profile updates
    draft.profile.name = getVal('profName');
    draft.profile.title = getVal('profTitle');
    draft.profile.shortDescription = getVal('profShortBio');
    draft.profile.experienceYears = getVal('profExpYears');
    draft.profile.location = getVal('profLocation');
    let photoVal = getVal('profPhotoUrl').trim();
    if (photoVal && !photoVal.startsWith('http://') && !photoVal.startsWith('https://') && !photoVal.startsWith('/')) {
      photoVal = '/' + photoVal;
    }
    draft.profile.photo = photoVal;

    // Hero sync
    draft.hero.name = getVal('profName');
    draft.hero.professionalTitle = getVal('profTitle');
    draft.hero.shortDescription = getVal('profShortBio');
    draft.hero.photo = photoVal;

    // About updates
    draft.about.heading = getVal('aboutHeading');
    draft.about.lead = getVal('aboutLead');
    draft.about.paragraphs = [
      getVal('aboutP1'),
      getVal('aboutP2'),
      getVal('aboutP3')
    ].filter(p => p.trim() !== '');

    await saveDraftSection('profile', draft.profile);
    await saveDraftSection('about', draft.about);
    await saveDraftSection('hero', draft.hero);
    showToast('Profile & About saved to draft.', 'success');
  }

  async function handleContactDetailsSubmit(e) {
    e.preventDefault();
    if (!adminState.data) return;
    const draft = adminState.data.draft.content;
    if (!draft.profile) draft.profile = {};
    if (!draft.hero) draft.hero = {};

    draft.profile.email = getVal('linkEmail');
    draft.profile.location = getVal('linkLocation');
    draft.profile.availability = getVal('linkAvailability');
    draft.hero.statusBadge = getVal('linkAvailability');

    await saveDraftSection('profile', draft.profile);
    await saveDraftSection('hero', draft.hero);
    showToast('Direct contact & availability details saved to draft.', 'success');
  }

  async function handleSectionsSubmit(e) {
    e.preventDefault();
    const draft = adminState.data.draft.content;
    draft.siteSettings.websiteName = getVal('txtSiteName');
    draft.siteSettings.logoBadge = getVal('txtLogoBadge');
    draft.siteSettings.footerCopyright = getVal('txtFooterCopyright');
    draft.siteSettings.footerTagline = getVal('txtFooterTagline');

    draft.navLabels.home = getVal('navLblHome');
    draft.navLabels.about = getVal('navLblAbout');
    draft.navLabels.experience = getVal('navLblExperience');
    draft.navLabels.skills = getVal('navLblSkills');
    draft.navLabels.projects = getVal('navLblProjects');
    draft.navLabels.dashboards = getVal('navLblDashboards');
    draft.navLabels.resume = getVal('navLblResume');
    draft.navLabels.contact = getVal('navLblContact');
    draft.navLabels.ctaButton = getVal('txtNavCta');

    await saveDraftSection('siteSettings', draft.siteSettings);
    await saveDraftSection('navLabels', draft.navLabels);
    showToast('Website labels saved to draft.', 'success');
  }

  async function handleSeoSubmit(e) {
    e.preventDefault();
    const seo = {
      metaTitle: getVal('seoMetaTitle'),
      metaDescription: getVal('seoMetaDesc'),
      keywords: getVal('seoKeywords'),
      ogImage: getVal('seoOgImage')
    };
    await saveDraftSection('seo', seo);
    showToast('SEO settings saved to draft.', 'success');
  }

  async function saveDraftSection(sectionName, sectionData) {
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: sectionName, data: sectionData })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        adminState.data.hasUnpublishedChanges = true;
        updatePublishBadge(true);
      }
    } catch (err) {
      console.error('Error saving draft section:', err);
    }
  }

  // Publish All Drafts to Live Public Site
  async function publishAllChanges() {
    if (!confirm('Are you ready to publish all draft changes live to the public portfolio?')) return;

    try {
      const btn = document.getElementById('publishAllBtn');
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Publishing...';

      const res = await fetch('/api/admin/publish', { method: 'POST' });
      const data = await res.json();

      if (res.ok && data.success) {
        adminState.data.hasUnpublishedChanges = false;
        updatePublishBadge(false);
        showToast('All changes published live successfully!', 'success');
      } else {
        showToast(data.error || 'Failed to publish changes.', 'error');
      }
    } catch (err) {
      showToast('Network error while publishing.', 'error');
    } finally {
      const btn = document.getElementById('publishAllBtn');
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> Publish Changes';
    }
  }

  // ----------------------------------------------------------------------------
  // PROJECT MODAL & KEY POINTS REPEATABLE EDITOR
  // ----------------------------------------------------------------------------
  function initProjectModal() {
    const modal = document.getElementById('projectModal');
    const openBtn = document.getElementById('openNewProjectModalBtn');
    const closeBtn = document.getElementById('closeProjectModalBtn');
    const cancelBtn = document.getElementById('cancelProjectModalBtn');
    const saveBtn = document.getElementById('saveProjectModalBtn');
    const addKpBtn = document.getElementById('addKeyPointBtn');
    const kpInput = document.getElementById('newKeyPointInput');

    if (openBtn) openBtn.addEventListener('click', () => openProjectModal());
    if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    if (cancelBtn) cancelBtn.addEventListener('click', () => modal.classList.remove('active'));

    // Key Point Add
    if (addKpBtn && kpInput) {
      const addKp = () => {
        const text = kpInput.value.trim();
        if (!text) return;
        adminState.pendingProjectKeyPoints.push({
          id: 'kp-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
          text: text,
          order: adminState.pendingProjectKeyPoints.length + 1
        });
        kpInput.value = '';
        renderModalKeyPoints();
      };

      addKpBtn.addEventListener('click', addKp);
      kpInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          addKp();
        }
      });
    }

    // Save Project Modal
    if (saveBtn) {
      saveBtn.addEventListener('click', async () => {
        const id = document.getElementById('pmId').value;
        const title = document.getElementById('pmTitle').value.trim();
        if (!title) {
          showToast('Project title is required.', 'error');
          return;
        }

        const projectPayload = {
          id: id || undefined,
          title: title,
          category: document.getElementById('pmCategory').value,
          badge: document.getElementById('pmBadge').value.trim(),
          technologies: document.getElementById('pmTech').value.split(',').map(s => s.trim()).filter(Boolean),
          shortDescription: document.getElementById('pmShortDesc').value.trim(),
          detailedDescription: document.getElementById('pmDetailedDesc').value.trim(),
          keyPoints: adminState.pendingProjectKeyPoints,
          keyFindings: document.getElementById('pmKeyFindings').value.trim(),
          businessImpact: document.getElementById('pmBusinessImpact').value.trim(),
          githubUrl: document.getElementById('pmGithubUrl').value.trim(),
          liveUrl: document.getElementById('pmLiveUrl').value.trim(),
          dashboardUrl: document.getElementById('pmDashboardUrl').value.trim(),
          displayOrder: Number(document.getElementById('pmDisplayOrder').value) || 1,
          featured: document.getElementById('pmFeatured').checked,
          isPublished: document.getElementById('pmIsPublished').checked
        };

        const method = id ? 'PUT' : 'POST';
        const url = id ? `/api/admin/projects/${id}` : '/api/admin/projects';

        try {
          const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(projectPayload)
          });
          const json = await res.json();

          if (res.ok && json.success) {
            modal.classList.remove('active');
            showToast(json.message || 'Project saved.', 'success');
            loadAdminData();
          } else {
            showToast(json.error || 'Failed to save project.', 'error');
          }
        } catch (err) {
          showToast('Network error saving project.', 'error');
        }
      });
    }
  }

  function openProjectModal(existingProject = null) {
    const modal = document.getElementById('projectModal');
    const titleElem = document.getElementById('projectModalTitle');

    if (existingProject) {
      titleElem.textContent = 'Edit Project: ' + existingProject.title;
      document.getElementById('pmId').value = existingProject.id;
      document.getElementById('pmTitle').value = existingProject.title;
      document.getElementById('pmCategory').value = existingProject.category || 'Python';
      document.getElementById('pmBadge').value = existingProject.badge || '';
      document.getElementById('pmTech').value = (existingProject.technologies || []).join(', ');
      document.getElementById('pmShortDesc').value = existingProject.shortDescription || '';
      document.getElementById('pmDetailedDesc').value = existingProject.detailedDescription || '';
      document.getElementById('pmKeyFindings').value = existingProject.keyFindings || '';
      document.getElementById('pmBusinessImpact').value = existingProject.businessImpact || '';
      document.getElementById('pmGithubUrl').value = existingProject.githubUrl || '';
      document.getElementById('pmLiveUrl').value = existingProject.liveUrl || '';
      document.getElementById('pmDashboardUrl').value = existingProject.dashboardUrl || '';
      document.getElementById('pmDisplayOrder').value = existingProject.displayOrder || 1;
      document.getElementById('pmFeatured').checked = Boolean(existingProject.featured);
      document.getElementById('pmIsPublished').checked = existingProject.isPublished !== false;

      adminState.pendingProjectKeyPoints = Array.isArray(existingProject.keyPoints) ? JSON.parse(JSON.stringify(existingProject.keyPoints)) : [];
    } else {
      titleElem.textContent = 'Add New Project';
      document.getElementById('projectModalForm').reset();
      document.getElementById('pmId').value = '';
      document.getElementById('pmIsPublished').checked = true;
      document.getElementById('pmDisplayOrder').value = (adminState.data?.draft?.projects?.length || 0) + 1;
      adminState.pendingProjectKeyPoints = [];
    }

    renderModalKeyPoints();
    modal.classList.add('active');
  }

  function renderModalKeyPoints() {
    const list = document.getElementById('modalKeyPointsList');
    if (!list) return;

    if (adminState.pendingProjectKeyPoints.length === 0) {
      list.innerHTML = '<span style="font-size:0.8rem; color:var(--admin-text-dim);">No key points added yet. Type above and click Add.</span>';
      return;
    }

    list.innerHTML = adminState.pendingProjectKeyPoints.map((kp, idx) => `
      <div class="key-point-item">
        <span class="key-point-text">${escapeHtml(kp.text)}</span>
        <div class="key-point-actions">
          ${idx > 0 ? `<button type="button" class="key-point-btn" onclick="window.adminApp.moveKeyPoint(${idx}, -1)" title="Move Up"><i class="fa-solid fa-arrow-up"></i></button>` : ''}
          ${idx < adminState.pendingProjectKeyPoints.length - 1 ? `<button type="button" class="key-point-btn" onclick="window.adminApp.moveKeyPoint(${idx}, 1)" title="Move Down"><i class="fa-solid fa-arrow-down"></i></button>` : ''}
          <button type="button" class="key-point-btn" onclick="window.adminApp.editKeyPoint(${idx})" title="Edit"><i class="fa-solid fa-pen"></i></button>
          <button type="button" class="key-point-btn delete" onclick="window.adminApp.deleteKeyPoint(${idx})" title="Delete"><i class="fa-solid fa-xmark"></i></button>
        </div>
      </div>
    `).join('');
  }

  // ----------------------------------------------------------------------------
  // PROFILE PHOTO DIRECT UPLOAD & PREVIEW
  // ----------------------------------------------------------------------------
  function initProfilePhotoControls() {
    const fileInput = document.getElementById('profPhotoFileInput');
    const uploadBtn = document.getElementById('profUploadPhotoBtn');
    const removeBtn = document.getElementById('profRemovePhotoBtn');
    const urlInput = document.getElementById('profPhotoUrl');
    const previewImg = document.getElementById('adminPhotoPreviewImg');
    const fallback = document.getElementById('adminPhotoFallback');

    function updatePhotoPreview(url) {
      if (url && typeof url === 'string') {
        url = url.trim();
        if (url && !url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/')) {
          url = '/' + url;
        }
      }

      if (url && url !== '') {
        if (previewImg) {
          previewImg.onload = () => {
            previewImg.style.display = 'block';
            if (fallback) fallback.style.display = 'none';
          };
          previewImg.onerror = () => {
            previewImg.style.display = 'none';
            if (fallback) fallback.style.display = 'flex';
          };
          previewImg.src = url;
          if (previewImg.complete && previewImg.naturalWidth > 0) {
            previewImg.style.display = 'block';
            if (fallback) fallback.style.display = 'none';
          }
        }
      } else {
        if (previewImg) {
          previewImg.src = '';
          previewImg.style.display = 'none';
        }
        if (fallback) fallback.style.display = 'flex';
      }
    }

    if (urlInput) {
      urlInput.addEventListener('input', (e) => {
        updatePhotoPreview(e.target.value.trim());
      });
    }

    if (uploadBtn && fileInput) {
      uploadBtn.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', async (e) => {
        if (!e.target.files || !e.target.files[0]) return;
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('image', file);
        formData.append('type', 'profile');

        uploadBtn.disabled = true;
        uploadBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Uploading...';

        try {
          const res = await fetch('/api/admin/media/upload', {
            method: 'POST',
            body: formData
          });
          const json = await res.json();
          if (res.ok && json.success) {
            let photoUrl = json.url || (json.media && json.media.url) || (json.file && json.file.url) || '';
            if (photoUrl && !photoUrl.startsWith('http://') && !photoUrl.startsWith('https://') && !photoUrl.startsWith('/')) {
              photoUrl = '/' + photoUrl;
            }
            if (urlInput) urlInput.value = photoUrl;
            if (adminState.data?.draft?.content?.profile) {
              adminState.data.draft.content.profile.photo = photoUrl;
            }
            if (adminState.data?.draft?.content?.hero) {
              adminState.data.draft.content.hero.photo = photoUrl;
            }
            updatePhotoPreview(photoUrl);
            await saveDraftSection('profile', adminState.data?.draft?.content?.profile);
            if (adminState.data?.draft?.content?.hero) {
              await saveDraftSection('hero', adminState.data?.draft?.content?.hero);
            }
            showToast('Profile photo uploaded and saved to draft!', 'success');
          } else {
            showToast(json.error || 'Failed to upload photo.', 'error');
          }
        } catch (err) {
          showToast('Network error uploading photo.', 'error');
        } finally {
          uploadBtn.disabled = false;
          uploadBtn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> Upload From Device';
          fileInput.value = '';
        }
      });
    }

    if (removeBtn) {
      removeBtn.addEventListener('click', async () => {
        if (urlInput) urlInput.value = '';
        if (adminState.data?.draft?.content?.profile) {
          adminState.data.draft.content.profile.photo = '';
        }
        if (adminState.data?.draft?.content?.hero) {
          adminState.data.draft.content.hero.photo = '';
        }
        updatePhotoPreview('');
        await saveDraftSection('profile', adminState.data?.draft?.content?.profile);
        if (adminState.data?.draft?.content?.hero) {
          await saveDraftSection('hero', adminState.data?.draft?.content?.hero);
        }
        showToast('Profile photo removed. Fallback avatar active.', 'info');
      });
    }
  }

  // ----------------------------------------------------------------------------
  // WORK EXPERIENCE MODAL & CRUD
  // ----------------------------------------------------------------------------
  function initExperienceModal() {
    const modal = document.getElementById('experienceModal');
    const closeBtn = document.getElementById('closeExpModalBtn');
    const cancelBtn = document.getElementById('cancelExpModalBtn');
    const saveBtn = document.getElementById('saveExpModalBtn');
    const addAchBtn = document.getElementById('addExpAchievementBtn');
    const achInput = document.getElementById('newExpAchievementInput');
    const addExpBtn = document.getElementById('addExpBtn');

    if (addExpBtn) {
      addExpBtn.addEventListener('click', () => openExperienceModal());
    }

    const closeModal = () => modal?.classList.remove('active');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    const addAchievement = () => {
      const val = achInput.value.trim();
      if (!val) return;
      adminState.pendingExpAchievements.push(val);
      achInput.value = '';
      renderExpAchievementsList();
    };

    if (addAchBtn) addAchBtn.addEventListener('click', addAchievement);
    if (achInput) {
      achInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          addAchievement();
        }
      });
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', async () => {
        const id = document.getElementById('expId').value;
        const jobTitle = document.getElementById('expJobTitle').value.trim();
        const company = document.getElementById('expCompany').value.trim();

        if (!jobTitle) {
          showToast('Job title is required.', 'error');
          return;
        }
        if (!company) {
          showToast('Company name is required.', 'error');
          return;
        }

        const payload = {
          jobTitle,
          company,
          location: document.getElementById('expLocation').value.trim(),
          startDate: document.getElementById('expStartDate').value.trim(),
          endDate: document.getElementById('expEndDate').value.trim(),
          isCurrent: document.getElementById('expIsCurrent').checked,
          description: document.getElementById('expDescription').value.trim(),
          achievements: adminState.pendingExpAchievements,
          displayOrder: Number(document.getElementById('expDisplayOrder').value) || 1
        };

        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

        try {
          const method = id ? 'PUT' : 'POST';
          const url = id ? `/api/admin/experience/${id}` : '/api/admin/experience';

          const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          const json = await res.json();

          if (res.ok && json.success) {
            closeModal();
            showToast(json.message || 'Work experience saved.', 'success');
            loadAdminData();
          } else {
            showToast(json.error || 'Failed to save experience.', 'error');
          }
        } catch (err) {
          showToast('Network error saving experience.', 'error');
        } finally {
          saveBtn.disabled = false;
          saveBtn.innerHTML = 'Save Experience';
        }
      });
    }
  }

  function openExperienceModal(exp = null) {
    const modal = document.getElementById('experienceModal');
    const title = document.getElementById('expModalTitle');
    if (!modal) return;

    adminState.pendingExpAchievements = [];

    if (exp) {
      title.textContent = 'Edit Work Experience';
      setVal('expId', exp.id);
      setVal('expJobTitle', exp.jobTitle || '');
      setVal('expCompany', exp.company || '');
      setVal('expLocation', exp.location || '');
      setVal('expStartDate', exp.startDate || '');
      setVal('expEndDate', exp.endDate || '');
      document.getElementById('expIsCurrent').checked = Boolean(exp.isCurrent);
      setVal('expDescription', exp.description || '');
      setVal('expDisplayOrder', exp.displayOrder || 1);
      adminState.pendingExpAchievements = (exp.achievements || []).slice();
    } else {
      title.textContent = 'Add Work Experience';
      setVal('expId', '');
      setVal('expJobTitle', '');
      setVal('expCompany', '');
      setVal('expLocation', '');
      setVal('expStartDate', '');
      setVal('expEndDate', '');
      document.getElementById('expIsCurrent').checked = false;
      setVal('expDescription', '');
      const exps = adminState.data?.draft?.content?.experience || [];
      setVal('expDisplayOrder', exps.length + 1);
    }

    renderExpAchievementsList();
    modal.classList.add('active');
  }

  function renderExpAchievementsList() {
    const list = document.getElementById('expAchievementsList');
    if (!list) return;

    if (adminState.pendingExpAchievements.length === 0) {
      list.innerHTML = '<span style="font-size:0.78rem; color:var(--admin-text-dim);">No achievement bullet points added yet.</span>';
      return;
    }

    list.innerHTML = adminState.pendingExpAchievements.map((ach, idx) => `
      <div class="key-point-item">
        <span class="key-point-text">${escapeHtml(ach)}</span>
        <div class="key-point-controls">
          <button type="button" class="key-point-btn delete" onclick="window.adminApp.deleteExpAchievement(${idx})" title="Delete">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>
    `).join('');
  }

  // ----------------------------------------------------------------------------
  // SKILLS MODALS & CRUD (Categories & Items)
  // ----------------------------------------------------------------------------
  function initSkillsModals() {
    // Category Modal bindings
    const catModal = document.getElementById('categoryModal');
    const closeCatBtn = document.getElementById('closeCatModalBtn');
    const cancelCatBtn = document.getElementById('cancelCatModalBtn');
    const saveCatBtn = document.getElementById('saveCatModalBtn');
    const addCatBtn = document.getElementById('addSkillCategoryBtn');

    if (addCatBtn) addCatBtn.addEventListener('click', () => openCategoryModal());

    const closeCat = () => catModal?.classList.remove('active');
    if (closeCatBtn) closeCatBtn.addEventListener('click', closeCat);
    if (cancelCatBtn) cancelCatBtn.addEventListener('click', closeCat);

    if (saveCatBtn) {
      saveCatBtn.addEventListener('click', async () => {
        const id = document.getElementById('cmCategoryId').value;
        const category = document.getElementById('cmName').value.trim();
        const icon = document.getElementById('cmIcon').value.trim() || 'fa-brain';
        const accent = document.getElementById('cmAccent').value;

        if (!category) {
          showToast('Category name is required.', 'error');
          return;
        }

        const payload = { category, icon, accent };
        const method = id ? 'PUT' : 'POST';
        const url = id ? `/api/admin/skills/category/${id}` : '/api/admin/skills/category';

        try {
          const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          const json = await res.json();
          if (res.ok && json.success) {
            closeCat();
            showToast(json.message || 'Category saved.', 'success');
            loadAdminData();
          } else {
            showToast(json.error || 'Failed to save category.', 'error');
          }
        } catch (_) {
          showToast('Network error saving category.', 'error');
        }
      });
    }

    // Individual Skill Modal bindings
    const skillModal = document.getElementById('skillModal');
    const closeSkillBtn = document.getElementById('closeSkillModalBtn');
    const cancelSkillBtn = document.getElementById('cancelSkillModalBtn');
    const saveSkillBtn = document.getElementById('saveSkillModalBtn');

    const closeSkill = () => skillModal?.classList.remove('active');
    if (closeSkillBtn) closeSkillBtn.addEventListener('click', closeSkill);
    if (cancelSkillBtn) cancelSkillBtn.addEventListener('click', closeSkill);

    if (saveSkillBtn) {
      saveSkillBtn.addEventListener('click', async () => {
        const catId = document.getElementById('smCategoryId').value;
        const skillId = document.getElementById('smSkillId').value;
        const name = document.getElementById('smName').value.trim();
        const level = document.getElementById('smLevel').value;
        const icon = document.getElementById('smIcon').value.trim() || 'fa-solid fa-code';

        if (!name) {
          showToast('Skill name is required.', 'error');
          return;
        }

        const payload = { name, level, icon };
        const method = skillId ? 'PUT' : 'POST';
        const url = skillId ? `/api/admin/skills/category/${catId}/item/${skillId}` : `/api/admin/skills/category/${catId}/item`;

        try {
          const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          const json = await res.json();
          if (res.ok && json.success) {
            closeSkill();
            showToast(json.message || 'Skill saved.', 'success');
            loadAdminData();
          } else {
            showToast(json.error || 'Failed to save skill.', 'error');
          }
        } catch (_) {
          showToast('Network error saving skill.', 'error');
        }
      });
    }
  }

  function openCategoryModal(cat = null) {
    const modal = document.getElementById('categoryModal');
    const title = document.getElementById('catModalTitle');
    if (!modal) return;

    if (cat) {
      title.textContent = 'Edit Skill Category';
      setVal('cmCategoryId', cat.id);
      setVal('cmName', cat.category || '');
      setVal('cmIcon', cat.icon || 'fa-laptop-code');
      setVal('cmAccent', cat.accent || 'cyan');
    } else {
      title.textContent = 'Add Skill Category';
      setVal('cmCategoryId', '');
      setVal('cmName', '');
      setVal('cmIcon', 'fa-laptop-code');
      setVal('cmAccent', 'cyan');
    }
    modal.classList.add('active');
  }

  function openSkillModal(catId, item = null) {
    const modal = document.getElementById('skillModal');
    const title = document.getElementById('skillModalTitle');
    if (!modal) return;

    setVal('smCategoryId', catId);

    if (item) {
      title.textContent = 'Edit Skill: ' + item.name;
      setVal('smSkillId', item.id);
      setVal('smName', item.name || '');
      setVal('smLevel', item.level || 'Proficient');
      setVal('smIcon', item.icon || 'fa-solid fa-code');
    } else {
      title.textContent = 'Add Skill';
      setVal('smSkillId', '');
      setVal('smName', '');
      setVal('smLevel', 'Proficient');
      setVal('smIcon', 'fa-solid fa-code');
    }
    modal.classList.add('active');
  }

  // ----------------------------------------------------------------------------
  // RESUME DROPZONE & UPLOAD
  // ----------------------------------------------------------------------------
  function initResumeDropzone() {
    const dropzone = document.getElementById('resumeDropzone');
    const fileInput = document.getElementById('resumeFileInput');

    if (!dropzone || !fileInput) return;

    dropzone.addEventListener('click', () => fileInput.click());

    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        uploadResumeFile(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        uploadResumeFile(e.target.files[0]);
      }
    });
  }

  async function uploadResumeFile(file) {
    const validExtensions = ['.pdf', '.doc', '.docx'];
    const fileName = file.name.toLowerCase();
    const isValidExt = validExtensions.some(ext => fileName.endsWith(ext));

    if (!isValidExt) {
      showToast('Invalid document format. Only PDF, DOC, and DOCX files are allowed.', 'error');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      showToast('Document size exceeds 15MB limit.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    const progressWrap = document.getElementById('resumeUploadProgress');
    const progressBar = document.getElementById('resumeProgressBar');
    const progressPct = document.getElementById('resumeUploadPct');

    if (progressWrap) progressWrap.style.display = 'block';
    if (progressBar) progressBar.style.width = '30%';
    if (progressPct) progressPct.textContent = '30%';

    try {
      const res = await fetch('/api/admin/resume/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (progressBar) progressBar.style.width = '100%';
      if (progressPct) progressPct.textContent = '100%';

      if (res.ok && data.success) {
        showToast('Resume uploaded and set as active document!', 'success');
        loadAdminData();
      } else {
        showToast(data.error || 'Failed to upload resume.', 'error');
      }
    } catch (err) {
      showToast('Network error uploading resume.', 'error');
    } finally {
      setTimeout(() => {
        if (progressWrap) progressWrap.style.display = 'none';
        if (progressBar) progressBar.style.width = '0%';
      }, 1000);
    }
  }

  // ----------------------------------------------------------------------------
  // MEDIA UPLOAD
  // ----------------------------------------------------------------------------
  function initMediaUpload() {
    const uploadBtn = document.getElementById('mediaUploadBtn');
    const fileInput = document.getElementById('mediaFileInput');

    if (uploadBtn && fileInput) {
      uploadBtn.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', async (e) => {
        if (!e.target.files || !e.target.files[0]) return;
        const file = e.target.files[0];

        const formData = new FormData();
        formData.append('image', file);

        uploadBtn.disabled = true;
        uploadBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Uploading...';

        try {
          const res = await fetch('/api/admin/media/upload', {
            method: 'POST',
            body: formData
          });
          const json = await res.json();

          if (res.ok && json.success) {
            showToast('Image uploaded successfully!', 'success');
            loadAdminData();
          } else {
            showToast(json.error || 'Upload failed.', 'error');
          }
        } catch (err) {
          showToast('Network error uploading image.', 'error');
        } finally {
          uploadBtn.disabled = false;
          uploadBtn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> Upload Image';
          fileInput.value = '';
        }
      });
    }
  }

  // ----------------------------------------------------------------------------
  // GOOGLE DRIVE PICKER INTEGRATION & MODAL
  // ----------------------------------------------------------------------------
  function initGoogleDriveModal() {
    const openBtn = document.getElementById('googleDriveImportBtn');
    const modal = document.getElementById('gdriveModal');
    const closeBtn = document.getElementById('closeGdriveModalBtn');
    const closeFooterBtn = document.getElementById('closeGdriveModalFooterBtn');
    const launchPickerBtn = document.getElementById('launchPickerNowBtn');

    const openGdrive = async () => {
      // Check config status from server
      try {
        const res = await fetch('/api/admin/gdrive-config');
        const config = await res.json();
        adminState.gdriveConfig = config;

        const notice = document.getElementById('gdriveConfiguredNotice');
        if (config.isConfigured) {
          notice.style.display = 'block';
        } else {
          notice.style.display = 'none';
        }
      } catch (_) {}

      modal.classList.add('active');
    };

    if (openBtn) openBtn.addEventListener('click', openGdrive);
    if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    if (closeFooterBtn) closeFooterBtn.addEventListener('click', () => modal.classList.remove('active'));

    if (launchPickerBtn) {
      launchPickerBtn.addEventListener('click', () => {
        launchGoogleDrivePicker();
      });
    }
  }

  function launchGoogleDrivePicker() {
    const config = adminState.gdriveConfig;
    if (!config || !config.isConfigured) {
      showToast('Google API Key and Client ID must be set in .env to open picker.', 'error');
      return;
    }

    if (typeof google === 'undefined' || !google.accounts || !gapi) {
      showToast('Google API scripts loading. Please try again in a moment.', 'info');
      return;
    }

    // Initialize OAuth token client
    const tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: config.clientId,
      scope: 'https://www.googleapis.com/auth/drive.readonly',
      callback: (tokenResponse) => {
        if (tokenResponse && tokenResponse.access_token) {
          buildAndOpenPicker(tokenResponse.access_token);
        }
      }
    });

    tokenClient.requestAccessToken({ prompt: 'consent' });
  }

  function buildAndOpenPicker(accessToken) {
    gapi.load('picker', () => {
      const view = new google.picker.DocsView(google.picker.ViewId.DOCS)
        .setMimeTypes('application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document');

      const picker = new google.picker.PickerBuilder()
        .enableFeature(google.picker.Feature.NAV_HIDDEN)
        .setAppId(adminState.gdriveConfig.appId || '')
        .setOAuthToken(accessToken)
        .addView(view)
        .setDeveloperKey(adminState.gdriveConfig.apiKey)
        .setCallback(async (data) => {
          if (data.action === google.picker.Action.PICKED) {
            const doc = data.docs[0];
            showToast(`Downloading "${doc.name}" from Google Drive...`, 'info');

            // Post to drive-import API
            const importRes = await fetch('/api/admin/resume/drive-import', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                fileId: doc.id,
                name: doc.name,
                mimeType: doc.mimeType,
                size: doc.sizeBytes,
                accessToken: accessToken,
                webViewLink: doc.url
              })
            });

            const importJson = await importRes.json();
            if (importRes.ok && importJson.success) {
              showToast('Resume imported from Google Drive and set active!', 'success');
              document.getElementById('gdriveModal')?.classList.remove('active');
              loadAdminData();
            } else {
              showToast(importJson.error || 'Failed to import document.', 'error');
            }
          }
        })
        .build();

      picker.setVisible(true);
    });
  }

  // ----------------------------------------------------------------------------
  // DYNAMIC SOCIAL PROFILES CONTROLS & MODAL
  // ----------------------------------------------------------------------------
  function initSocialControls() {
    const modal = document.getElementById('socialProfileModal');
    const closeBtn = document.getElementById('closeSocialModalBtn');
    const cancelBtn = document.getElementById('cancelSocialModalBtn');
    const saveBtn = document.getElementById('saveSocialProfileBtn');
    const addBtn = document.getElementById('addSocialProfileBtn');
    const testBtn = document.getElementById('spTestLinkBtn');
    const iconInput = document.getElementById('spIcon');
    const iconPreview = document.getElementById('spIconPreview');
    const accentPicker = document.getElementById('spAccentPicker');
    const accentInput = document.getElementById('spAccent');

    if (addBtn) {
      addBtn.addEventListener('click', () => openSocialModal());
    }

    const closeModal = () => modal?.classList.remove('active');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    // Live icon preview
    if (iconInput && iconPreview) {
      iconInput.addEventListener('input', () => {
        const cls = iconInput.value.trim() || 'fa-solid fa-link';
        iconPreview.innerHTML = `<i class="${escapeHtml(cls)}"></i>`;
      });
    }

    // Color picker 2-way sync
    if (accentPicker && accentInput) {
      accentPicker.addEventListener('input', (e) => {
        accentInput.value = e.target.value;
      });
      accentInput.addEventListener('input', (e) => {
        accentPicker.value = e.target.value;
      });
    }

    // Test link button
    if (testBtn) {
      testBtn.addEventListener('click', () => {
        const url = getVal('spUrl');
        if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
          window.open(url, '_blank', 'noopener,noreferrer');
        } else {
          showToast('Please enter a valid URL starting with http:// or https://', 'error');
        }
      });
    }

    // Save profile button
    if (saveBtn) {
      saveBtn.addEventListener('click', async () => {
        const id = getVal('spId');
        const platform = getVal('spPlatform');
        const url = getVal('spUrl');
        const icon = getVal('spIcon') || 'fa-solid fa-link';
        const accent = getVal('spAccent') || '#06b6d4';
        const description = getVal('spDescription');
        const buttonLabel = getVal('spButtonLabel') || `View ${platform} Profile`;
        const displayOrder = parseInt(getVal('spDisplayOrder') || '1', 10);
        const isEnabled = document.getElementById('spIsEnabled')?.checked !== false;

        if (!platform) {
          showToast('Platform name is required.', 'error');
          document.getElementById('spPlatform')?.focus();
          return;
        }

        if (!url) {
          showToast('Profile URL is required.', 'error');
          document.getElementById('spUrl')?.focus();
          return;
        }

        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

        const payload = {
          platform,
          url,
          icon,
          accent,
          description,
          buttonLabel,
          displayOrder,
          isEnabled
        };

        try {
          const endpoint = id ? `/api/admin/social/${id}` : '/api/admin/social';
          const method = id ? 'PUT' : 'POST';

          const res = await fetch(endpoint, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          const json = await res.json();
          if (res.ok && json.success) {
            closeModal();
            showToast(json.message || 'Social profile saved.', 'success');
            await loadAdminData();
          } else {
            showToast(json.error || 'Failed to save social profile.', 'error');
          }
        } catch (_) {
          showToast('Network error saving social profile.', 'error');
        } finally {
          saveBtn.disabled = false;
          saveBtn.innerHTML = 'Save Profile';
        }
      });
    }
  }

  function openSocialModal(profile = null) {
    const modal = document.getElementById('socialProfileModal');
    const title = document.getElementById('socialModalTitle');
    const form = document.getElementById('socialProfileForm');
    const iconPreview = document.getElementById('spIconPreview');

    if (form) form.reset();

    const profiles = adminState.data?.draft?.content?.socialProfiles || [];

    if (profile) {
      if (title) title.textContent = 'Edit Social Profile';
      setVal('spId', profile.id || '');
      setVal('spPlatform', profile.platform || '');
      setVal('spUrl', profile.url || '');
      setVal('spIcon', profile.icon || 'fa-solid fa-link');
      setVal('spAccent', profile.accent || '#06b6d4');
      const picker = document.getElementById('spAccentPicker');
      if (picker && profile.accent && profile.accent.startsWith('#')) picker.value = profile.accent;
      setVal('spDescription', profile.description || '');
      setVal('spButtonLabel', profile.buttonLabel || '');
      setVal('spDisplayOrder', profile.displayOrder || 1);
      const isEn = document.getElementById('spIsEnabled');
      if (isEn) isEn.checked = profile.isEnabled !== false;
      if (iconPreview) iconPreview.innerHTML = `<i class="${escapeHtml(profile.icon || 'fa-solid fa-link')}"></i>`;
    } else {
      if (title) title.textContent = 'Add Social Profile';
      setVal('spId', '');
      setVal('spPlatform', '');
      setVal('spUrl', '');
      setVal('spIcon', 'fa-solid fa-link');
      setVal('spAccent', '#06b6d4');
      setVal('spDescription', '');
      setVal('spButtonLabel', '');
      setVal('spDisplayOrder', profiles.length + 1);
      const isEn = document.getElementById('spIsEnabled');
      if (isEn) isEn.checked = true;
      if (iconPreview) iconPreview.innerHTML = '<i class="fa-solid fa-link"></i>';
    }

    modal?.classList.add('active');
  }

  // ----------------------------------------------------------------------------
  // CONTACT ENQUIRIES INBOX & CONTROLS
  // ----------------------------------------------------------------------------
  function initEnquiriesControls() {
    const searchInput = document.getElementById('enquirySearchInput');
    const refreshBtn = document.getElementById('refreshEnquiriesBtn');
    const filterBtns = document.querySelectorAll('.enq-filter-btn');
    const detailModal = document.getElementById('enquiryDetailModal');
    const closeBtn = document.getElementById('closeEnquiryModalBtn');
    const closeFooterBtn = document.getElementById('closeEnquiryModalFooterBtn');
    const toggleReadBtn = document.getElementById('modalEnqToggleReadBtn');
    const archiveBtn = document.getElementById('modalEnqArchiveBtn');
    const deleteBtn = document.getElementById('modalEnqDeleteBtn');

    // Quick action / card in overview
    document.getElementById('qaViewEnquiriesBtn')?.addEventListener('click', () => switchTab('enquiries'));
    document.getElementById('statEnquiriesCard')?.addEventListener('click', () => switchTab('enquiries'));

    const closeDetailModal = () => detailModal?.classList.remove('active');
    if (closeBtn) closeBtn.addEventListener('click', closeDetailModal);
    if (closeFooterBtn) closeFooterBtn.addEventListener('click', closeDetailModal);

    // Search with debounce
    let searchTimer = null;
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
          adminState.enquirySearch = e.target.value.trim();
          loadEnquiries();
        }, 300);
      });
    }

    // Filter pills
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        adminState.enquiryFilter = btn.getAttribute('data-filter') || 'all';
        loadEnquiries();
      });
    });

    // Refresh button
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        refreshBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Refreshing...';
        loadEnquiries().finally(() => {
          refreshBtn.innerHTML = '<i class="fa-solid fa-rotate"></i> Refresh';
        });
      });
    }

    // Modal action buttons
    if (toggleReadBtn) {
      toggleReadBtn.addEventListener('click', async () => {
        if (!adminState.currentEnquiry) return;
        const targetStatus = adminState.currentEnquiry.status === 'read' ? 'unread' : 'read';
        await updateEnquiryStatus(adminState.currentEnquiry.id, targetStatus);
        closeDetailModal();
      });
    }

    if (archiveBtn) {
      archiveBtn.addEventListener('click', async () => {
        if (!adminState.currentEnquiry) return;
        await updateEnquiryStatus(adminState.currentEnquiry.id, 'archived');
        closeDetailModal();
      });
    }

    if (deleteBtn) {
      deleteBtn.addEventListener('click', async () => {
        if (!adminState.currentEnquiry) return;
        if (!confirm('Are you sure you want to permanently delete this enquiry?')) return;
        await deleteEnquiry(adminState.currentEnquiry.id);
        closeDetailModal();
      });
    }
  }

  async function loadEnquiries() {
    try {
      const filter = adminState.enquiryFilter || 'all';
      const search = adminState.enquirySearch || '';
      const res = await fetch(`/api/admin/enquiries?status=${filter}&search=${encodeURIComponent(search)}`);
      const json = await res.json();

      if (res.ok && json.success) {
        adminState.enquiriesList = json.enquiries || [];
        const stats = json.stats || { total: 0, unread: 0, read: 0, archived: 0 };

        // Update counters
        const countAll = document.getElementById('countEnqAll');
        const countUnread = document.getElementById('countEnqUnread');
        const countRead = document.getElementById('countEnqRead');
        const countArchived = document.getElementById('countEnqArchived');

        if (countAll) countAll.textContent = stats.total;
        if (countUnread) countUnread.textContent = stats.unread;
        if (countRead) countRead.textContent = stats.read;
        if (countArchived) countArchived.textContent = stats.archived;

        // Update sidebar and overview badges
        const badge = document.getElementById('enquiriesBadge');
        if (badge) {
          if (stats.unread > 0) {
            badge.style.display = 'inline-block';
            badge.textContent = stats.unread;
          } else {
            badge.style.display = 'none';
          }
        }

        const statUnread = document.getElementById('statUnreadEnquiries');
        const statTotal = document.getElementById('statTotalEnquiries');
        if (statUnread) statUnread.textContent = stats.unread;
        if (statTotal) statTotal.textContent = stats.total;

        renderEnquiriesList(adminState.enquiriesList);
      }
    } catch (err) {
      console.warn('Failed to load enquiries:', err);
    }
  }

  function renderEnquiriesList(enquiries) {
    const container = document.getElementById('enquiriesListContainer');
    if (!container) return;

    if (!enquiries || enquiries.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 2.5rem 1rem; color: var(--admin-text-muted); background: rgba(9,17,34,0.4); border: 1px dashed var(--admin-border); border-radius: 12px;">
          <i class="fa-solid fa-inbox" style="font-size: 2.2rem; color: var(--admin-text-dim); margin-bottom: 0.75rem; display: block;"></i>
          <p style="font-size: 0.95rem; margin: 0;">No messages matching this filter.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = enquiries.map((enq) => {
      const isUnread = enq.status === 'unread';
      const isArchived = enq.status === 'archived';
      const dateStr = new Date(enq.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      const snippet = (enq.message || '').replace(/\s+/g, ' ').slice(0, 120);

      const statusBadge = isUnread
        ? '<span style="font-size: 0.72rem; padding: 0.2rem 0.6rem; border-radius: 999px; background: rgba(6, 182, 212, 0.2); color: #22d3ee; border: 1px solid rgba(6, 182, 212, 0.4); font-weight: 700;"><i class="fa-solid fa-circle" style="font-size: 0.5rem; vertical-align: middle; margin-right: 0.3rem;"></i>Unread</span>'
        : isArchived
          ? '<span style="font-size: 0.72rem; padding: 0.2rem 0.6rem; border-radius: 999px; background: rgba(100, 116, 139, 0.2); color: #94a3b8; border: 1px solid rgba(100, 116, 139, 0.3); font-weight: 600;">Archived</span>'
          : '<span style="font-size: 0.72rem; padding: 0.2rem 0.6rem; border-radius: 999px; background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); font-weight: 600;">Read</span>';

      return `
        <div style="background: ${isUnread ? 'rgba(6, 182, 212, 0.05)' : 'rgba(9, 17, 34, 0.6)'}; border: 1px solid ${isUnread ? 'rgba(6, 182, 212, 0.35)' : 'var(--admin-border)'}; border-radius: 12px; padding: 1.15rem 1.25rem; margin-bottom: 0.85rem; transition: border-color 0.2s ease;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 0.6rem; margin-bottom: 0.4rem;">
            <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
              <span style="font-size: 1.05rem; font-weight: 700; color: #fff;">${escapeHtml(enq.name)}</span>
              <span style="font-size: 0.85rem; color: var(--admin-accent-cyan);"><i class="fa-solid fa-envelope" style="font-size: 0.75rem;"></i> ${escapeHtml(enq.email)}</span>
              ${statusBadge}
            </div>
            <span style="font-size: 0.8rem; color: var(--admin-text-dim);">${dateStr}</span>
          </div>

          <div style="font-size: 0.95rem; font-weight: 600; color: #f1f5f9; margin-bottom: 0.35rem;">
            ${escapeHtml(enq.subject)}
          </div>

          <div style="font-size: 0.85rem; color: var(--admin-text-muted); line-height: 1.5; margin-bottom: 0.85rem;">
            ${escapeHtml(snippet)}${enq.message && enq.message.length > 120 ? '...' : ''}
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 0.75rem;">
            <button type="button" class="admin-btn admin-btn-primary admin-btn-sm" onclick="window.adminApp.openEnquiryModal('${enq.id}')">
              <i class="fa-solid fa-eye"></i> View Full Message
            </button>
            <div style="display: flex; gap: 0.4rem;">
              <a href="mailto:${escapeHtml(enq.email)}?subject=Re: ${encodeURIComponent(enq.subject)}" class="admin-btn admin-btn-secondary admin-btn-sm" title="Reply via Email">
                <i class="fa-solid fa-reply"></i> Reply
              </a>
              <button type="button" class="admin-btn admin-btn-secondary admin-btn-sm" onclick="window.adminApp.toggleEnquiryRead('${enq.id}', '${enq.status}')" title="${isUnread ? 'Mark as Read' : 'Mark as Unread'}">
                <i class="fa-solid ${isUnread ? 'fa-envelope-open' : 'fa-envelope'}"></i> ${isUnread ? 'Mark Read' : 'Mark Unread'}
              </button>
              ${!isArchived ? `
                <button type="button" class="admin-btn admin-btn-secondary admin-btn-sm" onclick="window.adminApp.archiveEnquiry('${enq.id}')" title="Archive Enquiry">
                  <i class="fa-solid fa-box-archive"></i>
                </button>
              ` : ''}
              <button type="button" class="admin-btn admin-btn-danger admin-btn-sm" onclick="window.adminApp.deleteEnquiry('${enq.id}')" title="Delete Enquiry">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  async function openEnquiryModal(id) {
    const enq = (adminState.enquiriesList || []).find(e => e.id === id);
    if (!enq) return;

    adminState.currentEnquiry = enq;

    const modal = document.getElementById('enquiryDetailModal');
    const nameEl = document.getElementById('modalEnqName');
    const emailLink = document.getElementById('modalEnqEmailLink');
    const subjectEl = document.getElementById('modalEnqSubject');
    const messageEl = document.getElementById('modalEnqMessage');
    const dateEl = document.getElementById('modalEnqDate');
    const statusBadge = document.getElementById('modalEnqStatusBadge');
    const replyBtn = document.getElementById('modalEnqReplyBtn');
    const toggleBtn = document.getElementById('modalEnqToggleReadBtn');

    if (nameEl) nameEl.textContent = enq.name;
    if (emailLink) {
      emailLink.textContent = enq.email;
      emailLink.href = `mailto:${enq.email}`;
    }
    if (subjectEl) subjectEl.textContent = enq.subject;
    if (messageEl) messageEl.textContent = enq.message;
    if (dateEl) dateEl.textContent = new Date(enq.createdAt).toLocaleString();

    if (statusBadge) {
      statusBadge.className = `status-badge ${enq.status}`;
      statusBadge.textContent = enq.status.charAt(0).toUpperCase() + enq.status.slice(1);
    }

    if (replyBtn) {
      replyBtn.href = `mailto:${enq.email}?subject=Re: ${encodeURIComponent(enq.subject)}`;
    }

    if (toggleBtn) {
      toggleBtn.innerHTML = enq.status === 'read'
        ? '<i class="fa-solid fa-envelope"></i> Mark as Unread'
        : '<i class="fa-solid fa-envelope-open"></i> Mark as Read';
    }

    // If unread, automatically mark as read on view
    if (enq.status === 'unread') {
      updateEnquiryStatus(enq.id, 'read');
    }

    modal?.classList.add('active');
  }

  async function updateEnquiryStatus(id, newStatus) {
    try {
      const res = await fetch(`/api/admin/enquiries/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast(json.message || `Status updated to ${newStatus}.`, 'success');
        loadEnquiries();
      }
    } catch (_) {
      showToast('Network error updating enquiry status.', 'error');
    }
  }

  async function deleteEnquiry(id) {
    try {
      const res = await fetch(`/api/admin/enquiries/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast('Enquiry deleted.', 'success');
        loadEnquiries();
      }
    } catch (_) {
      showToast('Network error deleting enquiry.', 'error');
    }
  }

  // ----------------------------------------------------------------------------
  // EXPOSE GLOBAL ACTIONS TO WINDOW
  // ----------------------------------------------------------------------------
  window.adminApp = {
    // Project actions
    editProject: (id) => {
      const proj = adminState.data?.draft?.projects?.find(p => p.id === id);
      if (proj) openProjectModal(proj);
    },
    duplicateProject: async (id) => {
      try {
        const res = await fetch(`/api/admin/projects/${id}/duplicate`, { method: 'POST' });
        const json = await res.json();
        if (res.ok && json.success) {
          showToast('Project duplicated.', 'success');
          loadAdminData();
        }
      } catch (_) {}
    },
    deleteProject: async (id) => {
      if (!confirm('Are you sure you want to permanently delete this project?')) return;
      try {
        const res = await fetch(`/api/admin/projects/${id}`, { method: 'DELETE' });
        const json = await res.json();
        if (res.ok && json.success) {
          showToast('Project deleted.', 'success');
          loadAdminData();
        }
      } catch (_) {}
    },
    toggleProjectPublish: async (id) => {
      try {
        const res = await fetch(`/api/admin/projects/${id}/toggle-publish`, { method: 'POST' });
        const json = await res.json();
        if (res.ok && json.success) {
          showToast(json.message, 'success');
          loadAdminData();
        }
      } catch (_) {}
    },

    // Key points editor actions
    moveKeyPoint: (index, delta) => {
      const arr = adminState.pendingProjectKeyPoints;
      const target = index + delta;
      if (target >= 0 && target < arr.length) {
        const temp = arr[index];
        arr[index] = arr[target];
        arr[target] = temp;
        renderModalKeyPoints();
      }
    },
    editKeyPoint: (index) => {
      const current = adminState.pendingProjectKeyPoints[index].text;
      const updated = prompt('Edit Key Point:', current);
      if (updated !== null && updated.trim() !== '') {
        adminState.pendingProjectKeyPoints[index].text = updated.trim();
        renderModalKeyPoints();
      }
    },
    deleteKeyPoint: (index) => {
      adminState.pendingProjectKeyPoints.splice(index, 1);
      renderModalKeyPoints();
    },

    // Resume actions
    setActiveResume: async (id) => {
      try {
        const res = await fetch(`/api/admin/resume/active/${id}`, { method: 'PUT' });
        const json = await res.json();
        if (res.ok && json.success) {
          showToast('Active resume updated.', 'success');
          loadAdminData();
        }
      } catch (_) {}
    },
    deleteResume: async (id) => {
      if (!confirm('Delete this resume document from storage?')) return;
      try {
        const res = await fetch(`/api/admin/resume/${id}`, { method: 'DELETE' });
        const json = await res.json();
        if (res.ok && json.success) {
          showToast('Resume removed.', 'success');
          loadAdminData();
        }
      } catch (_) {}
    },

    // Media actions
    copyText: (text) => {
      navigator.clipboard.writeText(text).then(() => {
        showToast('Copied URL to clipboard: ' + text, 'success');
      });
    },
    deleteMedia: async (id) => {
      if (!confirm('Permanently delete this image from storage?')) return;
      try {
        const res = await fetch(`/api/admin/media/${id}`, { method: 'DELETE' });
        const json = await res.json();
        if (res.ok && json.success) {
          showToast('Image deleted.', 'success');
          loadAdminData();
        }
      } catch (_) {}
    },

    // Experience actions
    editExperience: (id) => {
      const exp = adminState.data?.draft?.content?.experience?.find(e => e.id === id);
      if (exp) openExperienceModal(exp);
    },
    deleteExperience: async (id) => {
      if (!confirm('Are you sure you want to permanently delete this experience entry?')) return;
      try {
        const res = await fetch(`/api/admin/experience/${id}`, { method: 'DELETE' });
        const json = await res.json();
        if (res.ok && json.success) {
          showToast('Experience entry deleted.', 'success');
          loadAdminData();
        } else {
          showToast(json.error || 'Failed to delete experience.', 'error');
        }
      } catch (_) {
        showToast('Network error deleting experience.', 'error');
      }
    },
    deleteExpAchievement: (index) => {
      adminState.pendingExpAchievements.splice(index, 1);
      renderExpAchievementsList();
    },

    // Skills actions
    openSkillModal: (catId) => openSkillModal(catId),
    editSkillCategory: (catId) => {
      const cat = adminState.data?.draft?.content?.skills?.find(c => c.id === catId);
      if (cat) openCategoryModal(cat);
    },
    deleteSkillCategory: async (catId) => {
      if (!confirm('Are you sure you want to delete this skill category and all its skills?')) return;
      try {
        const res = await fetch(`/api/admin/skills/category/${catId}`, { method: 'DELETE' });
        const json = await res.json();
        if (res.ok && json.success) {
          showToast('Category deleted.', 'success');
          loadAdminData();
        } else {
          showToast(json.error || 'Failed to delete category.', 'error');
        }
      } catch (_) {
        showToast('Network error deleting category.', 'error');
      }
    },
    editSkill: (catId, itemId) => {
      const cat = adminState.data?.draft?.content?.skills?.find(c => c.id === catId);
      const item = (cat?.items || []).find(i => i.id === itemId);
      if (cat && item) openSkillModal(catId, item);
    },
    deleteSkill: async (catId, itemId) => {
      if (!confirm('Are you sure you want to remove this skill?')) return;
      try {
        const res = await fetch(`/api/admin/skills/category/${catId}/item/${itemId}`, { method: 'DELETE' });
        const json = await res.json();
        if (res.ok && json.success) {
          showToast('Skill deleted.', 'success');
          loadAdminData();
        } else {
          showToast(json.error || 'Failed to delete skill.', 'error');
        }
      } catch (_) {
        showToast('Network error deleting skill.', 'error');
      }
    },

    // Social profile actions
    openSocialModal: (id) => {
      const p = (adminState.data?.draft?.content?.socialProfiles || []).find(x => x.id === id);
      openSocialModal(p);
    },
    deleteSocialProfile: async (id) => {
      if (!confirm('Are you sure you want to delete this social profile link?')) return;
      try {
        const res = await fetch(`/api/admin/social/${id}`, { method: 'DELETE' });
        const json = await res.json();
        if (res.ok && json.success) {
          showToast('Social profile removed.', 'success');
          loadAdminData();
        } else {
          showToast(json.error || 'Failed to delete profile.', 'error');
        }
      } catch (_) {
        showToast('Network error deleting profile.', 'error');
      }
    },
    toggleSocialProfile: async (id) => {
      try {
        const res = await fetch(`/api/admin/social/${id}/toggle`, { method: 'PATCH' });
        const json = await res.json();
        if (res.ok && json.success) {
          showToast(json.message, 'success');
          loadAdminData();
        } else {
          showToast(json.error || 'Failed to toggle visibility.', 'error');
        }
      } catch (_) {
        showToast('Network error toggling profile.', 'error');
      }
    },
    moveSocialProfile: async (index, delta) => {
      const profiles = [...(adminState.data?.draft?.content?.socialProfiles || [])].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      const targetIndex = index + delta;
      if (targetIndex >= 0 && targetIndex < profiles.length) {
        const temp = profiles[index];
        profiles[index] = profiles[targetIndex];
        profiles[targetIndex] = temp;

        const orderPayload = profiles.map((p, idx) => ({ id: p.id, displayOrder: idx + 1 }));
        try {
          const res = await fetch('/api/admin/social/reorder', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order: orderPayload })
          });
          const json = await res.json();
          if (res.ok && json.success) {
            loadAdminData();
          }
        } catch (_) {}
      }
    },
    setSocialPreset: (platform, icon, accent, buttonLabel) => {
      setVal('spPlatform', platform);
      setVal('spIcon', icon);
      setVal('spAccent', accent);
      const picker = document.getElementById('spAccentPicker');
      if (picker && accent.startsWith('#')) picker.value = accent;
      const preview = document.getElementById('spIconPreview');
      if (preview) preview.innerHTML = `<i class="${escapeHtml(icon)}"></i>`;
      setVal('spButtonLabel', buttonLabel);
    },

    // Contact Enquiry actions
    openEnquiryModal: (id) => openEnquiryModal(id),
    toggleEnquiryRead: async (id, status) => {
      const target = status === 'read' ? 'unread' : 'read';
      await updateEnquiryStatus(id, target);
    },
    archiveEnquiry: async (id) => {
      await updateEnquiryStatus(id, 'archived');
    },
    deleteEnquiry: async (id) => {
      if (!confirm('Are you sure you want to permanently delete this contact inquiry?')) return;
      await deleteEnquiry(id);
    }
  };

  // ----------------------------------------------------------------------------
  // HELPER UTILITIES
  // ----------------------------------------------------------------------------
  function getVal(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function setVal(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val !== undefined && val !== null ? val : '';
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

  function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  function showToast(message, type = 'success') {
    const container = document.getElementById('adminToastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `admin-toast ${type}`;
    const icon = type === 'error' ? 'fa-solid fa-circle-exclamation' : type === 'info' ? 'fa-solid fa-circle-info' : 'fa-solid fa-circle-check';
    toast.innerHTML = `<i class="${icon}"></i> <span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(20px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3800);
  }
});

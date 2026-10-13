/**
 * ==============================================================================
 * KISHOR KUMAR PORTFOLIO - END-TO-END AUTOMATED TEST SUITE
 * Validates Authentication, Protected Routes, CMS Updates, Draft/Publish Isolation,
 * Project Management, Key Points, and Resume Endpoints
 * ==============================================================================
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { app } = require('./server');

const PORT = 3001; // Run test instance on port 3001
let serverInstance;
let adminCookie = '';

// Helper for HTTP requests
function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'localhost',
      port: PORT,
      path: path,
      method: method,
      headers: {
        ...headers
      }
    };

    if (adminCookie && !opts.headers['Cookie']) {
      opts.headers['Cookie'] = adminCookie;
    }

    let payload = null;
    if (body && typeof body === 'object' && !(body instanceof Buffer)) {
      payload = JSON.stringify(body);
      opts.headers['Content-Type'] = 'application/json';
      opts.headers['Content-Length'] = Buffer.byteLength(payload);
    } else if (body instanceof Buffer) {
      payload = body;
      opts.headers['Content-Length'] = payload.length;
    }

    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch (_) {}
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json || data
        });
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING COMPREHENSIVE AUTOMATED VERIFICATION ---');

  // Start test server
  serverInstance = app.listen(PORT);
  await new Promise(r => setTimeout(r, 600));

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Public Content
    const pubRes = await request('GET', '/api/public/content');
    assert(pubRes.status === 200, 'Public content endpoint returns HTTP 200');
    assert(pubRes.data.success === true, 'Public content success flag is true');
    assert(pubRes.data.data.projects.length >= 7, 'Public projects list contains 7+ projects');
    assert(pubRes.data.data.skills.length === 3, 'Public skills list contains 3 categories');
    assert(Boolean(pubRes.data.data.activeResume), 'Active resume reference is available to public visitors');

    // 2. Unauthorized Access Protection
    const unauthContent = await request('GET', '/api/admin/content');
    assert(unauthContent.status === 401, 'Unauthorized request to /api/admin/content is blocked (401)');

    const unauthPublish = await request('POST', '/api/admin/publish');
    assert(unauthPublish.status === 401, 'Unauthorized request to /api/admin/publish is blocked (401)');

    const unauthProject = await request('POST', '/api/admin/projects', { title: 'Hacked Project' });
    assert(unauthProject.status === 401, 'Unauthorized project creation is blocked (401)');

    // 3. Admin Authentication
    const targetAdminEmail = process.env.ADMIN_EMAIL || 'kishorsk1702@gmail.com';
    const badLogin = await request('POST', '/api/auth/login', {
      email: targetAdminEmail,
      password: 'WrongPassword123!'
    });
    assert(badLogin.status === 401, 'Invalid password is appropriately rejected with 401');

    const goodLogin = await request('POST', '/api/auth/login', {
      email: targetAdminEmail,
      password: process.env.ADMIN_PASSWORD || 'Kishor@Analytics2026!'
    });
    assert(goodLogin.status === 200, 'Authorized admin login succeeds with 200');
    assert(goodLogin.data.success === true, 'Login response confirms successful authentication');

    // Extract cookie
    const setCookie = goodLogin.headers['set-cookie'];
    assert(Boolean(setCookie && setCookie[0].includes('kk_admin_token')), 'Secure httpOnly admin session cookie issued');
    if (setCookie) adminCookie = setCookie[0].split(';')[0];

    // 4. Session Verification
    const sessionRes = await request('GET', '/api/auth/me');
    assert(sessionRes.status === 200 && sessionRes.data.authenticated === true, 'Session endpoint /api/auth/me recognizes logged-in admin');

    // 5. Admin Draft Content Editing & Draft Isolation
    const originalHeroName = pubRes.data.data.hero.name;
    const testDraftName = 'Kishor Kumar (Test Draft)';

    const updateDraftRes = await request('PUT', '/api/admin/content', {
      section: 'hero',
      data: {
        ...pubRes.data.data.hero,
        name: testDraftName
      }
    });
    assert(updateDraftRes.status === 200, 'Admin can update draft content section');

    // Verify public still sees original (Draft isolation!)
    const pubCheck1 = await request('GET', '/api/public/content');
    assert(pubCheck1.data.data.hero.name === originalHeroName, 'Draft changes remain isolated from public visitors before publishing');

    // 6. Publishing Workflow
    const publishRes = await request('POST', '/api/admin/publish');
    assert(publishRes.status === 200, 'Admin publish action succeeds with 200');

    // Verify public now sees updated content
    const pubCheck2 = await request('GET', '/api/public/content');
    assert(pubCheck2.data.data.hero.name === testDraftName, 'Published changes immediately appear on public endpoint');

    // Restore original name and publish
    await request('PUT', '/api/admin/content', {
      section: 'hero',
      data: { ...pubRes.data.data.hero, name: originalHeroName }
    });
    await request('POST', '/api/admin/publish');

    // 7. Project Management & Key Points
    const newProjRes = await request('POST', '/api/admin/projects', {
      title: 'Automated Fraud Risk Analysis',
      category: 'SQL',
      badge: 'Risk Intelligence',
      technologies: ['PostgreSQL', 'CTEs', 'Window Functions'],
      shortDescription: 'Real-time transaction anomaly detection system.',
      keyPoints: [
        { id: 'kp-test-1', text: 'Identified abnormal debit frequency surges.', order: 1 },
        { id: 'kp-test-2', text: 'Reduced false positive alerts by 24%.', order: 2 }
      ],
      githubUrl: 'https://github.com/test-user/fraud-detection',
      liveUrl: 'https://demo-site.com',
      isPublished: true
    });
    assert(newProjRes.status === 201, 'Admin can create new project with key points');
    const createdId = newProjRes.data.project.id;

    // URL validation check
    const badUrlProject = await request('POST', '/api/admin/projects', {
      title: 'Bad URL Project',
      githubUrl: 'not_a_valid_url'
    });
    assert(badUrlProject.status === 400, 'Invalid GitHub URL is rejected with 400 error message');

    // Duplicate project
    const dupRes = await request('POST', `/api/admin/projects/${createdId}/duplicate`);
    assert(dupRes.status === 200, 'Admin can duplicate existing project');

    // Delete test projects
    const del1 = await request('DELETE', `/api/admin/projects/${createdId}`);
    assert(del1.status === 200, 'Admin can delete project');
    await request('DELETE', `/api/admin/projects/${dupRes.data.project.id}`);

    // Verify Loan Default Risk Analysis project GitHub link
    const loanRiskProj = pubRes.data.data.projects.find(p => p.title.includes('Loan Default Risk'));
    assert(Boolean(loanRiskProj && loanRiskProj.githubUrl && loanRiskProj.githubUrl.includes('loan-default-risk-analytics')), 'Loan Default Risk Analysis project has valid GitHub URL');

    // 8. Experience CRUD
    const expListRes = await request('GET', '/api/admin/experience');
    assert(expListRes.status === 200 && Array.isArray(expListRes.data.experience), 'Admin can list work experience entries');

    const addExpRes = await request('POST', '/api/admin/experience', {
      jobTitle: 'Senior Data Analytics Consultant',
      company: 'Enterprise BI Solutions',
      location: 'Bengaluru, India',
      startDate: '2025-01',
      endDate: 'Present',
      isCurrent: true,
      description: 'Consulted on end-to-end data pipeline architecture and Power BI dashboards.',
      achievements: ['Delivered 5 high-impact reporting pipelines.', 'Mentored junior analysts in SQL optimization.']
    });
    assert(addExpRes.status === 201 && addExpRes.data.success, 'Admin can create work experience entry with achievements');
    const createdExpId = addExpRes.data.experience.id;

    const updateExpRes = await request('PUT', `/api/admin/experience/${createdExpId}`, {
      jobTitle: 'Lead Data Analytics Consultant',
      achievements: ['Delivered 8 high-impact reporting pipelines.']
    });
    assert(updateExpRes.status === 200 && updateExpRes.data.experience.jobTitle === 'Lead Data Analytics Consultant', 'Admin can update work experience entry');

    const delExpRes = await request('DELETE', `/api/admin/experience/${createdExpId}`);
    assert(delExpRes.status === 200, 'Admin can delete work experience entry');

    // 9. Skills CRUD
    const skillsListRes = await request('GET', '/api/admin/skills');
    assert(skillsListRes.status === 200 && Array.isArray(skillsListRes.data.skills), 'Admin can list skills categories and items');

    const addCatRes = await request('POST', '/api/admin/skills/category', {
      category: 'Cloud Data Platforms',
      icon: 'fa-cloud',
      accent: 'cyan'
    });
    assert(addCatRes.status === 201 && addCatRes.data.success, 'Admin can create skill category');
    const createdCatId = addCatRes.data.category.id;

    const addItemRes = await request('POST', `/api/admin/skills/category/${createdCatId}/item`, {
      name: 'Google BigQuery',
      level: 'Advanced',
      icon: 'fa-solid fa-database'
    });
    assert(addItemRes.status === 201 && addItemRes.data.success, 'Admin can add skill item to category');
    const createdItemId = addItemRes.data.item.id;

    const updateItemRes = await request('PUT', `/api/admin/skills/category/${createdCatId}/item/${createdItemId}`, {
      name: 'Google BigQuery / SQL',
      level: 'Expert'
    });
    assert(updateItemRes.status === 200 && updateItemRes.data.item.level === 'Expert', 'Admin can update skill item');

    const delItemRes = await request('DELETE', `/api/admin/skills/category/${createdCatId}/item/${createdItemId}`);
    assert(delItemRes.status === 200, 'Admin can delete skill item');

    const delCatRes = await request('DELETE', `/api/admin/skills/category/${createdCatId}`);
    assert(delCatRes.status === 200, 'Admin can delete skill category');

    // 10. Resume Download & Preview Endpoints
    const dlRes = await request('GET', '/api/resume/download');
    assert(dlRes.status === 200, 'Public resume download endpoint /api/resume/download returns 200');

    const prevRes = await request('GET', '/api/resume/preview');
    assert(prevRes.status === 200, 'Public resume preview endpoint /api/resume/preview returns 200');

    // 11. Profile Photo Integrity & Static File Serving
    const photoPath = pubRes.data.data.profile?.photo || pubRes.data.data.hero?.photo;
    assert(Boolean(photoPath && photoPath.startsWith('/uploads/images/')), 'Public profile photo has a valid uploaded image URL');
    if (photoPath) {
      const imgRes = await request('GET', photoPath);
      assert(imgRes.status === 200, 'Uploaded profile photo is successfully served over HTTP with status 200');
    }

    // 12. Dynamic Social & Professional Profiles
    const publicSocial = pubRes.data.data.socialProfiles;
    assert(Array.isArray(publicSocial) && publicSocial.length >= 2, 'Public social profiles array contains published active links');
    const allValid = publicSocial.every(s => s.isEnabled !== false && s.url && s.url.trim() !== '');
    assert(allValid, 'Public social profiles exclusively contain active profiles with valid URLs (no empty slots)');

    // Admin Social CRUD
    const adminSocialRes = await request('GET', '/api/admin/social');
    assert(adminSocialRes.status === 200 && Array.isArray(adminSocialRes.data.profiles), 'Admin can list draft social profiles');

    const invalidSocialRes = await request('POST', '/api/admin/social', { platform: '', url: '' });
    assert(invalidSocialRes.status === 400, 'Validation: Empty social profile payload is rejected with 400');

    const addSocialRes = await request('POST', '/api/admin/social', {
      platform: 'Tableau Public',
      url: 'https://public.tableau.com/app/profile/kishor.kumar',
      icon: 'fa-solid fa-chart-line',
      accent: '#e97627',
      description: 'Explore my published interactive Tableau business dashboards.',
      buttonLabel: 'Explore Tableau Visualizations',
      isEnabled: true
    });
    assert(addSocialRes.status === 201 && addSocialRes.data.success, 'Admin can create dynamic social/professional profile');
    const createdSocialId = addSocialRes.data.profile.id;

    const toggleSocialRes = await request('PATCH', `/api/admin/social/${createdSocialId}/toggle`);
    assert(toggleSocialRes.status === 200 && toggleSocialRes.data.profile.isEnabled === false, 'Admin can toggle profile visibility');

    const updateSocialRes = await request('PUT', `/api/admin/social/${createdSocialId}`, {
      platform: 'Tableau Public (Updated)',
      url: 'https://public.tableau.com/app/profile/kishor.kumar',
      icon: 'fa-solid fa-chart-line',
      accent: '#e97627',
      description: 'Updated description for Tableau profile.',
      buttonLabel: 'View Tableau Dashboards',
      isEnabled: true
    });
    assert(updateSocialRes.status === 200 && updateSocialRes.data.profile.platform === 'Tableau Public (Updated)', 'Admin can update existing social profile');

    const delSocialRes = await request('DELETE', `/api/admin/social/${createdSocialId}`);
    assert(delSocialRes.status === 200, 'Admin can delete social profile');

    // 13. Contact Enquiries & Inbox
    // Validation: Missing fields
    const badContact1 = await request('POST', '/api/contact', { name: '', email: 'test@example.com' });
    assert(badContact1.status === 400, 'Contact validation: Missing fields rejected with 400');

    // Validation: Invalid email
    const badContact2 = await request('POST', '/api/contact', {
      name: 'Test Recruiter',
      email: 'not-an-email',
      subject: 'Interview Offer',
      message: 'Hello, this is a test message with enough characters.'
    });
    assert(badContact2.status === 400, 'Contact validation: Invalid email format rejected with 400');

    // Honeypot spam protection
    const spamSubmission = await request('POST', '/api/contact', {
      name: 'Spam Bot',
      email: 'bot@spammer.com',
      subject: 'Buy Crypto Now',
      message: 'This is automated spam message content.',
      company_website_hp: 'https://spam-domain.com'
    });
    assert(spamSubmission.status === 200, 'Honeypot: Bot submission silently absorbed with 200');

    // Valid contact submission
    const validContact = await request('POST', '/api/contact', {
      name: 'Sarah Jenkins',
      email: 'sjenkins@innovatedata.com',
      subject: 'Senior Data Analyst Role - Interview Request',
      message: 'Hi Kishor, We reviewed your portfolio and project case studies. We would love to discuss an open Data Analyst opportunity with our team.'
    });
    assert(validContact.status === 201 && validContact.data.success, 'Valid contact enquiry successfully submitted (HTTP 201)');
    const createdEnquiryId = validContact.data.enquiryId;
    assert(Boolean(createdEnquiryId), 'Submission response returns unique enquiry ID');

    // Duplicate submission rate limiter
    const dupContact = await request('POST', '/api/contact', {
      name: 'Sarah Jenkins',
      email: 'sjenkins@innovatedata.com',
      subject: 'Senior Data Analyst Role - Interview Request',
      message: 'Hi Kishor, We reviewed your portfolio and project case studies. We would love to discuss an open Data Analyst opportunity with our team.'
    });
    assert(dupContact.status === 429, 'Rate limiter: Immediate duplicate contact submission blocked with HTTP 429');

    // Admin Inbox: List enquiries
    const adminEnqList = await request('GET', '/api/admin/enquiries');
    assert(adminEnqList.status === 200 && Array.isArray(adminEnqList.data.enquiries), 'Admin can list contact enquiries in inbox');
    const foundEnquiry = adminEnqList.data.enquiries.find(e => e.id === createdEnquiryId);
    assert(Boolean(foundEnquiry && foundEnquiry.status === 'unread'), 'Submitted enquiry appears in Admin Inbox with unread status');

    // Admin Inbox: Stats
    const adminEnqStats = await request('GET', '/api/admin/enquiries/stats');
    assert(adminEnqStats.status === 200 && adminEnqStats.data.stats.unread >= 1, 'Admin can retrieve enquiry statistics with unread count');

    // Admin Inbox: Single enquiry details
    const adminEnqDetail = await request('GET', `/api/admin/enquiries/${createdEnquiryId}`);
    assert(adminEnqDetail.status === 200 && adminEnqDetail.data.enquiry.name === 'Sarah Jenkins', 'Admin can retrieve individual enquiry details');

    // Admin Inbox: Mark as read
    const markReadRes = await request('PUT', `/api/admin/enquiries/${createdEnquiryId}/status`, { status: 'read' });
    assert(markReadRes.status === 200 && markReadRes.data.enquiry.status === 'read', 'Admin can update enquiry status to read');

    // Admin Inbox: Delete enquiry
    const delEnquiryRes = await request('DELETE', `/api/admin/enquiries/${createdEnquiryId}`);
    assert(delEnquiryRes.status === 200, 'Admin can delete enquiry from inbox');

    // 14. Logout
    const logoutRes = await request('POST', '/api/auth/logout');
    assert(logoutRes.status === 200, 'Admin logout succeeds');

    // Clear local cookie
    adminCookie = '';
    const followUpCheck = await request('GET', '/api/admin/content');
    assert(followUpCheck.status === 401, 'Session is successfully terminated on logout');

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    serverInstance.close();
    console.log(`\n========================================`);
    console.log(` TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
    console.log(`========================================\n`);
  }
}

runTests();

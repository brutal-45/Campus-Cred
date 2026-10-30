/**
 * CampusCred — end-to-end workflow smoke test
 *
 * Exercises every major user workflow against a running server + real DB:
 * auth (register/login/refresh/OTP/logout), tasks, submissions, admin review,
 * certificate generation + hash verification, internships (post/apply/hire),
 * mentorship booking, messaging, notifications, ambassador referrals,
 * leaderboard/score/portfolio, company + college + admin analytics, and
 * page rendering.
 *
 * Usage:
 *   BASE_URL=http://localhost:3000 \
 *   ADMIN_EMAIL=admin@campuscred.test ADMIN_PASSWORD='Admin@1234' \
 *   SERVER_LOG=/tmp/server.log \
 *   node scripts/smoke-test.mjs
 *
 * SERVER_LOG (optional): file the server's stdout is redirected to. Used to
 * read the console-email OTP so the email-verification workflow can complete
 * in CI (EMAIL_PROVIDER=console). Without it, that one step is skipped.
 */

import { readFileSync, existsSync } from 'node:fs';

const BASE = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@campuscred.test';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@1234';
const SERVER_LOG = process.env.SERVER_LOG || '';
const RUN = Date.now().toString().slice(-8);
const PASSWORD = 'Test@1234';

let passed = 0;
const failures = [];

function check(name, cond, detail = '') {
  if (cond) {
    passed += 1;
    console.log(`  ✅ ${name}`);
  } else {
    failures.push(name);
    console.log(`  ❌ ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

function section(title) {
  console.log(`\n▶ ${title}`);
}

async function api(path, { method = 'GET', token, body, headers = {} } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch { /* HTML pages */ }
  return { status: res.status, json, text, headers: res.headers };
}

function readNewOtp(offset) {
  if (!SERVER_LOG || !existsSync(SERVER_LOG)) return null;
  const content = readFileSync(SERVER_LOG, 'utf8').slice(offset);
  const matches = [...content.matchAll(/code is (\d{6})/g)];
  return matches.length ? matches[matches.length - 1][1] : null;
}

function logSize() {
  if (!SERVER_LOG || !existsSync(SERVER_LOG)) return 0;
  return readFileSync(SERVER_LOG, 'utf8').length;
}

async function registerUser({ fullName, email, role = 'student', extra = {} }) {
  const r = await api('/api/auth/register', {
    method: 'POST',
    body: { fullName, email, password: PASSWORD, role, ...extra },
  });
  return r;
}

async function main() {
  console.log(`Smoke testing ${BASE} (run ${RUN})`);

  // ─────────────────────────────────────────────────────────────
  section('Public endpoints & pages');
  const health = await api('/api/health');
  check('GET /api/health → healthy', health.status === 200 && health.json?.status === 'healthy', `status ${health.status}`);

  for (const [name, path] of [
    ['stats', '/api/stats'],
    ['tasks list', '/api/tasks'],
    ['companies', '/api/companies'],
    ['colleges', '/api/colleges'],
    ['internships', '/api/internships'],
    ['blog', '/api/blog'],
    ['daily challenges', '/api/daily-challenges'],
    ['hall of fame', '/api/student/hall-of-fame'],
  ]) {
    const r = await api(path);
    check(`GET ${path} → 200 (${name})`, r.status === 200, `status ${r.status}`);
  }

  const seedDisabled = await api('/api/seed');
  check('GET /api/seed stays disabled (410)', seedDisabled.status === 410, `status ${seedDisabled.status}`);

  for (const path of ['/', '/login', '/register', '/tasks', '/companies', '/colleges', '/internships',
    '/blog', '/about', '/pricing', '/how-it-works', '/contact', '/hall-of-fame',
    '/dashboard', '/dashboard/tasks', '/dashboard/leaderboard', '/dashboard/notifications',
    '/dashboard/mentorship', '/dashboard/messages', '/dashboard/ambassador', '/dashboard/journey',
    '/dashboard/challenges', '/admin', '/company/register', '/college/register', '/onboarding']) {
    const r = await api(path);
    check(`Page ${path} renders (200)`, r.status === 200, `status ${r.status}`);
  }

  // ─────────────────────────────────────────────────────────────
  section('Student registration, session refresh, profile');
  const studentEmail = `student${RUN}@example.com`;
  const reg = await registerUser({ fullName: 'Smoke Student', email: studentEmail });
  check('Register student → 201 + tokens', reg.status === 201 && !!reg.json?.token && !!reg.json?.refreshToken, `status ${reg.status}`);
  const studentToken = reg.json?.token;
  const studentRefresh = reg.json?.refreshToken;
  const studentId = reg.json?.user?.id;

  const refreshAfterRegister = await api('/api/auth/refresh-token', { method: 'POST', body: { refreshToken: studentRefresh } });
  check('Refresh right after register works (session persisted)', refreshAfterRegister.status === 200 && !!refreshAfterRegister.json?.token, `status ${refreshAfterRegister.status}`);

  const dup = await registerUser({ fullName: 'Smoke Student', email: studentEmail });
  check('Duplicate email → 409', dup.status === 409, `status ${dup.status}`);

  const badLogin = await api('/api/auth/login', { method: 'POST', body: { email: studentEmail, password: 'Wrong@123' } });
  check('Wrong password → 401', badLogin.status === 401, `status ${badLogin.status}`);

  const login = await api('/api/auth/login', { method: 'POST', body: { email: studentEmail, password: PASSWORD, rememberMe: true } });
  check('Login → 200 + token', login.status === 200 && !!login.json?.token, `status ${login.status}`);

  const selfVerify = await api('/api/user/profile', { method: 'PUT', token: studentToken, body: { isVerified: true } });
  check('Profile PUT cannot self-verify (isVerified ignored)', selfVerify.status === 200 && selfVerify.json?.user?.isVerified === false,
    `isVerified=${selfVerify.json?.user?.isVerified}`);

  const profile = await api('/api/user/profile', {
    method: 'PUT', token: studentToken,
    body: { degree: 'B.Tech', branch: 'CSE', college: 'IIT Bombay', city: 'Mumbai', year: '3rd Year', bio: 'Smoke test student', skills: ['Node.js', 'React'] },
  });
  check('Profile update → 200', profile.status === 200, `status ${profile.status}`);

  // Email OTP verification (needs server log to read the console OTP)
  const otpOffset = logSize();
  const sendOtp = await api('/api/auth/send-email-otp', { method: 'POST', body: { email: studentEmail } });
  check('Send email OTP → 200', sendOtp.status === 200, `status ${sendOtp.status}`);
  const wrongOtp = await api('/api/auth/verify-email-otp', { method: 'POST', body: { email: studentEmail, otp: '000000' } });
  check('Wrong OTP → 400', wrongOtp.status === 400, `status ${wrongOtp.status}`);
  const otp = readNewOtp(otpOffset);
  if (otp) {
    const verifyOtp = await api('/api/auth/verify-email-otp', { method: 'POST', body: { email: studentEmail, otp } });
    check('Verify email OTP → verified', verifyOtp.status === 200 && verifyOtp.json?.verified === true, `status ${verifyOtp.status}`);
    const relogin = await api('/api/auth/login', { method: 'POST', body: { email: studentEmail, password: PASSWORD } });
    check('OTP verification persisted (isVerified=true)', relogin.json?.user?.isVerified === true, `isVerified=${relogin.json?.user?.isVerified}`);
  } else {
    console.log('  ⚠️  Skipping OTP completion (set SERVER_LOG to enable)');
  }

  const welcome = await api('/api/certificates/welcome', { method: 'POST', token: studentToken, body: {} });
  check('Welcome certificate issued', welcome.status === 200 && !!welcome.json?.certificate?.certificateId, `status ${welcome.status}`);
  const welcomeCertId = welcome.json?.certificate?.certificateId;
  if (welcomeCertId) {
    const verifyWelcome = await api(`/api/verify/${welcomeCertId}`);
    check('Welcome cert verifies + hashValid', verifyWelcome.json?.valid === true && verifyWelcome.json?.hashValid === true,
      `valid=${verifyWelcome.json?.valid} hashValid=${verifyWelcome.json?.hashValid}`);
  }

  // ─────────────────────────────────────────────────────────────
  section('Admin auth & task workflow');
  const adminLogin = await api('/api/auth/login', { method: 'POST', body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD } });
  check('Admin login → 200 + admin role', adminLogin.status === 200 && adminLogin.json?.user?.role === 'admin', `status ${adminLogin.status}`);
  const adminToken = adminLogin.json?.token;
  if (!adminToken) {
    // Everything below depends on an admin session — fail fast with a clear
    // message instead of cascading failures. (Common cause: the server's
    // ADMIN_EMAIL env does not match the seeded admin's email.)
    throw new Error(
      `Admin login failed (status ${adminLogin.status}: ${adminLogin.json?.error || 'no token'}). ` +
      'Ensure the app server and test agree on ADMIN_EMAIL/ADMIN_PASSWORD and the admin is seeded.'
    );
  }

  const studentForbidden = await api('/api/admin/students', { token: studentToken });
  check('Student token on admin API → 403', studentForbidden.status === 403, `status ${studentForbidden.status}`);
  const noAuth = await api('/api/notifications');
  check('No token on private API → 401', noAuth.status === 401, `status ${noAuth.status}`);

  const deadline = new Date(Date.now() + 7 * 86400000).toISOString();
  const taskRes = await api('/api/tasks', {
    method: 'POST', token: adminToken,
    body: { title: `Smoke Task ${RUN}`, description: 'Build something great', degree: 'B.Tech', branch: 'CSE', difficulty: 'Medium', points: 50, deadline, category: 'development', estimatedHours: '4' },
  });
  check('Admin creates task → 201', taskRes.status === 201 && !!taskRes.json?.task?.id, `status ${taskRes.status}`);
  const taskId = taskRes.json?.task?.id;

  const challengeRes = await api('/api/tasks', {
    method: 'POST', token: adminToken,
    body: { title: `Smoke Challenge ${RUN}`, description: 'Daily challenge', degree: 'B.Tech', branch: 'CSE', difficulty: 'Easy', points: 20, deadline, isChallenge: true, category: 'development' },
  });
  check('Admin creates daily challenge task → 201', challengeRes.status === 201, `status ${challengeRes.status}`);

  const challenges = await api('/api/daily-challenges');
  check('Daily challenges include the new challenge',
    (challenges.json?.challenges || []).some((c) => c.title === `Smoke Challenge ${RUN}`));

  const taskList = await api('/api/tasks');
  check('Task appears in public task list', (taskList.json?.tasks || []).some((t) => t.id === taskId));

  const taskDetail = await api(`/api/tasks/${taskId}`, { token: studentToken });
  check('Task detail → 200', taskDetail.status === 200, `status ${taskDetail.status}`);

  const studentCreateTask = await api('/api/tasks', { method: 'POST', token: studentToken, body: { title: 'x', description: 'x', degree: 'x', branch: 'x', deadline } });
  check('Student creating task → 403', studentCreateTask.status === 403, `status ${studentCreateTask.status}`);

  // ─────────────────────────────────────────────────────────────
  section('Submission → admin approval → certificate → verify');
  const submit = await api(`/api/student/tasks/${taskId}/submit`, {
    method: 'POST', token: studentToken,
    body: { externalLink: 'https://github.com/example/smoke', description: 'Smoke submission' },
  });
  check('Student submits task → 201', submit.status === 201, `status ${submit.status}`);
  const submissionId = submit.json?.submission?.id;

  const dupSubmit = await api(`/api/student/tasks/${taskId}/submit`, {
    method: 'POST', token: studentToken, body: { externalLink: 'https://example.com' },
  });
  check('Duplicate submission → 409', dupSubmit.status === 409, `status ${dupSubmit.status}`);

  const mySubs = await api('/api/student/submissions', { token: studentToken });
  check('My submissions contain the submission', (mySubs.json?.submissions || []).some((s) => s.id === submissionId));

  const adminSubs = await api('/api/admin/submissions', { token: adminToken });
  check('Admin submission queue contains it', (adminSubs.json?.submissions || []).some((s) => s.id === submissionId));

  const approve = await api(`/api/admin/submissions/${submissionId}/approve`, { method: 'PUT', token: adminToken, body: {} });
  check('Admin approves → 200 + certificate', approve.status === 200 && !!approve.json?.certificate?.certificateId,
    `status ${approve.status} cert=${approve.json?.certificate?.certificateId}`);
  const certificateId = approve.json?.certificate?.certificateId;

  const verify = await api(`/api/verify/${certificateId}`);
  check('Certificate verifies as valid', verify.json?.valid === true, JSON.stringify(verify.json).slice(0, 160));
  check('Certificate SHA-256 hash valid', verify.json?.hashValid === true, `hashValid=${verify.json?.hashValid}`);

  const verifyBogus = await api('/api/verify/CERT-1900-NOPE00');
  check('Bogus certificate → valid:false (no crash)', verifyBogus.status === 200 && verifyBogus.json?.valid === false, `status ${verifyBogus.status}`);

  const myCerts = await api('/api/student/certificates', { token: studentToken });
  check('Student certificates include task + welcome certs', (myCerts.json?.certificates || []).length >= 2,
    `count=${(myCerts.json?.certificates || []).length}`);

  const certDetail = await api(`/api/certificates/${certificateId}`, { token: studentToken });
  check('Certificate detail (owner) → 200', certDetail.status === 200, `status ${certDetail.status}`);

  const generateAgain = await api('/api/certificates/generate', { method: 'POST', token: adminToken, body: { submissionId } });
  check('Regenerating existing cert → already exists', generateAgain.status === 200 && /already exists/i.test(generateAgain.json?.message || ''),
    `status ${generateAgain.status}`);

  const approveAgain = await api(`/api/admin/submissions/${submissionId}/approve`, { method: 'PUT', token: adminToken, body: {} });
  check('Double approval → 400', approveAgain.status === 400, `status ${approveAgain.status}`);

  // Reject workflow on a second task
  const task2 = await api('/api/tasks', {
    method: 'POST', token: adminToken,
    body: { title: `Smoke Reject Task ${RUN}`, description: 'Will be rejected', degree: 'B.Tech', branch: 'CSE', points: 10, deadline },
  });
  const submit2 = await api(`/api/student/tasks/${task2.json?.task?.id}/submit`, {
    method: 'POST', token: studentToken, body: { externalLink: 'https://example.com/work' },
  });
  const reject = await api(`/api/admin/submissions/${submit2.json?.submission?.id}/reject`, {
    method: 'PUT', token: adminToken, body: { feedback: 'Needs more detail' },
  });
  check('Admin rejects with feedback → 200', reject.status === 200 && reject.json?.submission?.status === 'Rejected', `status ${reject.status}`);

  // Notifications produced by approve/reject
  const notifs = await api('/api/notifications', { token: studentToken });
  check('Notifications received for approval/rejection', (notifs.json?.notifications || []).length >= 2,
    `count=${(notifs.json?.notifications || []).length}`);
  const firstNotif = notifs.json?.notifications?.[0];
  if (firstNotif) {
    const markRead = await api('/api/notifications', { method: 'PATCH', token: studentToken, body: { id: firstNotif.id } });
    check('Mark notification read → 200', markRead.status === 200, `status ${markRead.status}`);
    const del = await api('/api/notifications', { method: 'DELETE', token: studentToken, body: { id: firstNotif.id } });
    check('Delete notification → 200', del.status === 200, `status ${del.status}`);
  }

  // ─────────────────────────────────────────────────────────────
  section('Score, leaderboard, portfolio');
  const score = await api(`/api/student/score?studentId=${studentId}`, { token: studentToken });
  check('Student score endpoint → 200', score.status === 200, `status ${score.status}`);

  const leaderboard = await api('/api/student/leaderboard?branch=All&limit=50', { token: studentToken });
  check('Leaderboard includes ranked student + my rank',
    (leaderboard.json?.leaderboard || []).some((e) => e.id === studentId) && typeof leaderboard.json?.currentUser?.rank === 'number',
    `rank=${leaderboard.json?.currentUser?.rank}`);

  const username = await api('/api/user/username', { method: 'POST', token: studentToken, body: {} });
  check('Username generated', !!username.json?.username, JSON.stringify(username.json).slice(0, 120));
  if (username.json?.username) {
    const portfolio = await api(`/api/student/portfolio/${username.json.username}`);
    check('Public portfolio → 200', portfolio.status === 200, `status ${portfolio.status}`);
  }

  // ─────────────────────────────────────────────────────────────
  section('Company workflow: register → post internship → student applies → hire');
  const companyEmail = `company${RUN}@example.com`;
  const companyReg = await registerUser({
    fullName: 'Smoke HR', email: companyEmail, role: 'company',
    extra: { companyName: `SmokeCorp ${RUN}`, industry: 'SaaS', website: 'https://example.com' },
  });
  check('Company registration → 201 (slug generated)', companyReg.status === 201, `status ${companyReg.status} ${JSON.stringify(companyReg.json).slice(0, 120)}`);
  const companyToken = companyReg.json?.token;

  const internship = await api('/api/company/internships', {
    method: 'POST', token: companyToken,
    body: { title: `Smoke Intern ${RUN}`, description: 'Great internship', degrees: ['B.Tech'], branches: ['CSE'], duration: '3 months', isPaid: true, stipend: '₹10,000/month', deadline },
  });
  check('Company posts internship → 200', internship.status === 200 && !!internship.json?.internship?.id, `status ${internship.status}`);
  const internshipId = internship.json?.internship?.id;

  const publicInternships = await api('/api/internships');
  check('Internship visible publicly', (publicInternships.json?.internships || []).some((i) => i.id === internshipId));

  const apply = await api(`/api/internships/${internshipId}/apply`, { method: 'POST', token: studentToken, body: { coverLetter: 'I am a great fit' } });
  check('Student applies → 201', apply.status === 201, `status ${apply.status}`);
  const applicationId = apply.json?.application?.id;

  const applyAgain = await api(`/api/internships/${internshipId}/apply`, { method: 'POST', token: studentToken, body: {} });
  check('Duplicate application → 409', applyAgain.status === 409, `status ${applyAgain.status}`);

  const myInternships = await api('/api/student/internships', { token: studentToken });
  check('My Internships lists the application', (myInternships.json?.appliedIds || []).includes(internshipId));

  const companyList = await api('/api/company/internships', { token: companyToken });
  const applicantSeen = (companyList.json?.internships || []).some((i) => (i.applicants || []).some((a) => a.id === applicationId));
  check('Company sees the applicant', applicantSeen);

  const talent = await api('/api/company/talent', { token: companyToken });
  check('Company talent pool → 200', talent.status === 200, `status ${talent.status}`);

  const companyAnalytics = await api('/api/company/analytics', { token: companyToken });
  check('Company analytics → 200', companyAnalytics.status === 200, `status ${companyAnalytics.status}`);

  const hire = await api(`/api/company/hire/${studentId}`, { method: 'POST', token: companyToken, body: { applicantId: applicationId } });
  check('Company hires applicant → 200', hire.status === 200, `status ${hire.status} ${JSON.stringify(hire.json).slice(0, 120)}`);

  const myInternshipsAfter = await api('/api/student/internships', { token: studentToken });
  check('Application status now Hired', (myInternshipsAfter.json?.internships || []).some((i) => i.id === internshipId && i.status === 'Hired'));

  // ─────────────────────────────────────────────────────────────
  section('Mentor workflow: register → discover → book session');
  const mentorEmail = `mentor${RUN}@example.com`;
  const mentorReg = await registerUser({
    fullName: 'Smoke Mentor', email: mentorEmail, role: 'mentor',
    extra: { expertise: ['System Design', 'React'], designation: 'Senior Engineer', organization: 'SmokeCorp', experience: '8 years' },
  });
  check('Mentor registration → 201', mentorReg.status === 201, `status ${mentorReg.status}`);

  const mentorship = await api('/api/mentorship', { token: studentToken });
  const mentor = (mentorship.json?.mentors || []).find((m) => m.name === 'Smoke Mentor');
  check('Mentor discoverable via /api/mentorship', !!mentor, `mentors=${(mentorship.json?.mentors || []).length}`);

  if (mentor) {
    const book = await api('/api/mentorship', {
      method: 'POST', token: studentToken,
      body: { mentorId: mentor.id, topic: 'Career planning', date: new Date(Date.now() + 86400000).toISOString().slice(0, 10), time: '10:00', notes: 'First session' },
    });
    check('Student books session → 201', book.status === 201 && !!book.json?.session?.id, `status ${book.status}`);
    const mine = await api('/api/mentorship', { token: studentToken });
    check('Booked session listed for student', (mine.json?.sessions || []).some((s) => s.topic === 'Career planning'));
  }

  // ─────────────────────────────────────────────────────────────
  section('Messaging workflow');
  const mentorLogin = await api('/api/auth/login', { method: 'POST', body: { email: mentorEmail, password: PASSWORD } });
  const mentorToken = mentorLogin.json?.token;
  const mentorUserId = mentorLogin.json?.user?.id;

  const sendMsg = await api('/api/conversations', {
    method: 'POST', token: studentToken, body: { recipientId: mentorUserId, content: 'Hi! Looking forward to our session.' },
  });
  check('Student starts direct conversation → 201', sendMsg.status === 201 && !!sendMsg.json?.conversationId, `status ${sendMsg.status}`);
  const conversationId = sendMsg.json?.conversationId;

  const reply = await api('/api/conversations', {
    method: 'POST', token: mentorToken, body: { conversationId, content: ' Likewise!' },
  });
  check('Mentor replies in same conversation → 201', reply.status === 201, `status ${reply.status}`);

  const thread = await api(`/api/conversations?conversationId=${conversationId}`, { token: studentToken });
  check('Thread contains both messages', (thread.json?.messages || []).length >= 2, `count=${(thread.json?.messages || []).length}`);

  const convoList = await api('/api/conversations', { token: mentorToken });
  check('Conversation listed for mentor', (convoList.json?.conversations || []).some((c) => c.id === conversationId));

  const outsider = await api(`/api/conversations?conversationId=${conversationId}`, { token: companyToken });
  check('Non-participant cannot read thread → 404', outsider.status === 404, `status ${outsider.status}`);

  // ─────────────────────────────────────────────────────────────
  section('Ambassador / referral workflow');
  const ambassador = await api('/api/ambassador', { token: studentToken });
  check('Ambassador data → referral code issued', !!ambassador.json?.stats?.referralCode, `status ${ambassador.status}`);
  const referralCode = ambassador.json?.stats?.referralCode;

  const referredEmail = `referred${RUN}@example.com`;
  const referredReg = await registerUser({ fullName: 'Referred Student', email: referredEmail, extra: { referralCode } });
  check('Referred student registers → 201', referredReg.status === 201, `status ${referredReg.status}`);

  const ambassadorAfter = await api('/api/ambassador', { token: studentToken });
  check('Referral counted for referrer', (ambassadorAfter.json?.stats?.totalReferrals || 0) >= 1,
    `total=${ambassadorAfter.json?.stats?.totalReferrals}`);

  // ─────────────────────────────────────────────────────────────
  section('College workflow');
  const collegeEmail = `college${RUN}@example.com`;
  const collegeReg = await registerUser({
    fullName: 'Smoke College Admin', email: collegeEmail, role: 'college',
    extra: { collegeName: `Smoke Institute ${RUN}`, address: 'Pune', state: 'Maharashtra' },
  });
  check('College registration → 201', collegeReg.status === 201, `status ${collegeReg.status}`);
  const collegeToken = collegeReg.json?.token;

  const collegeAnalytics = await api('/api/college/analytics', { token: collegeToken });
  check('College analytics → 200', collegeAnalytics.status === 200, `status ${collegeAnalytics.status}`);
  const placements = await api('/api/college/placements', { token: collegeToken });
  check('College placements → 200', placements.status === 200, `status ${placements.status}`);

  // ─────────────────────────────────────────────────────────────
  section('Admin analytics, settings, password reset, logout');
  const adminAnalytics = await api('/api/admin/analytics', { token: adminToken });
  check('Admin analytics → 200', adminAnalytics.status === 200, `status ${adminAnalytics.status}`);
  const adminStudents = await api('/api/admin/students', { token: adminToken });
  check('Admin students list → 200', adminStudents.status === 200, `status ${adminStudents.status}`);
  const fraud = await api('/api/fraud', { token: adminToken });
  check('Admin fraud feed → 200', fraud.status === 200, `status ${fraud.status}`);

  const security = await api('/api/settings/security', { token: studentToken });
  check('Security settings → 200', security.status === 200, `status ${security.status}`);
  const sessions = await api('/api/auth/sessions', { token: studentToken });
  check('Active sessions listed', sessions.status === 200 && ((sessions.json?.sessions || []).length >= 1), `status ${sessions.status}`);

  const forgot = await api('/api/auth/forgot-password', { method: 'POST', body: { email: studentEmail } });
  check('Forgot password → 200', forgot.status === 200, `status ${forgot.status}`);
  const bogusReset = await api('/api/auth/reset-password', { method: 'POST', body: { token: 'bogus-token', password: 'Newpass@123' } });
  check('Reset with bogus token rejected', bogusReset.status >= 400 && bogusReset.status < 500, `status ${bogusReset.status}`);

  const logout = await api('/api/auth/logout', { method: 'POST', token: studentToken, body: { refreshToken: studentRefresh } });
  check('Logout → 200', logout.status === 200, `status ${logout.status}`);
  const refreshAfterLogout = await api('/api/auth/refresh-token', { method: 'POST', body: { refreshToken: studentRefresh } });
  check('Refresh after logout → 401', refreshAfterLogout.status === 401, `status ${refreshAfterLogout.status}`);

  // ─────────────────────────────────────────────────────────────
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Smoke test: ${passed} passed, ${failures.length} failed`);
  if (failures.length) {
    console.log('Failed checks:');
    for (const f of failures) console.log(`  - ${f}`);
    process.exit(1);
  }
  console.log('All workflows OK ✅');
}

main().catch((err) => {
  console.error('Smoke test crashed:', err);
  process.exit(1);
});

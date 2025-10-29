import http from 'k6/http';
import { check, sleep } from 'k6';

// Environment-configurable options
const BASE_URL = __ENV.K6_BASE_URL || 'http://localhost:3000';
const VUS = Number(__ENV.K6_VUS || 300);
const DURATION = __ENV.K6_DURATION || '2m';
const TEST_TYPE = __ENV.K6_TYPE || 'load'; // 'load' | 'stress'

export const options =
  TEST_TYPE === 'stress'
    ? {
      scenarios: {
        spike: {
          executor: 'ramping-vus',
          stages: [
            { duration: '30s', target: 0 },
            { duration: '30s', target: VUS }, 
            { duration: '1m', target: VUS * 3 }, 
            { duration: '2m', target: VUS }, 
            { duration: '30s', target: 0 },
          ],
        },
      },
      thresholds: {
        http_req_failed: ['rate<0.05'],
        http_req_duration: ['p(95)<1000', 'p(99)<2000'],
      },
    }
    : {
      scenarios: {
        steady_load: {
          executor: 'constant-vus',
          vus: VUS,
          duration: DURATION,
        },
      },
      thresholds: {
        http_req_failed: ['rate<0.01'],
        http_req_duration: ['p(95)<500', 'p(99)<1000'],
      },
    };

export function setup() {
  const email = 'k6_' + Date.now() + '_' + (__VU || 0) + '@example.com';
  const password = 'P@ssw0rd!';

  // Sign up
  const signUpRes = http.post(
    BASE_URL + '/users/sign-up',
    JSON.stringify({ email: email, password: password, role: 'user' }),
    { headers: { 'Content-Type': 'application/json' }, tags: { name: 'users_sign_up' } },
  );
  check(signUpRes, { 'sign-up 201|200': (r) => [200, 201].indexOf(r.status) !== -1 });

  // Sign in to get JWT
  const signInRes = http.post(
    BASE_URL + '/users/sign-in',
    JSON.stringify({ email: email, password: password }),
    { headers: { 'Content-Type': 'application/json' }, tags: { name: 'users_sign_in' } },
  );
  check(signInRes, { 'sign-in 200': (r) => r.status === 200 && !!r.json('token') });
  const token = signInRes.json('token');

  return { token: token };
}

export default function (data) {
  const authHeaders = {
    headers: { Authorization: 'Bearer ' + data.token, 'Content-Type': 'application/json' },
  };

  // 1) Create before-meeting
  const createBeforeRes = http.post(
    BASE_URL + '/before',
    JSON.stringify({
      name: 'Acme ' + __ITER,
      desc: 'Discovery',
      totalTask: 2,
      completedTask: 0,
      companySize: '11-50',
      picName: 'Alex',
      picRole: ['Owner'],
      notes: 'auto',
      currentSystem: ['Email'],
      systemRequirement: ['Billing'],
      budget: 1000,
      category: ['Sales'],
    }),
    Object.assign({}, authHeaders, { tags: { name: 'before_create' } }),
  );

  check(createBeforeRes, { 'before create 201|200': (r) => [200, 201].indexOf(r.status) !== -1 });

  // 2) List before-meetings and pick one id
  const listBeforeRes = http.get(
    BASE_URL + '/before',
    Object.assign({}, authHeaders, { tags: { name: 'before_list' } }),
  );

  check(listBeforeRes, { 'before list 200': (r) => r.status === 200 });

  const meetings = listBeforeRes.json();
  const beforeId =
    (meetings && meetings[0] && (meetings[0].id || meetings[0]['id'])) || null;

  // 3) Create after-meeting debrief linking beforeId (if available)
  if (beforeId) {
    const createAfterRes = http.post(
      BASE_URL + '/after',
      JSON.stringify({
        beforeMeeting: beforeId,
        sentiment: 'positive',
        status: 'OPEN',
        excitementLevel: 'high',
        promo: 'none',
        decisionMaker: 'Alex',
        activationAgreement: 'agreed',
        expiredDate: new Date().toISOString(),
        products: [],
        totalEmployee: 10,
        discountRate: '0',
        termIn: '12m',
        totalAmount: 1200,
        mrr: 100,
        isFormSubmitted: false,
      }),
      Object.assign({}, authHeaders, { tags: { name: 'after_create' } }),
    );

    check(createAfterRes, { 'after create 201|200': (r) => [200, 201].indexOf(r.status) !== -1 });
  }

  // 4) Fetch kanban grouped data
  const kanbanRes = http.get(
    BASE_URL + '/kanban',
    Object.assign({}, authHeaders, { tags: { name: 'kanban_get' } }),
  );

  check(kanbanRes, { 'kanban 200': (r) => r.status === 200 });

  // 5) Query analytics (public)
  const ana1 = http.get(BASE_URL + '/analytics', { tags: { name: 'analytics_manager' } });
  const ana2 = http.get(BASE_URL + '/analytics/funnel', { tags: { name: 'analytics_funnel' } });
  const ana3 = http.get(BASE_URL + '/analytics/revenue', { tags: { name: 'analytics_revenue' } });

  check(ana1, { 'analytics manager 200': (r) => r.status === 200 });
  check(ana2, { 'analytics funnel 200': (r) => r.status === 200 });
  check(ana3, { 'analytics revenue 200': (r) => r.status === 200 });

  sleep(1);
}

import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.K6_BASE_URL || 'http://localhost:3000';
const VUS = Number(__ENV.K6_VUS || 100);
const DURATION = __ENV.K6_DURATION || '2m';
const TEST_TYPE = (__ENV.K6_TYPE || 'load').toLowerCase();
const SOAK_DURATION = __ENV.K6_SOAK_DURATION || '5m';

const scenarioConfig = () => {
  switch (TEST_TYPE) {
    case 'stress':
      return {
        executor: 'ramping-vus',
        stages: [
          { duration: '30s', target: Math.max(1, Math.round(VUS * 0.25)) },
          { duration: '1m', target: VUS },
          { duration: '1m', target: VUS * 2 },
          { duration: '1m', target: Math.round(VUS * 1.5) },
          { duration: '30s', target: 0 },
        ],
      };
    case 'soak':
      return {
        executor: 'constant-arrival-rate',
        rate: Math.max(1, Math.round(VUS / 2)),
        timeUnit: '1s',
        duration: SOAK_DURATION,
        preAllocatedVUs: VUS,
        maxVUs: VUS * 2,
      };
    case 'load':
    default:
      return {
        executor: 'constant-vus',
        vus: VUS,
        duration: DURATION,
      };
  }
};

export const options = {
  scenarios: {
    api: scenarioConfig(),
  },
  thresholds: {
    http_req_failed: ['rate<0.02'],
    http_req_duration: ['p(95)<800', 'p(99)<1500'],
    checks: ['rate>0.95'],
  },
};

function buildVuSession() {
  const email = `k6_${__VU}_${Date.now()}@example.com`;
  const password = 'P@ssw0rd!';

  const signUpRes = http.post(
    `${BASE_URL}/users/sign-up`,
    JSON.stringify({ email, password, role: 'user' }),
    {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'users_sign_up' },
    },
  );

  // Ignore duplicate errors to allow re-use during long runs
  check(signUpRes, {
    'sign-up success or conflict': (r) =>
      [200, 201, 409].includes(r.status),
  });

  const signInRes = http.post(
    `${BASE_URL}/users/sign-in`,
    JSON.stringify({ email, password }),
    {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'users_sign_in' },
    },
  );

  check(signInRes, {
    'sign-in issued token': (r) => [200, 201].includes(r.status) && !!r.json('token'),
  });

  return {
    token: signInRes.json('token'),
    email,
  };
}

let session;

function getSession() {
  if (!session || !session.token) {
    session = buildVuSession();
  }
  return session;
}

function authHeaders() {
  const current = getSession();
  return {
    headers: {
      Authorization: `Bearer ${current.token}`,
      'Content-Type': 'application/json',
    },
  };
}

function createBeforeMeeting(headers, name) {
  const payload = {
    name,
    desc: 'Performance discovery',
    totalTask: 2,
    completedTask: 0,
    companySize: '11-50',
    picName: 'Casey',
    picRole: ['Owner'],
    notes: 'generated',
    currentSystem: ['Email'],
    systemRequirement: ['Analytics'],
    budget: 5000,
    category: ['Sales'],
    meetingDate: new Date().toISOString(),
  };

  const res = http.post(`${BASE_URL}/before`, JSON.stringify(payload), {
    ...headers,
    tags: { name: 'before_create' },
  });

  check(res, {
    'before create 201/200': (r) => [200, 201].includes(r.status),
  });

  const listRes = http.get(`${BASE_URL}/before`, {
    ...headers,
    tags: { name: 'before_list' },
  });

  check(listRes, {
    'before list returns array': (r) => r.status === 200 && Array.isArray(r.json()),
  });

  const created = (listRes.json() || []).find((item) => item.name === name);
  return created ? created.id : null;
}

function createAfterMeeting(headers, beforeId) {
  const payload = {
    beforeMeeting: String(beforeId),
    sentiment: 'positive',
    status: 'OPEN',
    excitementLevel: 'high',
    promo: 'none',
    decisionMaker: 'Jordan',
    activationAgreement: 'agreed',
    expiredDate: new Date(Date.now() + 86400000).toISOString(),
    products: [
      {
        id: 'p1',
        name: 'Subscription',
        price: 100,
        img: 'https://example.com/img.png',
        productCode: 'SUB-1',
      },
    ],
    totalEmployee: 25,
    totalAmount: 1200,
    mrr: 120,
    discountRate: '0',
    termIn: '12m',
  };

  const res = http.post(`${BASE_URL}/after`, JSON.stringify(payload), {
    ...headers,
    tags: { name: 'after_create' },
  });

  check(res, { 'after create 201/200': (r) => [200, 201].includes(r.status) });
  return res.json('id');
}

function cleanup(headers, beforeId, afterId) {
  if (afterId) {
    http.del(`${BASE_URL}/after/${afterId}`, null, {
      ...headers,
      tags: { name: 'after_delete' },
    });
  }
  if (beforeId) {
    http.del(`${BASE_URL}/before/${beforeId}`, null, {
      ...headers,
      tags: { name: 'before_delete' },
    });
  }
}

export default function () {
  const headers = authHeaders();
  const beforeId = createBeforeMeeting(headers, `Perf Lead ${__VU}-${__ITER}`);

  if (beforeId) {
    const afterId = createAfterMeeting(headers, beforeId);

    const kanbanRes = http.get(`${BASE_URL}/kanban`, {
      ...headers,
      tags: { name: 'kanban_get' },
    });

    check(kanbanRes, {
      'kanban buckets present': (r) =>
        r.status === 200 && r.json() && r.json().QuotationSent !== undefined,
    });

    const refreshRes = http.post(`${BASE_URL}/analytics/refresh`, null, {
      tags: { name: 'analytics_refresh' },
    });
    check(refreshRes, {
      'analytics refresh 200/201': (r) => [200, 201].includes(r.status),
    });

    const funnelRes = http.get(`${BASE_URL}/analytics/funnel`, {
      tags: { name: 'analytics_funnel' },
    });
    check(funnelRes, { 'analytics funnel array': (r) => r.status === 200 });

    cleanup(headers, beforeId, afterId);
  }

  sleep(1);
}

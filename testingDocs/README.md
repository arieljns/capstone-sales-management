# Comprehensive Test Catalog


## Inventory Summary
- Unit tests: 104
- Integration tests: 6
- E2E tests: 1
- Load tests: 1 script (`k6/k6-test.js`)

## Unit Tests (104)

### After Meeting

#### `src/after-meeting/after-meeting.controller.spec.ts` (10 tests)
1. DELETE /after/:id delegates to service
2. GET /after returns 401 when guard does not attach userId
3. GET /after returns meeting data with 200 status code
4. GET /after/:id fetches a single record
5. GET /after/test/data returns join data
6. GET /after/user/data propagates missing user error as 500
7. GET /after/user/data returns list when user id exists
8. PATCH /after/:id proxies data for creation/update
9. POST /after creates a debrief record and returns 201
10. handleRequest bubbles UnauthorizedException as HTTP 401

#### `src/after-meeting/after-meeting.service.spec.ts` (13 tests)
1. createMeetingData throws generic Error when not found
2. createMeetingData updates existing entity
3. createMeetingDebriefRecord throws InternalServerError when beforeMeeting missing
4. creates debrief, saves, and creates kanban ticket
5. deleteAfterMeetingData returns delete result
6. deleteAfterMeetingData wraps errors
7. findAfterMeetingDataById returns entity when found
8. getAllAfterMeetingDataByUser returns list
9. getAllAfterMeetingDataByUser throws UnauthorizedException on error
10. getMeetingDataJoin returns rows
11. getMeetingDataWithJoin returns results via query builder
12. getMeetingDataWithJoin throws UnauthorizedException on query error
13. throws UnauthorizedException when not found by id (wrapped)

### Analytics

#### `src/analytics/analytics.controller.spec.ts` (7 tests)
1. delegates salesman analytics with and without id
2. refreshes materialized views on demand
3. requests funnel data from service
4. requests revenue trend
5. retrieves aggregated team metrics
6. returns manager analytics from service
7. should be defined

#### `src/analytics/analytics.service.spec.ts` (11 tests)
1. applies filtering when user UUID is provided
2. getManagerAnalytics proxies select to datasource
3. getRevenueTrend proxies view query
4. getSalesFunnel proxies view query
5. getUserAnalytics queries mv_user_analytics
6. issues refresh statements for every materialized view
7. logs error when initialization throws
8. maps query results into MemberMetricDto objects
9. passes salesman identifier to query parameters
10. queries all salesmen when no identifier provided
11. reads sql files, executes them, and logs success

### App

#### `src/app.controller.spec.ts` (1 tests)
1. should return "Hello World!"

### Auth

#### `src/auth/auth.controller.spec.ts` (1 tests)
1. smoke test

#### `src/auth/auth.service.spec.ts` (3 tests)
1. maps user metadata into the response body
2. should be defined
3. signs the JWT payload with user identifiers

#### `src/auth/guards/roles.guards.spec.ts` (3 tests)
1. allows execution when no roles metadata defined
2. returns false when user role does not match requirements
3. validates user role against required metadata

#### `src/auth/strategy/jwt-auth.strategy.spec.ts` (2 tests)
1. returns a shaped user object from payload
2. throws UnauthorizedException when payload missing

#### `src/auth/strategy/local-auth.strategy.spec.ts` (2 tests)
1. returns user when validation succeeds
2. throws UnauthorizedException when service returns null

### Before Meeting

#### `src/before-meeting/before-meeting.controller.spec.ts` (8 tests)
1. DELETE /before/:id removes meeting
2. GET /before lists meetings for authenticated user (status 200)
3. GET /before/:id fetches meeting by id
4. PATCH /before/:id/move-stage updates stage and returns 200
5. POST /before creates meeting payload when userId exists
6. POST /before fails with 500 when userId missing
7. POST /before/csv forwards payload array to service
8. PUT /before/:id updates meeting

#### `src/before-meeting/before-meeting.service.spec.ts` (11 tests)
1. creates one meeting from DTO and returns insert result
2. flattens array payloads and returns failed response on exception
3. moves meeting stage to true and saves
4. returns meeting when found
5. returns meetings filtered by userId
6. returns success payload when deletion succeeds
7. throws wrapped error when entity not found
8. throws wrapped error when repository fails
9. throws wrapped error when repository rejects
10. updates meeting and returns refreshed entity
11. wraps errors when meeting is missing

### Form Builder

#### `src/form-builder/form-builder.service.spec.ts` (2 tests)
1. returns form data by id
2. throws when not found

### Kanban Ticket

#### `src/kanban-ticket/kanban-ticket.controller.spec.ts` (5 tests)
1. GET /kanban returns grouped tickets with status 200
2. GET /kanban throws 401 when guard strips user id
3. PATCH /kanban returns 500 when guard fails to attach user id
4. PATCH /kanban updates funnel position and returns 200
5. propagates errors thrown from RolesGuard as authorization failures

#### `src/kanban-ticket/kanban-ticket.service.spec.ts` (5 tests)
1. creates a Kanban ticket with default stage and deal value
2. groups tickets per stage when querying kanban data
3. throws NotFoundException when updateFunnelPosition cannot find ticket
4. throws when createKanbanTicket cannot find linked records
5. updates funnel position and saves ticket

### Users

#### `src/users/users.controller.spec.ts` (9 tests)
1. DELETE /users/delete/:id delegates to service and returns message
2. GET /users/lists proxies to getUserProfile
3. GET /users/profile returns profile data
4. GET /users/whoami responds 401 when JwtAuthGuard throws
5. GET /users/whoami returns current user payload
6. POST /users/sign-in returns auth payload with 201
7. POST /users/sign-up creates a new user (201)
8. POST /users/sign-up/member enforces roles guard and returns 201
9. returns 403 when RolesGuard denies access to register member

#### `src/users/users.service.spec.ts` (11 tests)
1. hashes password and persists member
2. hashes password then saves user
3. lists profiles via repository
4. removes the user when no associations exist
5. retrieves user by email
6. throws BadRequestException when user has associated records
7. throws NotFoundException when user does not exist
8. throws UnauthorizedException when email is unknown
9. throws UnauthorizedException when password mismatch
10. throws when mandatory fields missing
11. validates user credentials successfully

## Integration Tests (6)

### After Kanban

#### `test/integration/after-kanban.integration-spec.ts` (1 tests)
1. creates after-meeting debrief and kanban ticket, updates funnel, lists grouped tickets

### Analytics

#### `test/integration/analytics.integration-spec.ts` (1 tests)
1. initializes views and returns queryable data

### Auth Users

#### `test/integration/auth-users.integration-spec.ts` (2 tests)
1. creates a user and logs in to issue JWT
2. rejects login when password does not match

### Before Meeting

#### `test/integration/before-meeting.integration-spec.ts` (1 tests)
1. creates, reads, updates, moves stage, and deletes meeting

### Form Builder

#### `test/integration/form-builder.integration-spec.ts` (1 tests)
1. fetches form data for an existing after-meeting

## End-to-End Tests (1)

### App Workflow

#### `test/app.e2e-spec.ts` (1 tests)
1. registers, authenticates, and runs before/after/kanban/analytics flow

## Load Testing

- See `k6/k6-test.js` for scenarios targeting users, before/after meetings, kanban, and analytics refresh/funnel endpoints. Configure via `K6_BASE_URL`, `K6_VUS`, `K6_DURATION`, `K6_TYPE`, and `K6_SOAK_DURATION`.
- Each VU signs up (or reuses) a user, signs in once per session, creates before- and after-meeting records, inspects kanban columns, refreshes analytics materialized views, and finally cleans up created records.
- Scenario presets: `K6_TYPE=load` keeps a constant number of virtual users, `K6_TYPE=stress` ramps VUs up/down to probe limits, and `K6_TYPE=soak` sustains a constant arrival rate for the provided duration.
- Example: `K6_BASE_URL=http://localhost:3000 K6_VUS=25 K6_DURATION=2m K6_TYPE=stress k6 run k6/k6-test.js`.

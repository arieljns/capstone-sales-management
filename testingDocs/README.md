# API Endpoint Documentation – Sales Dashboard

This document lists every available HTTP endpoint in the Sales Dashboard NestJS application, grouped by module and annotated with authentication requirements derived from the guards declared on each controller method. Bearer token denotes routes protected by JwtAuthGuard (often paired with RolesGuard), while - indicates no JWT protection.

## Module Index
1. AppModule
2. AfterMeetingModule
3. AnalyticsModule
4. BeforeMeetingModule
5. FormBuilderModule
6. KanbanTicketModule
7. AirtableModule
8. UsersModule

### AppModule
**Controller:** AppController

| Nama API | Metode | Autentikasi | Endpoint |
|----------|--------|-------------|----------|
| getHello | **GET** | - | / |

### AfterMeetingModule
**Controller:** AfterMeetingController

| Nama API | Metode | Autentikasi | Endpoint |
|----------|--------|-------------|----------|
| handleRequest | **GET** | Bearer token | /after |
| postAfterMeetingData | **GET** | - | /after/:id |
| deleteAfterMeetingData | **DELETE** | Bearer token | /after/:id |
| createValidation | **POST** | Bearer token | /after |
| createAfterMeetingData | **PATCH** | - | /after/:id |
| getMeetingDataJoin | **GET** | - | /after/test/data |
| getAllAfterMeetingDataByUser | **GET** | Bearer token | /after/user/data |

### AnalyticsModule
**Controller:** AnalyticsController

| Nama API | Metode | Autentikasi | Endpoint |
|----------|--------|-------------|----------|
| getManagerAnalytics | **GET** | - | /analytics |
| getSalesFunnel | **GET** | - | /analytics/funnel |
| getUserAnalytics | **GET** | Bearer token | /analytics/user |
| getRevenueTrend | **GET** | - | /analytics/revenue |
| getAllSalesmanAnalytics | **GET** | - | /analytics/salesmen |
| getSalesmanAnalytics | **GET** | - | /analytics/salesmen/:id |
| getTeamMetrics | **GET** | - | /analytics/team-metrics |
| getTeamMember | **GET** | - | /analytics/team-metrics/:userId |
| refreshMaterializedViews | **POST** | - | /analytics/refresh |

### BeforeMeetingModule
**Controller:** BeforeMeetingController

| Nama API | Metode | Autentikasi | Endpoint |
|----------|--------|-------------|----------|
| getMeetings | **GET** | Bearer token | /before |
| getMeetingById | **GET** | Bearer token | /before/:id |
| moveMeetingStage | **PATCH** | Bearer token | /before/:id/move-stage |
| inputHandler | **POST** | Bearer token | /before |
| csvHandler | **POST** | Bearer token | /before/csv |
| updateHandler | **PUT** | Bearer token | /before/:id |
| deleteHandler | **DELETE** | Bearer token | /before/:id |

### FormBuilderModule
**Controller:** FormBuilderController

| Nama API | Metode | Autentikasi | Endpoint |
|----------|--------|-------------|----------|
| getFormData | **GET** | - | /form/:id |

### KanbanTicketModule
**Controller:** KanbanTicketController

| Nama API | Metode | Autentikasi | Endpoint |
|----------|--------|-------------|----------|
| getKanbanTicketsData | **GET** | Bearer token | /kanban |
| updateTicketFunnel | **PATCH** | Bearer token | /kanban |

### AirtableModule
**Controller:** AirtableController

| Nama API | Metode | Autentikasi | Endpoint |
|----------|--------|-------------|----------|
| testConnection | **GET** | - | /airtable/test |
| syncSingleMeeting | **POST** | - | /airtable/meetings/:meetingId |

### UsersModule
**Controller:** UsersController

LocalAuthGuard protects Login, while other Bearer-protected routes use JwtAuthGuard with RolesGuard.

| Nama API | Metode | Autentikasi | Endpoint |
|----------|--------|-------------|----------|
| register | **POST** | - | /users/sign-up |
| Login | **POST** | - | /users/sign-in |
| registerMember | **POST** | Bearer token | /users/sign-up/member |
| getProfileData | **GET** | - | /users/profile |
| whoAmI | **GET** | Bearer token | /users/whoami |
| getAllUsers | **GET** | - | /users/lists |
| deleteUser | **DELETE** | - | /users/delete/:id |

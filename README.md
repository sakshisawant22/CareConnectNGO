# CareConnectNGO


CareConnect NGO — Full-Stack Web Project Project: Children's Education, Support & NGO Management System Stack: React.js + Java Spring Boot + PostgreSQL Scope: College / portfolio project, designed around a realistic NGO workflow. The goal is to build a platform that helps a children's education NGO manage educational programs, volunteers, donations, supplies, and expenses while giving the public a transparent way to support its work. The key design decision is to build one application with two separate experiences:

Public portal: Visitors learn about the NGO, explore educational programs, donate, register as volunteers, and view impact reports.
Secure staff portal: Authorized NGO staff manage programs, attendance, inventory, donations, expenses, and reports. Children should not need public accounts, and their personal information must never be exposed through public pages or APIs.
Project overview
11

The problem you're solving Many small NGOs coordinate their work through spreadsheets, paper registers, messaging apps, and disconnected donation records. CareConnect brings the most important workflows together. Problem Your solution Donors don't know what is needed Public needs and donation campaigns Supplies run out unexpectedly Inventory management and low-stock alerts Volunteer schedules are difficult to coordinate Volunteer applications and event scheduling Expenses and donations are tracked separately Financial ledger and reconciliation Impact is difficult to communicate Public dashboard with verified aggregate statistics Student attendance and learning progress are paper-based Restricted education program records For your portfolio, use synthetic data and fictional children. The application can demonstrate realistic workflows without storing real children's records. 2. Functional modules Build these modules in priority order. The first six form your core MVP; the rest add polish and portfolio value.

Module 1 — Public NGO website Must have Pages: Home, About Us, Programs, Current Needs, Donate, Volunteer, Impact, Contact. Display the NGO's mission, education initiatives, fundraising campaigns, and aggregate impact statistics.

Module 2 — Authentication and roles Must have Staff login, secure sessions or tokens, role-based access, logout, and account activation/deactivation. Roles: ADMIN, EDUCATOR, VOLUNTEER_COORDINATOR, FINANCE_STAFF.

Module 3 — Education program management Must have Create programs, courses, workshops, sessions, schedules, and learning materials. Record attendance using synthetic student identifiers and calculate aggregate attendance rates.

Module 4 — Inventory management Must have Track stationery, books, uniforms, and other supplies. Record stock received, distributed, and adjusted. Trigger low-stock alerts and maintain a transaction history.

Module 5 — Donations and expenses Must have Record donation pledges, received donations, payment references, expenses, and supporting documents. Show campaign progress and a reconciled financial summary.

Module 6 — Volunteer management Must have Accept applications, approve or reject applicants, schedule activities, record participation, and manage volunteer availability. Keep vetting records private.

Module 7 — Impact dashboard Visualize program attendance, sessions conducted, supplies distributed, volunteer hours, donation totals, and expenses using aggregate data.

Module 8 — Audit and reporting Maintain a record of sensitive administrative actions, export permitted reports, and generate monthly program and financial summaries.

System architecture Use a standard three-tier architecture. You don't need microservices for a college project: a modular Spring Boot monolith is easier to build, test, deploy, and explain in interviews. React.js frontend Public portal · Staff dashboard · Protected routes · Recharts
Spring Boot REST API Controllers · Services · Repositories · DTO validation

Spring Security · Role-based authorization · Audit logging

PostgreSQL Programs · Sessions · Inventory · Donations · Expenses · Volunteers

External integrations Payment gateway

Email notifications

Recommended backend dependencies Use Spring Initializr to generate the project with:

Spring Web
Spring Data JPA
Spring Security
Bean Validation
PostgreSQL Driver
Flyway for database migrations
Spring Boot Actuator
Spring Boot Test Use Maven, a Java LTS release supported by your chosen Spring Boot version, and a compatible Node.js LTS release. Suggested package structure com.careconnect ├── config ├── security ├── auth ├── user ├── program ├── session ├── attendance ├── inventory ├── donation ├── expense ├── volunteer ├── dashboard ├── audit └── common
Each business module should contain its own controller, service, repository, DTOs, and entity classes as appropriate. Keep business logic in services, not in controllers. 4. Database schema Use PostgreSQL with UUID primary keys, foreign keys, timestamps, and appropriate database constraints. The schema below focuses on operational records and avoids unnecessary sensitive information about children. Core entity relationships users Staff accounts and roles

programs Education initiatives

sessions → attendance_records Classes and participation

inventory_items Current stock

stock_transactions Stock movements

campaigns Public fundraising

donations Payment records

expenses NGO expenditure

volunteers Applications and approval

Table definitions Table Important columns Purpose users id, email, password_hash, role, active Staff authentication programs id, name, description, status Education programs sessions id, program_id, start_time, end_time Scheduled classes attendance_records id, session_id, student_ref, status Pseudonymous attendance inventory_items id, name, quantity, reorder_level Current stock stock_transactions id, item_id, quantity_delta, reason, created_by Stock history campaigns id, title, goal_amount, status Fundraising campaigns donations id, campaign_id, amount, status, payment_reference Donation records expenses id, category, amount, expense_date, created_by Expenditure records volunteers id, name, email, application_status Volunteer applications volunteer_assignments id, volunteer_id, activity_date, status Volunteer schedules audit_logs id, actor_id, action, entity_type, created_at Accountability Use NUMERIC(12,2) for money, not floating-point types. Use TIMESTAMPTZ for timestamps and store times consistently in UTC. A few important relationships:

sessions.program_id references programs.id.
attendance_records.session_id references sessions.id.
stock_transactions.item_id references inventory_items.id.
donations.campaign_id references campaigns.id.
volunteer_assignments.volunteer_id references volunteers.id. For a real deployment, attendance records should reference an internally managed student record rather than a name or date of birth. For your portfolio, use synthetic student_ref values and ensure the public API cannot resolve them to real identities. Example SQL for the inventory module CREATE TABLE inventory_items ( id UUID PRIMARY KEY, name VARCHAR(120) NOT NULL, quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0), reorder_level INTEGER NOT NULL DEFAULT 5 CHECK (reorder_level >= 0), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW() );
CREATE TABLE stock_transactions ( id UUID PRIMARY KEY, item_id UUID NOT NULL REFERENCES inventory_items(id), quantity_delta INTEGER NOT NULL CHECK (quantity_delta <> 0), reason VARCHAR(200) NOT NULL, created_by UUID NOT NULL REFERENCES users(id), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW() );

For stock changes, update the inventory quantity and insert its transaction in a single database transaction. Validate the resulting quantity under concurrent updates so two staff members cannot accidentally distribute more stock than exists. For financial records, similarly use a consistent transaction strategy and avoid deleting confirmed transactions. Use reversals or adjustments to correct mistakes. 5. REST API design Use versioned endpoints under /api/v1. Keep request and response DTOs separate from JPA entities. Method Endpoint Access Purpose GET /api/v1/programs Public List published programs GET /api/v1/campaigns Public Show active campaigns GET /api/v1/impact Public Aggregate impact statistics POST /api/v1/auth/login Public Staff login GET /api/v1/admin/dashboard Staff Private dashboard POST /api/v1/admin/programs Admin, educator Create a program POST /api/v1/admin/sessions Admin, educator Schedule a class POST /api/v1/admin/attendance Authorized staff Record attendance GET /api/v1/admin/inventory Authorized staff View inventory POST /api/v1/admin/inventory/{id}/transactions Authorized staff Receive or distribute stock POST /api/v1/volunteer-applications Public Submit a volunteer application GET /api/v1/admin/volunteers Coordinator, admin Review applications POST /api/v1/admin/campaigns Admin Create a campaign POST /api/v1/admin/donations Finance staff, admin Record a verified donation POST /api/v1/admin/expenses Finance staff, admin Record an expense Additional endpoints can support campaign payment initiation, payment webhooks, report downloads, and stock history. Important: Hiding a button in React does not protect an endpoint. Every protected backend operation must independently verify the user's identity, role, and permission to access the relevant record. Example Spring Boot implementation Here is a small example of the inventory API pattern. @RestController @RequestMapping("/api/v1/admin/inventory") @RequiredArgsConstructor public class InventoryController {

private final InventoryService inventoryService;

@GetMapping
@PreAuthorize("hasAnyRole('ADMIN', 'EDUCATOR')")
public List<InventoryItemDto> getInventory() {
    return inventoryService.getInventory();
}
}

Enable method-level authorization with @EnableMethodSecurity in your security configuration. The service should query the repository and map entities to DTOs. Do not return JPA entities directly, because that can unintentionally expose internal fields or relationships. 6. React frontend design Use React Router for navigation and organize your application into public and protected sections. PUBLIC PAGES Home Mission and impact

Programs Education initiatives

Donate Campaigns and giving

Volunteer Apply to participate

PROTECTED STAFF PAGES Dashboard KPIs and alerts

Inventory Stock and history

Education Programs and attendance

Finance Donations and expenses

Suggested frontend structure src/ ├── api/ │ ├── client.js │ ├── programs.js │ ├── inventory.js │ └── donations.js ├── components/ │ ├── Navbar.jsx │ ├── Sidebar.jsx │ ├── DataTable.jsx │ └── ProtectedRoute.jsx ├── layouts/ │ ├── PublicLayout.jsx │ └── AdminLayout.jsx ├── pages/ │ ├── Home.jsx │ ├── Programs.jsx │ ├── Donate.jsx │ ├── Volunteer.jsx │ └── admin/ ├── hooks/ ├── utils/ └── App.jsx

Use a consistent component library or simple CSS design system. Add loading states, empty states, validation messages, pagination, and accessible form labels. 7. Child privacy and safety Treat privacy as a core engineering requirement, not a feature to add at the end. Data minimization Store only information needed for the workflow. Do not collect children's personal information just to make the project appear realistic.

Role-based access Educators can manage assigned classes; finance staff can access financial records; volunteer coordinators can review applications. Administrative access should be limited and audited.

Public/private data separation Public APIs return published program details and aggregate metrics only. They never expose attendance records, child identities, volunteer screening details, or private financial information.

Secure payment handling Use a hosted payment gateway. Never store card numbers, CVVs, or payment credentials. Verify payment webhooks using the provider's signature verification and reconcile payments against trusted provider records.

Auditability Record important administrative actions, including stock changes, financial corrections, permission changes, and sensitive record access where appropriate. Never log passwords, access tokens, or payment secrets.

Also implement:

Strong password hashing, login rate limiting, and secure session/token handling.
Server-side validation, parameterized database access, and protection against SQL injection, XSS, and CSRF where applicable.
HTTPS in deployment, restricted CORS, secure secrets management, and dependency updates.
Data retention and deletion rules, secure backups, and a documented incident response process.
Consent and authorization procedures for any real-world photographs or stories. Do not use identifiable children's photos in the portfolio demo. For a project operating in India, review applicable child-protection requirements and the Digital Personal Data Protection framework, including rules in force at the time of deployment. A real deployment should be reviewed with the NGO and an appropriate legal or child-safeguarding professional.
Development roadmap A practical schedule is approximately 4–6 weeks if you work consistently and keep the first release focused. Week 1
Foundation

Create the React and Spring Boot projects.
Configure PostgreSQL and Flyway migrations.
Design the schema and repository structure.
Build the public website skeleton.
Week 2

Backend and security

Implement entities, repositories, services, and DTOs.
Add authentication and role-based authorization.
Build education program and session APIs.
Write service and controller tests.
Week 3

Core operations

Implement inventory and stock transactions.
Add volunteer registration and review.
Build the corresponding React forms and tables.
Add validation and error handling.
Week 4

Donations and reporting

Add campaigns and donation records.
Implement expenses and aggregate dashboards.
Integrate a payment gateway in test mode if time permits.
Test permissions and financial calculations.
Weeks 5–6

Deployment and portfolio

Dockerize frontend, backend, and database.
Add GitHub Actions for automated testing.
Deploy a demo using synthetic data.
Create architecture diagrams, screenshots, API documentation, and a README.
Testing strategy Make sure your project demonstrates that it works correctly—not merely that its pages render. Test Example Unit tests Stock cannot become negative API integration tests Creating a program saves it correctly Authorization tests Finance staff cannot access restricted attendance data Payment tests Invalid webhook signatures are rejected Transaction tests Stock quantity and stock history update atomically Privacy tests Public APIs never return private student records Frontend tests Forms show validation errors and loading states End-to-end tests Staff logs in, creates a program, and views it in the dashboard Use JUnit 5 and Mockito for Java unit tests, Spring Boot Test for integration tests, and React Testing Library for frontend tests.
Deployment and DevOps Since this is also a portfolio project, demonstrate a repeatable deployment workflow. GitHub repository Feature branches and pull requests
GitHub Actions Build · Test · Dependency checks

Docker images React frontend and Spring Boot backend

Deployment environment HTTPS · Environment secrets · Managed PostgreSQL

For local development, Docker Compose can run the frontend, backend, and PostgreSQL together. For a public demo, use a hosting provider that supports your application containers and PostgreSQL. Never commit .env files, database passwords, payment secrets, or real NGO records to GitHub. Useful additional deliverables:

Swagger/OpenAPI documentation for the REST APIs.
An ER diagram for the database.
A system architecture diagram.
Seed scripts for sample users, programs, inventory, and donations.
A CI pipeline that runs tests before deployment.
A clear demo account setup with synthetic data.
How to make the project stand out Build the following three features particularly well:
A. A useful NGO dashboard Show donation totals, expenses, low-stock alerts, upcoming classes, and volunteer activity in one place. Derive every figure from database records instead of hardcoding dashboard numbers.

B. Reliable inventory transactions Implement transactional stock movements, concurrent-update protection, and an auditable history. This demonstrates real backend engineering beyond basic CRUD.

C. Transparent public impact reports Let visitors see verified aggregate donations, program sessions, volunteer hours, and supplies distributed without disclosing private data.

Final MVP checklist Use this to track your progress. Project progress 0/15
Foundation [ ] React and Spring Boot projects created [ ] PostgreSQL schema and migrations working [ ] Public website pages implemented

Core functionality [ ] Staff authentication and role-based permissions [ ] Education programs and sessions [ ] Inventory with transaction history [ ] Volunteer applications and approval [ ] Donations and expenses [ ] Impact dashboard

Quality and deployment [ ] Unit and integration tests passing [ ] Public/private data access tested [ ] Docker Compose environment working [ ] GitHub Actions CI pipeline working [ ] Demo deployed with synthetic data [ ] README, ER diagram, and API documentation

Copy checklist My recommendation Start with authentication, education programs, inventory, volunteer applications, and the public impact dashboard. Add donation payment integration after those workflows work reliably. Keep the architecture as a modular monolith, use Java and Spring Boot for the backend, and avoid adding AI or microservices just for complexity. The strength of this project is that it solves a real operational problem, protects children, and demonstrates full-stack engineering. The best next step is to define the database migrations and Spring Boot entities, then implement the first complete workflow—creating an education program in the staff dashboard and displaying its published details on the public website.

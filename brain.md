I have an existing **Job & Internship Portal** project with:

* Frontend: React + Vite
* Backend: Django/Django REST Framework
* Database: SQLite for development
* Existing folders: `frontend` and `backend`
* Existing pages include Home, Login, Register, Dashboard, Profile, Company Profile, Jobs, Job Details, Post Job, Applications, Saved Jobs, Employer Applications, Notifications and Interviews.

Your task is to convert the entire existing project into a **fully dynamic, database-backed and functional Job & Internship Portal**.

## Important Working Rules

1. First inspect the complete frontend and backend.
2. Use the existing project structure, design and working code.
3. Do not rebuild the project unnecessarily.
4. Do not remove existing working features.
5. Do not only audit or describe problems—implement and fix them.
6. Replace every placeholder page, mock object, hard-coded list and fake counter with real backend data.
7. Do not use `localStorage` as the main database for jobs, applications, profiles or saved jobs.
8. Reuse existing models, serializers, APIs and components where possible.
9. Fix incomplete or incorrectly connected frontend and backend features.
10. Make reasonable decisions without repeatedly asking questions.
11. Do not delete the existing database, user data or Git history.
12. Do not push to GitHub unless I specifically ask.
13. Continue until the acceptance checklist is completed.

## 1. User Roles and Authentication

Implement three roles:

* Job Seeker/Student
* Employer/Company
* Administrator

Make the following features functional:

* Role-based registration
* Login and logout
* Authentication persistence after page refresh
* Protected frontend routes
* Backend API permissions
* Edit profile
* Change password
* Forgot/reset password using Django’s development email backend if a real email service is not configured
* Friendly validation and authentication error messages

Keep the project’s existing authentication method. Do not mix different authentication systems unnecessarily.

## 2. Student/Job-Seeker Profile

Create a complete dynamic profile containing:

* Full name
* Profile photo
* Email
* Phone number
* Address/location
* Professional title
* Biography
* Education
* Work experience
* Skills
* Preferred job category
* Preferred work type
* LinkedIn, GitHub and portfolio links
* Resume/CV upload
* Profile completion percentage

Allow users to view and update their information. Validate uploaded resume and image types and sizes.

## 3. Employer and Company Profile

Create a dynamic company profile containing:

* Company name
* Logo
* Cover image if supported by the design
* Industry
* Company size
* Description
* Website
* Email and phone
* Location
* Founded year
* Social links
* Verification status

An employer must only be allowed to edit their own company and job posts.

## 4. Job and Internship Management

Employers must be able to:

* Create a job or internship
* Save it as draft
* Publish it
* Edit it
* Close or reopen it
* Delete it with confirmation
* View all jobs posted by their company
* View applicant counts for each job

Each listing should support:

* Job title
* Job or internship classification
* Category
* Company
* Description
* Responsibilities
* Requirements
* Required skills
* Experience level
* Education level
* Employment type
* Work mode: onsite, remote or hybrid
* Location
* Number of vacancies
* Salary minimum and maximum
* Salary currency
* Salary visibility
* Application deadline
* Created date
* Published date
* Status: draft, published, closed or expired
* Featured status if already supported

Automatically treat a job as unavailable when it is closed or its deadline has passed.

## 5. Job Browsing and Search

Connect the Jobs page to the backend and provide:

* Keyword search
* Search by job title, company and skills
* Category filter
* Location filter
* Job/internship filter
* Employment-type filter
* Work-mode filter
* Experience-level filter
* Salary filter when applicable
* Latest/oldest sorting
* Pagination
* Clear-filter button
* Proper loading, empty and error states

The Job Details page must display complete database information, related jobs, company information, application deadline and application status.

## 6. Saved Jobs

Job seekers must be able to:

* Save a job
* Remove a saved job
* View all saved jobs
* See the correct saved state after refreshing
* Prevent duplicate saved records

Saved jobs must belong to the logged-in user and be stored in the database.

## 7. Job Application System

A job seeker must be able to:

* Apply from the Job Details page
* Select an existing profile resume or upload a new resume
* Add a cover letter
* Review information before submitting
* View submitted applications
* View application details and current status
* Withdraw an application when allowed
* Prevent duplicate applications to the same job

Do not allow applications when:

* The job is closed
* The deadline has passed
* The user is not a job seeker
* The same user has already applied

Use application statuses such as:

* Applied
* Under review
* Shortlisted
* Rejected
* Interview scheduled
* Hired
* Withdrawn

## 8. Employer Application Management

Employers must be able to:

* View applications only for their own job posts
* Filter applicants by job and status
* View applicant profiles
* View or download resumes
* Read cover letters
* Update application status
* Add private employer notes
* Shortlist or reject candidates
* Schedule an interview

Display dynamic applicant and status counts on the employer dashboard.

## 9. Interview Management

Implement a working interview system with:

* Related application
* Interview date and time
* Interview mode: online, onsite or phone
* Meeting link or physical location
* Employer instructions
* Interview status: scheduled, completed, cancelled or rescheduled
* Notes
* Time-zone-safe date handling

Students should only see their interviews. Employers should only manage interviews related to their own jobs.

## 10. Notification System

Create database-backed notifications for:

* Successful application submission
* Application status changes
* Interview scheduled
* Interview rescheduled or cancelled
* Job deadline reminders if already supported
* Important administrator actions

Add:

* Unread notification count
* Mark one notification as read
* Mark all as read
* Link notifications to the related job, application or interview
* Persistent notification history

Real-time WebSocket functionality is not required unless it already exists. Normal API-based notifications are acceptable.

## 11. Dynamic Dashboards

### Job-Seeker Dashboard

Show real data for:

* Total applications
* Saved jobs
* Shortlisted applications
* Upcoming interviews
* Recommended or recent jobs
* Recent application activity
* Profile completion

### Employer Dashboard

Show real data for:

* Total posted jobs
* Active jobs
* Closed jobs
* Total applicants
* Shortlisted applicants
* Upcoming interviews
* Recent applications

### Administrator Dashboard

Implement either a frontend admin dashboard or properly configure Django Admin for:

* Users
* Student profiles
* Company profiles
* Jobs and internships
* Applications
* Interviews
* Notifications
* Contact messages
* Categories and skills

Allow administrators to activate/deactivate users, moderate jobs and verify companies.

## 12. General Website Content

Make all visible navigation links and buttons work.

Complete applicable pages such as:

* About
* Contact
* FAQ
* Privacy Policy
* Terms and Conditions
* 404 Not Found
* Unauthorized Access

The Contact form must validate input and store messages in the backend so administrators can review them.

The Home page must use dynamic information for:

* Featured jobs
* Recent jobs
* Job categories
* Companies
* Total job, company and candidate counts

Do not display fake statistics.

## 13. Backend Requirements

Review and complete:

* Models
* Migrations
* Serializers
* Views/viewsets
* URLs
* Filters
* Pagination
* Permissions
* File uploads
* Django Admin
* CORS and CSRF configuration
* Environment variables
* Validation
* Error responses

Add database constraints for important rules, including:

* One application per user per job
* One saved-job record per user per job
* Proper ownership relationships

Use server-side permission checks. Hiding a frontend button is not sufficient security.

## 14. Frontend Requirements

Review all current routes and components in `App.jsx`.

* Replace every `PlaceholderPage` route with a real page.
* Connect pages through a centralized API service.
* Use `VITE_API_BASE_URL` or the project’s existing environment configuration.
* Add loading indicators or skeletons.
* Add empty states.
* Add success and error notifications.
* Add form validation.
* Add confirmation before destructive actions.
* Handle 401, 403, 404 and server errors properly.
* Make the interface responsive on mobile, tablet and desktop.
* Preserve the existing design language.
* Remove broken links and inactive buttons.
* Ensure direct route access and page refresh work.
* Avoid unnecessary new dependencies.

## 15. Security and Data Validation

Ensure that:

* Users cannot access another user’s private data.
* Employers cannot edit another company’s jobs.
* Students cannot access employer-only pages.
* Employers cannot apply for jobs.
* File uploads accept only allowed formats and sizes.
* Passwords and secrets are never hard-coded.
* `.env.example` contains only safe example values.
* User input is validated on both frontend and backend.
* API endpoints enforce role and object-level permissions.

## 16. Demo Data

Create a safe development seed command or fixture containing:

* At least two student accounts
* At least two employers
* Two company profiles
* Several categories and skills
* At least eight jobs/internships
* Example applications
* Saved jobs
* Notifications
* Interviews

Do not automatically overwrite existing data. Document how to load the demo data.

## 17. Testing and Verification

Add or update backend tests for:

* Authentication
* Role permissions
* Job ownership
* Job creation and editing
* Duplicate application prevention
* Closed/expired job application prevention
* Saved jobs
* Application status changes
* Interview access
* Notifications

Run and fix:

* Django system check
* Django migrations
* Backend tests
* Frontend lint if configured
* Frontend production build

Also perform a complete workflow test:

1. Register/login as an employer.
2. Complete the company profile.
3. Create and publish a job.
4. Register/login as a job seeker.
5. Complete the student profile.
6. Search and view the job.
7. Save the job.
8. Apply with a resume and cover letter.
9. Log in as the employer.
10. Review and shortlist the applicant.
11. Schedule an interview.
12. Log in as the student.
13. Confirm that the status, notification and interview appear correctly.
14. Confirm that data remains after refreshing the browser.

Fix all errors found during this workflow.

## 18. Documentation and Final Report

Update `README.md` with:

* Project overview
* Features
* Technology stack
* Installation instructions
* Backend setup
* Frontend setup
* Environment variables
* Migration commands
* Demo-data command
* Test commands
* How to create an administrator
* API endpoint summary
* Demo account details, only if they are safe development accounts

At completion, provide:

* A concise list of implemented features
* Important files changed
* Migrations created
* Commands executed
* Test/build results
* Demo login details
* Any genuine limitation that still remains

Do not declare completion if important routes are placeholders, buttons do nothing, data is hard-coded, tests fail or the frontend cannot build.

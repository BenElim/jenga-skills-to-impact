# Jenga Skills To Impact

PROJECT: JENGALINK



Community Projects, Verified Experience & Professional Networking Platform



Act as a senior full-stack software engineer, UI/UX designer, product architect and AI application developer.



Build a complete, modern, responsive web application called JengaLink.



1. PROJECT VISION



JengaLink is a community-driven digital platform that connects young people, volunteers, skilled individuals, NGOs, community-based organizations and employers through meaningful community projects.



The platform addresses the problem of young people lacking practical work experience, professional networks, mentorship and credible references.



JengaLink enables users to participate in real community projects, demonstrate their abilities, receive verified experience records and build professional networks.



The application must be suitable for presentation at a competitive technology hackathon under the track:



Local Networks & Experience – Bridging referral gaps through community projects and professional networks.



2. TARGET USERS



Create three main user roles:



1. Volunteer / Youth

   

   - Register and create a professional profile.

   - List skills, education and interests.

   - Discover community projects.

   - Apply to volunteer opportunities.

   - Track project participation.

   - Receive verified experience records.

   - Request recommendations from supervisors.



2. Organization / Project Coordinator

   

   - Register an organization.

   - Create and publish community projects.

   - Specify required skills, location and duration.

   - Review volunteer applications.

   - Accept or reject applicants.

   - Assign project tasks.

   - Verify completed work.

   - Endorse volunteers.



3. Administrator

   

   - Manage users and organizations.

   - Review organization verification requests.

   - Monitor projects and applications.

   - Handle reports and suspicious activities.

   - View platform statistics.



3. CORE APPLICATION MODULES



Build the following functional modules:



A. Authentication



- User registration and login.

- Role-based access control.

- Password reset.

- User profile management.

- Secure logout.



B. Community Project Marketplace



- Display available community projects.

- Search and filter by skills, category and location.

- Project details page.

- Application submission.

- Application status tracking.

- Organization project management.



C. Intelligent Team Matching



- Match volunteers to projects using skills, interests and availability.

- Recommend suitable candidates.

- Display matching percentages.

- Explain why a volunteer matches a project.

- Use transparent rule-based matching for the MVP; prepare the architecture for future AI integration.



D. Volunteer Management



- Volunteer dashboard.

- Skills and education profile.

- Project application history.

- Assigned tasks.

- Project participation records.



E. Verified Experience Passport



- Record completed community projects.

- Record assigned responsibilities.

- Record project duration.

- Record skills demonstrated.

- Allow authorized project coordinators to verify completed work.

- Generate a professional digital experience certificate.

- Provide a unique verification code for each certificate.

- Include a public certificate verification page that reveals only approved information.



F. Professional Referral Network



- Allow supervisors to endorse volunteers.

- Allow volunteers to request recommendations.

- Maintain a history of professional recommendations.

- Display verified endorsements on user profiles.



G. Impact Dashboard

Display:



- Total registered volunteers.

- Total registered organizations.

- Active community projects.

- Completed projects.

- Volunteer participation.

- Skills contributed.

- Community beneficiaries reached, based on verified project reports.



4. USER INTERFACE AND DESIGN



Create a premium, professional SaaS-style interface.



Design direction:



- Modern and minimal.

- Professional technology startup appearance.

- Teal, deep navy, white and light grey colour palette.

- Clean typography.

- Attractive cards and dashboard layouts.

- Responsive navigation.

- Smooth transitions and subtle animations.

- Accessible forms and readable text.



Create these pages:



1. Landing page.

2. Registration page.

3. Login page.

4. Volunteer dashboard.

5. Organization dashboard.

6. Administrator dashboard.

7. Community projects page.

8. Project details page.

9. Volunteer profile page.

10. Application management page.

11. Experience passport page.

12. Certificate verification page.

13. Referral and endorsement page.

14. Impact analytics page.



5. LANDING PAGE CONTENT



The homepage must communicate the following message:



Headline:

"Your Skills Can Build Communities. Your Experience Can Build Your Future."



Subheading:

"Connect with community projects, contribute your skills, gain verified experience and build professional networks through JengaLink."



Include:



- Get Started button.

- Explore Projects button.

- How It Works section.

- Platform benefits.

- Featured community projects.

- Impact statistics.

- Testimonials using clearly identified demo content.

- Footer with contact and platform information.



6. DATABASE AND BACKEND



Use Supabase for:



- PostgreSQL database.

- Authentication.

- User profiles.

- Organization profiles.

- Project listings.

- Volunteer applications.

- Project assignments.

- Task tracking.

- Experience records.

- Certificates.

- Referrals and endorsements.

- Notifications.



Create properly related database tables with unique IDs, timestamps, foreign keys and appropriate validation.



Implement Row Level Security (RLS) so that:



- Users can access and update their own permitted profiles.

- Organizations can manage only their own projects.

- Coordinators can manage applications for their organizations.

- Volunteers cannot verify their own experience.

- Only authorized administrators can perform administrative actions.

- Public certificate verification exposes only approved certificate details.



Never expose secret API keys or service-role credentials in frontend code.



7. FUNCTIONAL REQUIREMENTS



IMPORTANT: Do not create a static design or a non-functional demonstration.



Implement:



- Working navigation.

- Functional registration and login.

- Role-based dashboards.

- Working search and filtering.

- Project creation and editing.

- Volunteer applications.

- Application approval and rejection.

- Task assignment and completion.

- Experience verification.

- Certificate generation and verification.

- Referral requests and endorsements.

- Database persistence.

- Form validation.

- Error and success notifications.

- Loading states.

- Empty states.



Use realistic demo data for the initial demonstration, clearly labelled as sample data. Do not present fictional achievements or impact figures as real.



8. HACKATHON DEMONSTRATION SCENARIO



Prepare the application for this demonstration:



An organization publishes a community project called:



"Digital Literacy for 100 Youth"



Project requirements:



- Five volunteers.

- ICT skills.

- Communication skills.

- Two-week duration.

- Community training activities.



Demonstrate this complete workflow:



1. An organization registers.

2. The organization creates the project.

3. A volunteer registers and adds ICT skills.

4. The volunteer discovers the project.

5. The volunteer applies.

6. The organization reviews and approves the application.

7. The coordinator assigns tasks.

8. The volunteer marks tasks as completed.

9. The coordinator verifies the completed work.

10. JengaLink generates a verified experience certificate.

11. The volunteer shares the certificate verification link.



Every stage must work in the application.



9. DEVELOPMENT PRIORITIES



Build in this order:



Phase 1: Landing page and visual identity.



Phase 2: Authentication and user profiles.



Phase 3: Organization and volunteer dashboards.



Phase 4: Community project marketplace.



Phase 5: Application and task management.



Phase 6: Experience Passport and certificate verification.



Phase 7: Referral and endorsement system.



Phase 8: Impact dashboard and final testing.



Prioritize a working MVP over unnecessary complexity.



10. FINAL EXPECTATIONS



The final product must:



- Be a complete responsive web application.

- Work on desktop and mobile browsers.

- Have a consistent professional design.

- Use a real persistent database.

- Implement secure authentication and authorization.

- Have functional end-to-end user journeys.

- Include realistic sample data.

- Be easy to demonstrate to hackathon judges.

- Have clean, maintainable and reusable code.



Do not stop after creating the homepage. Build the application module by module and verify that each major workflow works before moving to the next.



Start by establishing the application architecture, database schema, authentication and core user journeys. Then implement the complete MVP.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://jenga-skills-to-impact.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d70bb234-4ba2-480a-a2c0-f883370e33ed).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

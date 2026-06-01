# REFLECTION.md — Open-Source Collaboration (Assignment 14)

**Campus Lost & Found System (CLAFS)**
Author: Mlungisi Mbuyazi | CPUT ICT: Application Development 2026

---

## Reflection on Peer Review and Open-Source Collaboration

### Improving the Repository Based on Peer Feedback

Sharing the CLAFS repository with classmates revealed gaps I had not noticed while working alone. The most consistent feedback was that the project was technically strong but difficult to approach as a new contributor. Peers who tried to understand the codebase said the folder structure made sense once explained, but was not immediately obvious from the README alone. Based on this, I added a detailed "Getting Started" section and an explicit project structure map to the README, showing exactly what lives in each folder and why. I also updated the contribution instructions to clarify that `bcrypt` requires a native rebuild step something that caused confusion for several classmates who tried to run the tests locally.

The second round of feedback focused on the issue tracker. Classmates pointed out that while there were 25 open issues, none were labelled in a way that helped a newcomer know where to begin. I responded by applying `good-first-issue` labels to five self-contained tasks (such as adding the database migration scripts and the rate limiting middleware) and `feature-request` labels to three larger items (PostgreSQL integration, JWT authentication, and the React frontend scaffold). This small change made the repository noticeably more welcoming because contributors could immediately filter to work that matched their experience level.

---

### Challenges in Onboarding Contributors

The most significant challenge was the gap between documentation quality and code readiness. CLAFS has thorough architectural documentation state diagrams, activity diagrams, a domain model, and a class diagram but this documentation describes the full vision of the system, not just the parts that are currently implemented. A new contributor reading `ARCHITECTURE.md` might expect a PostgreSQL database to already exist, when in reality the system uses in-memory repositories. This created confusion and required me to add a "Current Status" section to the ROADMAP that clearly separates what is done from what is planned.

The second challenge was the CI/CD pipeline itself. The branch protection rules I set up for Assignment 13 which require passing tests and a peer review before merging turned out to be both a strength and a friction point. They ensured that no broken code could reach `main`, but they also meant that first-time contributors needed to understand the full pipeline before their PR could be merged. I addressed this by adding a "Before You Push" checklist in `CONTRIBUTING.md` that walks through each step.

---

### Lessons Learned About Open-Source Collaboration

The most important lesson was that documentation is never finished. I had spent considerable effort on README updates throughout the course, yet the moment real users tried to follow the instructions, new gaps appeared. Open-source readiness is not a one-time task it is a continuous process of observing how people interact with the project and removing friction.

The second lesson was about the value of labels and structure over volume. Having 25 unlabelled issues was less useful than having 8 well-labelled ones. Organisation signals professionalism and lowers the barrier to contribution far more than having more features.

Finally, seeing peers star and fork the repository 9 stars and 16 forks by the submission date was a tangible measure of the project's accessibility and quality. It reinforced that the investment in documentation, testing, and CI/CD has value beyond academic marks: it signals to the wider community that the project is maintained, structured, and worth engaging with.



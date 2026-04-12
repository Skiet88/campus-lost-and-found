# REFLECTION_A7_KANBAN.md — Reflection on Kanban Board Implementation
## Campus Lost & Found System (CLAFS)

---

## Reflection

Implementing the Kanban board for CLAFS through GitHub Projects was a more thoughtful process than I initially expected. What appeared to be a simple configuration task choose a template, add some columns, link some issues turned out to involve genuine design decisions that required me to think carefully about how work actually flows through a solo development project.

**The first challenge was template selection.** GitHub offers four templates and none of them fit perfectly out of the box. Basic Kanban was too simple, no automation meant I would spend time manually dragging cards instead of writing code. Bug Triage was clearly designed for maintenance workflows, not feature development. Team Planning assumed a team. Automated Kanban came closest, but even it required significant customisation before it accurately reflected the CLAFS workflow. The lesson here was that templates are starting points, not solutions they give you a structure to react to, not a structure to simply accept.

**The second challenge was deciding which custom columns to add.** The assignment required at least two additional columns, but adding columns for the sake of it creates noise rather than clarity. I considered several options "Review", "Deployed", "On Hold" before settling on "Testing" and "Blocked". Testing was justified by the detailed test cases already defined in Assignment 5; there was no point having those test cases if the workflow did not include a stage where they are actually executed. Blocked was justified by the reality of solo development external dependencies like Cloudinary API keys and SMTP configuration do not resolve themselves on demand, and stuck work needs to be visible without polluting the In Progress column.

**Comparing GitHub Projects to other tools** revealed both its strengths and its limitations. Trello is arguably more intuitive its drag-and-drop interface is smoother, its card customisation is richer, and its power-ups (like calendar views and voting) add functionality GitHub Projects lacks. However, Trello is a standalone tool with no native connection to code. Every time a branch is created or a PR is merged in Trello, you have to update the board manually. GitHub Projects, by contrast, lives inside the repository issues, pull requests, milestones, and the board are all in one place. For a developer, this integration is more valuable than Trello's visual polish.

Jira is the most powerful of the three and is the industry standard for large Agile teams. It supports proper story point tracking, velocity charts, burndown charts, epic management, and deep integration with CI/CD pipelines. Compared to Jira, GitHub Projects feels lightweigh the custom fields for story points and MoSCoW priority that I had to manually configure in GitHub Projects are native, first-class features in Jira. However, Jira has a steep learning curve and is overkill for a solo student project. The complexity it adds is only justified when the team size and project scale warrant it.

The broader lesson I take from this assignment is that project management tooling is only as good as the discipline behind it. A beautifully configured Kanban board on GitHub, Trello, or Jira delivers no value if issues are not kept up to date, WIP limits are ignored, and the board is not consulted during development. The tool facilitates good practice it does not replace it.

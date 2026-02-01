# Project Charter: MiseKai

**Version**: 1.0
**Date**: February 1, 2026
**Status**: Draft

---

## Executive Summary

MiseKai is a project management command center for equipment manufacturing that consolidates scattered spreadsheets, emails, and Slack messages into a single source of truth. By combining mise en place discipline with kaizen continuous improvement principles, MiseKai keeps teams aligned, surfaces patterns that block task completion, and transforms chaotic project tracking into structured operational excellence.

---

## Vision Statement

A unified command center where preparation meets continuous improvement—every task visible, every delay analyzed, every pattern surfaced for coaching.

---

## Problem Statement

### The Problem
Project management in equipment manufacturing suffers from fragmented visibility: status lives in 5+ spreadsheets, email threads, and Slack channels. Tasks frequently stall at 90% completion due to unclear "done" criteria, fear of release, or missing documentation. PMs lose hours weekly context-switching between tools and translating technical updates for customers.

### Evidence
- 5+ spreadsheets currently serve as "sources of truth"
- Weekly review meetings are ad hoc with no structured format
- Customer update preparation takes 1+ hours per week
- Delayed tasks aren't analyzed for root causes or patterns
- No coaching framework exists for recurring blockers

### Impact
Without intervention:
- PM burnout from manual synchronization across tools
- Missed deadlines due to invisible blockers
- Customer relationships strained by inconsistent communication
- Team improvement stalls without pattern recognition
- Scaling from 10 to 1,200 stores becomes unmanageable

---

## Target Users

### Primary User
- **Persona**: Patrick Salazar (Project Manager / Product Owner)
- **Pain Points**: Time lost synchronizing tools, no visibility into delay patterns, manual customer update preparation
- **Goals**: Single dashboard for all project status, automated pattern detection, streamlined stakeholder communication

### Secondary Users
- **Persona**: Engineering Team Members (6-10 people)
- **Pain Points**: Unclear task ownership, no centralized place to log updates, context lost in email/Slack
- **Goals**: Clear personal task list, easy status updates, visibility into their own work only

### Tertiary Users
- **Persona**: Customers / External Stakeholders
- **Pain Points**: Technical jargon in updates, inconsistent communication cadence
- **Goals**: Clear progress visibility, professional status reports, confidence in project trajectory

---

## Success Metrics

| Metric | Current State | Target | Measurement Method |
|--------|--------------|--------|-------------------|
| Hours saved per week | Baseline TBD | 5+ hours | Time tracking comparison |
| Tasks completed on time | Unknown | 80%+ | MiseKai completion tracking |
| Sources of truth | 5+ spreadsheets | 1 (MiseKai) | Tool audit |
| Weekly review time | Ad hoc / variable | 30 min structured | Friday Review logs |
| Customer update prep time | 1+ hours | 15 minutes | Time tracking |

### Definition of Done (Phase 1: Actions)
- [ ] Team can log in and manage their own actions via web portal
- [ ] Patrick can run weekly review with 5 Whys prompts for delayed items
- [ ] System auto-flags items past due date as "Delayed"
- [ ] Pattern detection surfaces recurring delay reasons
- [ ] Original spreadsheet officially retired

---

## Scope

### In Scope (Phase 1 - Actions Register)
- Web-based action register with CRUD operations
- User authentication (6-10 team members)
- Personal task visibility (users see own actions only)
- Status management: On Target / Delayed / Complete
- Auto-flag delayed items when past due date
- Filtering by owner, status, due date
- Weekly review mode with 5 Whys prompt flow
- Delay reason categorization and pattern detection
- Coaching insights panel
- Export functionality

### Out of Scope (Future Phases)
- Daily Brief + Slack Integration → Phase 2 (Weeks 3-4)
- Client View (customer-facing register) → Phase 3 (Weeks 5-6)
- Issues Tracker + Datadog Integration → Phase 4 (Weeks 7-9)
- Roadmap (strategic milestone view) → Phase 5 (Weeks 10-11)
- Lab Tracker (testing management) → Phase 6 (Weeks 12-14)
- Dashboard (command & control) → Phase 7 (Weeks 15-16)
- Mobile app / responsive design → Future consideration
- Data migration from existing spreadsheets → Not planned (fresh start)
- Local agent for file/email extraction → Future consideration

### Assumptions
- Team members have consistent internet access for web portal
- Supabase (or similar) provides adequate auth and database for team size
- Desktop browser access is sufficient for v1
- Team is willing to adopt new tool if it demonstrably saves time
- Patrick has authority to retire existing spreadsheets once MiseKai proves viable

---

## Technical Constraints

### Technology Stack
- **Frontend**: Next.js (React-based, good DX, Vercel-optimized)
- **Backend**: Next.js API routes + Supabase
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Auth**: Supabase Auth (email/password for team)
- **Infrastructure**: Vercel (low-ops, automatic deployments)

### Integrations (Phase 1)
- None required for Phase 1
- Slack webhook planned for Phase 2
- Datadog API planned for Phase 4

### Non-Functional Requirements
- **Performance**: Page loads < 2s, action updates < 500ms
- **Security**: Row Level Security ensures users see only their actions; Patrick sees all
- **Scalability**: Support 6-10 concurrent users, 1000+ actions
- **Availability**: 99% uptime (Vercel/Supabase SLA)
- **Browser Support**: Desktop Chrome, Firefox, Safari (latest versions)

---

## Timeline

| Milestone | Target Date | Deliverables |
|-----------|-------------|--------------|
| Charter Approved | Week 0 | This document |
| PRD Complete | Week 0.5 | Detailed requirements for Phase 1 |
| Phase 1 Week 1 | Week 1 | Database schema, basic UI, auth, filtering |
| Phase 1 Complete | Week 2 | Full Actions Register with intelligence features |
| Phase 2 Complete | Week 4 | Daily Brief + Slack integration |
| Phase 3 Complete | Week 6 | Client View |
| Phase 4 Complete | Week 9 | Issues + Datadog |
| Phase 5 Complete | Week 11 | Roadmap |
| Phase 6 Complete | Week 14 | Lab Tracker |
| Phase 7 Complete | Week 16 | Dashboard (full MiseKai) |

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Team adoption resistance** | Medium | High | Start with PM-only usage in Week 1; demonstrate value before team rollout. Make UX simpler than spreadsheets. Quick wins first. |
| **Scope creep** | High | High | Strict phase boundaries. Each phase has clear Definition of Done. Defer "nice to haves" to explicit future phases. Weekly scope check-ins. |
| **PM time availability** | Medium | Medium | Time-box development sessions. Use Claude Code for accelerated development. Prioritize ruthlessly—Phase 1 must ship in 2 weeks. |
| **Technical integration complexity** | Low | Medium | Phase 1 has no integrations. Slack/Datadog are later phases with dedicated time. Use documented APIs with good support. |
| **Data model changes mid-project** | Medium | Medium | Invest in schema design upfront. Use migrations for changes. Keep data model simple for v1. |

---

## Stakeholders

| Name/Role | Involvement | Communication |
|-----------|-------------|---------------|
| Patrick Salazar (PM/Owner) | Responsible - all decisions, primary user | Daily self-review, Friday Review |
| Engineering Team (6-10) | Consulted - provide input; Informed - use the tool | Onboarded Week 2, daily action updates |
| Customers | Informed - receive Client View updates | Weekly via Client View (Phase 3+) |
| Leadership | Informed - visibility into Dashboard | Monthly via Dashboard (Phase 7+) |

---

## The 7 Tools (Full MiseKai Vision)

| # | Tool | Purpose | Phase |
|---|------|---------|-------|
| 1 | **Actions** | Single source of truth for all team tasks | Phase 1 |
| 2 | **Daily Brief** | Morning Slack summary aligning team priorities | Phase 2 |
| 3 | **Client View** | Customer-facing polished status updates | Phase 3 |
| 4 | **Issues** | Service issue tracking with Datadog analytics | Phase 4 |
| 5 | **Roadmap** | Strategic milestones and critical path | Phase 5 |
| 6 | **Lab Tracker** | Lab testing requests, execution, reporting | Phase 6 |
| 7 | **Dashboard** | Executive command center with coaching insights | Phase 7 |

---

## Operating Rhythms (Target State)

| Habit | Frequency | Duration | Tool |
|-------|-----------|----------|------|
| Morning Review | Daily | 10 min | Daily Brief (Slack) |
| Action Check | Daily | 5 min | Actions |
| Client Prep | Monday | 15 min | Client View |
| Issue Scan | Daily | 5 min | Issues |
| Roadmap Update | Weekly | 20 min | Roadmap |
| Lab Sync | Weekly | 15 min | Lab Tracker |
| Friday Review | Friday | 30 min | Dashboard |

---

## Approvals

- [ ] Product Owner (Patrick Salazar): _________________ Date: _______
- [ ] Technical Lead: _________________ Date: _______

---

## Next Steps

1. **Review and approve this charter**
2. Run `/prd` to create detailed Product Requirements Document for Phase 1
3. Run `/modules` to break PRD into implementation modules
4. Set up development environment (Next.js + Supabase)
5. Begin Phase 1, Week 1 development
6. Schedule first Friday Review for end of Week 2

---

*MiseKai: Preparation meets continuous improvement.*

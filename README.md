# Medha AI — QA & Test Automation

Quality Assurance and test automation project for **Medha AI**, an AI-powered productivity and agent platform.

This repository contains exploratory testing artifacts, automated browser tests, test evidence, and validation scripts created to evaluate critical user workflows and AI-driven features.

---

## 🚀 About the Project

Medha AI is an AI-powered platform that brings together multiple AI capabilities, workflows, agents, tools, and productivity features in a single application.

The platform includes features such as:

- AI Chat
- AI Agents
- Skills
- RAG / Knowledge-based AI
- Vision
- Projects
- Content workflows
- AI-powered tools
- Integrations and connections
- Scheduled posts
- AI worker/task orchestration
- User profiles and authentication
- Model and usage management

Because of the combination of traditional web functionality and AI-driven workflows, testing focuses on both **software quality** and **AI application behavior**.

---

## 🎯 QA Objectives

The main objectives of this project are:

- Validate critical user journeys.
- Identify functional and UI issues.
- Verify authentication and authorization flows.
- Test AI-powered features and workflows.
- Validate multi-step agent/task execution.
- Perform exploratory testing to discover unexpected behavior.
- Automate repeatable browser-based scenarios.
- Capture reproducible test evidence.
- Maintain structured testing artifacts for future regression testing.

---

## 🧪 Testing Scope

### Functional Testing

- User registration
- Login / Logout
- Navigation
- Profile management
- Projects
- AI Chat
- Agents
- Skills
- Tools
- Content workflows
- Integrations
- Scheduled posts
- Usage / wallet functionality
- AI worker workflows

### UI Testing

- Layout and responsiveness
- Forms and validations
- Buttons and controls
- Navigation elements
- Modals and dialogs
- Loading states
- Error messages
- Empty states
- Data rendering

### Exploratory Testing

Exploratory testing is used to discover unexpected issues that may not be covered by predefined test cases.

Testing includes:

- Happy paths
- Negative scenarios
- Boundary conditions
- Invalid inputs
- Unexpected user actions
- State transitions
- Refresh / navigation behavior
- Session-related scenarios

### AI Application Testing

Special attention is given to AI-specific behavior:

- AI response generation
- Context handling
- Multi-step workflows
- Agent execution
- Tool invocation
- RAG-based responses
- Vision-related functionality
- AI worker orchestration
- Failure and fallback behavior

---

## 🤖 Test Automation

Browser automation is implemented using **Playwright**.

Automation is used for:

- Authentication flows
- Critical user journeys
- UI validation
- Regression scenarios
- Workflow verification
- Evidence collection

Example structure:

```text
medha-ai-testing/
│
├── discovery-evidence/
│   ├── screenshots/
│   ├── videos/
│   └── test-evidence/
│
├── scratch-01-discovery.js
├── scratch-02-login.js
├── scratch-03-...
├── ...
│
├── package.json
├── playwright.config.js
└── README.md

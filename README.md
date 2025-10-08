# 🤖 AIVA — AI-Powered Portfolio Assistant

> An AI co-pilot for your professional story.

![React](https://img.shields.io/badge/Frontend-React-blue?logo=react)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?logo=typescript)
![Python](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)
![TailwindCSS](https://img.shields.io/badge/UI-TailwindCSS-38B2AC?logo=tailwindcss)
![Framer Motion](https://img.shields.io/badge/Animation-Framer%20Motion-0055FF)
![OpenAI](https://img.shields.io/badge/AI-OpenAI-412991)
![React Query](https://img.shields.io/badge/Data-ReactQuery-FF4154)
![License: MIT](https://img.shields.io/badge/License-MIT-green)

---

<!-- ## 🎬 Preview

![AIVA Demo Placeholder](https://via.placeholder.com/800x400.png?text=AIVA+Portfolio+Assistant)

> **Try AIVA** and see your portfolio come alive with interactive AI conversations! 

--- -->

## 🧠 Overview

**AIVA** isn’t just another chatbot — she’s your personal **AI guide** trained on your projects, experience, and achievements.
She helps recruiters, collaborators, and hiring teams *discover your work intuitively* through real conversations.

**Detailed tagline for context:**

> *An AI-powered portfolio that explains your work better than any résumé.*

**Goal:** Build a modern, real-time AI portfolio assistant that demonstrates full-stack expertise across **React**, **TypeScript**, **Python**, and **modern AI integration**.

---

## 🚀 Key Features

### 💬 AI-Powered Portfolio Chat

* Visitors can ask natural questions:
  *“What’s your strongest project?”* or *“Tell me about Monika’s work with React.”*
* Context-aware responses based on your portfolio data.
* Typing indicator + chat history for smooth UX.

### 🧩 Smart Project Insights

* AI-generated summaries for each project.
* Automatic tech highlight extraction and tagging.
* Modular design to scale with new projects.

### 🧠 Knowledge Base Context

* Responses powered by structured context: bio, skills, experience, achievements.
* Ensures accurate, personalized AI answers.

### 🎨 Modern UI/UX

* TailwindCSS v4 + HeroUI components for sleek design.
* Framer Motion animations for smooth interactions.
* Fully responsive and accessible across devices.

---

## 🤖 AI Assistant Capabilities

| Capability                    | Description                                                                |
| ----------------------------- | -------------------------------------------------------------------------- |
| **AI Summary Generator**      | Creates crisp project summaries from README or raw descriptions.           |
| **Auto “About Me” Generator** | Produces multiple tone variants for your bio.                              |
| **Skill Extractor**           | Scans projects to categorize your tech stack and expertise.                |
| **Portfolio Chat Assistant**  | Answers recruiter-style questions naturally, using context injection.      |
| **Smart Recommendations**     | Suggests projects or sections to highlight based on portfolio analysis.    |
| **AI Content Optimizer**      | Scores clarity, relevance, and recruiter readability of portfolio content. |
| **Optional Dev Copilot Mode** | Assists in writing or refactoring portfolio components with AI guidance.   |

---

## ⚙️ Tech Stack

| Layer               | Technology                                                          |
| ------------------- | ------------------------------------------------------------------- |
| **Frontend**        | React 19 + TypeScript + Vite + TailwindCSS + HeroUI + Framer Motion |
| **State & Data**    | React Query v5 + Axios                                              |
| **Backend**         | FastAPI (Python 3.12) + OpenAI API                                  |
| **Build & Deploy**  | Vercel (Frontend) + Render/Azure (Backend)                          |
| **Version Control** | Git + GitHub Actions (CI/CD optional)                               |

---

## 🏗️ Architecture

```plaintext
Frontend (React + Vite + Tailwind)
        │
        ▼
Backend API (FastAPI - /chat endpoint)
        │
        ▼
OpenAI API / Local LLM (Context + Responses)
```

---

## 🛠️ Setup & Installation

### 1️⃣ Clone the repository

```bash
git clone https://github.com/monikalnu/aiva.git
cd aiva
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Configure environment variables

Create `.env`:

```env
VITE_API_URL=http://localhost:8000
OPENAI_API_KEY=your_api_key_here
```

### 4️⃣ Run the development servers

```bash
# Frontend
npm run dev

# Backend
cd backend
uvicorn main:app --reload
```

### 5️⃣ Build for production

```bash
npm run build
```

---

## 🧭 Roadmap

| Phase                                    | Focus                 | Features                                         |
| ---------------------------------------- | --------------------- | ------------------------------------------------ |
| **Phase 1: Core (MVP)**                  | Personal AI portfolio | Chat assistant, project summaries, recruiter Q&A |
| **Phase 2: Enhanced UX**                 | Smart recommendations | AI resume builder, project scoring, analytics    |
| **Phase 3: Open Source Template**        | Public starter        | Customizable AI portfolio template for devs      |
| **Phase 4: SaaS / Platform (NaviFolio)** | Multi-user builder    | AI-powered portfolio generation platform         |

---

## 💡 Why AIVA?

Because recruiters don’t just want *lists* —
they want *insights*.
AIVA turns your portfolio into a **conversation**, not a static page.

---

## 👩‍💻 Author

**Monika Lnu**

> Self-coached Web Developer | AI Prompt Engineer @ Remotasks
> Skilled in React, TypeScript, Python, Cloud (Azure + AWS)

🌐 [Portfolio Website](https://monika-ch.github.io/Monika_Portfolio) 💼 [LinkedIn](https://www.linkedin.com/in/monika12b/) 📧 [Email](mailto:monika12b@gmail.com)

---

## 🪶 License

MIT License — open for learning, inspiration, and contribution.

---

# Kombinara

> **Interactive Combinatorics E-Module for High School**
> A web-based learning platform for Counting Principles, Permutations, and Combinations — designed for students to deeply understand the concepts, not just memorize formulas.

---

## Table of Contents

- [About the Project](#about-the-project)
- [Tech Stack](#tech-stack)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
  - [AI Streaming — Block Text Q&A](#ai-streaming--block-text-qa)
  - [Handwritten Answer Flow](#handwritten-answer-flow)
  - [Student Activeness System](#student-activeness-system)
- [AI Cost Optimization](#ai-cost-optimization)
- [Exam Anti-Cheat Strategy](#exam-anti-cheat-strategy)
- [Roles & Access](#roles--access)
- [Database Schema](#database-schema)
- [Development Roadmap](#development-roadmap)
- [Technical Decisions & Trade-offs](#technical-decisions--trade-offs)
- [Getting Started](#getting-started)

---

## About the Project

Kombinara is a text-based interactive e-module platform for high school combinatorics.

**Name:** Kombinara

**Content Coverage:**
- Counting Principles
- Permutations
- Combinations

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14+ (App Router) + TypeScript |
| Auth | Supabase Auth + Google OAuth |
| Database | PostgreSQL via Supabase |
| ORM | Prisma |
| Rich Text / Content | TipTap (JSON format) |
| Handwritten Canvas | tldraw (export PNG) |
| AI Model (High Stakes) | GPT-4o-mini |
| AI Model (Low Stakes) | GPT-4o-mini |
| AI SDK | Vercel AI SDK (streaming) |
| Cache | Upstash Redis |
| Visualization | Recharts |
| PDF Export | jsPDF |
| Deployment | Vercel + Supabase |

---

## Key Features

### For Students
- Read combinatorics material in multi-page rich text format
- Highlight text and ask AI directly (sliding window context)
- Quiz: MCQ, short answer, and handwritten answer
- Daily exams with countdown timer, auto-submit, and anti-cheat
- Progress tracking per module
- Badges and achievements for certain milestones
---

## System Architecture

### AI Streaming — Block Text Q&A

```
Student highlights text in the material
  -> floating toolbar appears
  -> clicks "Ask AI"
  -> selected text + 2 context paragraphs (sliding window) sent to API Route
  -> Edge Runtime forwards to GPT-4o-mini with streaming
  -> response streamed to UI via Vercel AI SDK useChat
```

**Technical notes:**
- Context uses a sliding window — only the selected text + 2 paragraphs before and after it, not the entire page
- GPT-4o-mini is used to keep costs low for casual Q&A use cases

---

### Handwritten Answer Flow

```
Student writes answer on canvas (tldraw)
  -> export PNG client-side
  -> convert to base64
  -> send to Next.js API Route (Edge Runtime)
  -> forward to GPT-4o with the question + rubric
  -> GPT-4o returns JSON: { ocr_result, is_correct, score, feedback, correction }
  -> frontend renders structured feedback
  -> result saved to DB
```

**Technical notes:**
- Handwritten feedback cannot be streamed because the JSON must be complete before it can be parsed
- Display an engaging loading state, target response time 3–6 seconds
- GPT-4o-mini is chosen for high accuracy on mathematical feedback

---

### Student Activeness System

Activeness is the primary assessment metric for teachers — not just cognitive scores.

**Formula:**

```
activity_score = (
  reading_engagement    * 0.25 +
  question_frequency    * 0.25 +
  question_depth        * 0.30 +
  quiz_score            * 0.20
) * 100
```

**Components:**

| Component | Default Weight | Measurement Method |
|---|---|---|
| Reading Engagement | 25% | Intersection Observer API — time-on-section per material (not scroll %) |
| Question Frequency | 25% | Normalized: `number_of_questions / study_time_minutes` |
| Question Depth | 30% | Scored async by GPT-4o-mini, score 1–5, categories: clarification / conceptual / application / critical |
| Quiz & Exam Score | 20% | Cumulative score from all assessments |

These weights are **configurable per class** by the teacher — stored as settings in the DB.

---

## AI Cost Optimization

### 1. Hybrid Model Strategy

Costs are reduced by differentiating models based on the stakes of each feature:

| Feature | Model | Reason |
|---|---|---|
| Block Text Q&A (casual) | GPT-4o-mini | Low-stakes, high volume |
| Handwritten Feedback | GPT-4o-mini| High-stakes, requires high mathematical accuracy |
| Question Depth Scoring | GPT-4o-mini | Impacts teacher assessment, must be reliable |

### 2. Semantic Caching + Intent Classification

Semantically similar student questions do not need to hit the model twice.

**Flow:**

```
User question comes in
  -> generate embedding (e.g., text-embedding-3-small)
  -> cosine similarity check against Redis (threshold ~0.92)
  -> if similarity >= threshold: return cached response (0 token usage)
  -> if miss: classify intent first
       -> intent router determines: does it need document context from the material?
       -> if intent = general math question: skip RAG, go directly to model
       -> if intent = content-specific: fetch relevant chunk from material
  -> call model with narrowed context
  -> store response + embedding in Redis (TTL 24 hours)
```

**Dual benefit:**
- Semantic cache: eliminates redundant API calls for similar questions
- Intent classification: avoids sending unnecessary document context, saves tokens per request

### 3. Sliding Window Context

Only sends relevant text (selected text + 2 surrounding paragraphs), not the entire material page. This directly cuts input tokens per request.

---

## Exam Anti-Cheat Strategy

- **Page Visibility API** — detects when a student tab-switches or minimizes the browser
- **Incremental answer submission** — answers are sent to the backend incrementally, not only on final submit
- **Server-side countdown timer** — auto-submit is triggered by the backend if the time limit is exceeded

---

**Student auth flow:**
1. Sign up via Google OAuth
2. Required to complete profile: Full Name, Class, Student Number
3. Enroll in a class via Module Key provided by the teacher

---

## Database Schema

Main tables:

- `users` — student and teacher profiles (linked to Supabase Auth)
- `classes` — classes managed by teachers
- `class_settings` — activeness weight configuration per class
- `modules` — content modules (Counting Principles, Permutations, Combinations)
- `module_pages` — pages per module with TipTap JSON content
- `enrollments` — student ↔ class relationship
- `reading_logs` — time-on-section per student per page
- `ai_questions` — log of student questions to AI along with depth score
- `quiz_attempts` — quiz and exam results per student
- `activity_scores` — aggregated activeness score per student per class

> Derivable data (e.g., `max_score`, redundant timestamps) is not stored in the DB — computed on-the-fly or via materialized view.

---

## Getting Started

```bash
# Clone repo
git clone https://github.com/username/kombinara.git
cd kombinara

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Fill in: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
#          ANTHROPIC_API_KEY, UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN

# Push DB schema
npx prisma db push

# Generate Prisma client
npx prisma generate

# Run dev server
npm run dev
```

---

*Kombinara — Solo developer project. Built for long-term use at a single school.*

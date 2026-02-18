# Better Job Assignment – AI Audit SDK & Web Platform

🔗 **Live Deployment:**  
https://better-job-assignment-dfwp.vercel.app/

---

## 📌 Project Overview

This project demonstrates the design and implementation of a lightweight, production-ready **AI Audit SDK** along with a web application that integrates the SDK to perform automated audit checks in high-impact environments.

The objective of this assignment was to:

- Build a modular SDK
- Implement secure API communication
- Provide structured audit results
- Ensure production-grade architecture
- Demonstrate complete narrative + technical clarity

---

# 🧠 Problem Narrative

AI systems operating in high-impact environments (finance, hiring, healthcare, compliance, etc.) must guarantee:

- Transparency
- Risk awareness
- Structured evaluation
- Human override capability
- Logging & traceability

Manual auditing is slow, inconsistent, and not scalable.

To solve this, we built a:

> **Pluggable AI Audit SDK**

This SDK standardizes evaluation logic and exposes structured APIs that can be integrated into any AI-powered application.

---

# 🏗️ System Architecture

```
Frontend (Next.js - Vercel)
        │
        ▼
Backend API Layer
        │
        ▼
AI Audit SDK (Core Logic Layer)
        │
        ▼
Model Provider (LLM / External API)
```

---

## 🔹 Architecture Breakdown

### 1️⃣ Frontend (Deployed on Vercel)

- Clean UI for user input
- Displays structured audit output
- Handles loading and error states
- Securely communicates with backend APIs

---

### 2️⃣ Backend API Layer

Acts as:

- Security gateway
- Environment variable manager
- SDK orchestrator
- Request validator
- Error handler

Responsibilities:

- Receives user input
- Validates request payload
- Calls SDK audit methods
- Returns structured response
- Normalizes external API errors

---

### 3️⃣ AI Audit SDK (Core Layer)

The SDK is modular, reusable, and independent of the UI.

### Conceptual Folder Structure

```
sdk/
 ├── index.ts
 ├── auditor.ts
 ├── riskEvaluator.ts
 ├── overrideHandler.ts
 └── types.ts
```

---

# 🧩 SDK Design Principles

## ✅ 1. Separation of Concerns

Each module handles a single responsibility:

- Risk scoring
- Policy validation
- Model communication
- Response formatting
- Override handling

---

## ✅ 2. Strict Typed Response Schema

All audit results follow a structured format:

```ts
{
  status: "PASS" | "REVIEW" | "BLOCKED" | "ERROR",
  riskScore: number,
  explanation: string,
  flags: string[],
  overrideRequired: boolean
}
```

This ensures:

- Predictable frontend rendering
- Easy logging
- Enterprise integration readiness
- Clear audit traceability

---

## ✅ 3. Model-Agnostic Design

The SDK does not depend on a single AI provider.

It is built so that the evaluation layer can switch between:

- Gemini
- OpenAI
- Any REST-based LLM
- Future internal models

This makes the architecture scalable and future-proof.

---

## ✅ 4. Human-in-the-Loop Override System

For high-risk scenarios, the SDK enforces manual review.

Example:

```json
{
  "overrideRequired": true,
  "message": "Manual override required for this high-impact environment."
}
```

This ensures:

- No silent failures
- No automatic approval of risky content
- Enterprise safety compliance

---

# 🔌 API Endpoints

## 1️⃣ POST `/api/audit`

### Request

```json
{
  "input": "User submitted content",
  "environment": "high-impact"
}
```

### Response

```json
{
  "status": "REVIEW",
  "riskScore": 72,
  "flags": ["bias-risk", "regulatory-risk"],
  "overrideRequired": true,
  "explanation": "Detected policy-sensitive patterns..."
}
```

---

## 2️⃣ GET `/api/health`

Used for:

- Deployment validation
- Monitoring systems
- DevOps readiness checks

### Response

```json
{
  "status": "ok"
}
```

---

# 🔐 Security Measures

- `.env` file excluded using `.gitignore`
- API keys handled server-side only
- No secrets exposed to frontend
- Structured error normalization
- Secure production deployment
- Safe Git directory configuration

---

# 🧪 Error Handling Strategy

External model failures such as:

- `404 NOT_FOUND`
- Unsupported model
- Timeout errors
- Provider outages

Are normalized into structured SDK-level responses:

```json
{
  "status": "ERROR",
  "message": "AI Auditor Unreachable",
  "action": "Manual override required"
}
```

This ensures:

- Clean UI messaging
- No raw stack traces exposed
- Enterprise-grade resilience

---

# 📊 End-to-End Audit Flow

1. User submits input via UI  
2. Frontend sends POST request to backend  
3. Backend validates request  
4. SDK performs:
   - Risk evaluation
   - Model inference
   - Flag detection
   - Override check  
5. Structured audit result returned  
6. UI displays:
   - Status
   - Risk score
   - Flags
   - Override requirement  

---

# 🚀 Deployment

- **Frontend:** Vercel  
- **Backend:** API routes  
- **Environment Variables:** Managed securely  
- **Production URL:**  
  https://better-job-assignment-dfwp.vercel.app/

---

# 📦 How to Run Locally

```bash
git clone <repo-url>
cd project
npm install
npm run dev
```

Create a `.env` file:

```
MODEL_API_KEY=your_key_here
```

---

# 📈 Why This Architecture Works

✔ Modular  
✔ Scalable  
✔ Secure by default  
✔ Model-agnostic  
✔ Human-in-the-loop compliant  
✔ Production-ready  

---

# 🎯 Assignment Coverage

This implementation covers:

- SDK creation
- API abstraction layer
- Risk-based evaluation
- Human override enforcement
- Structured audit responses
- Error normalization
- Secure deployment
- Complete architectural documentation

---

# 👨‍💻 Author

Ayush Singh Rathore
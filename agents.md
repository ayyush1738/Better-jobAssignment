# AI Orchestration & Guidance Framework

**Project:** SafeConfig AI (Feature Management & Risk Guardrails)
**Lead Engineer:** Ayush Rathore
**AI Role:** Senior Infrastructure Co-pilot / Implementation Agent

This document outlines the constraints, personas, and coding standards enforced upon AI agents during the development of SafeConfig AI. The goal was to ensure "System Integrity" over "Feature Count."

---

## 1. Primary AI Persona
The AI was instructed to operate under the following persona:
> "You are a Senior Staff Engineer at a high-scale infrastructure company. You prioritize correctness, interface safety, and observability over cleverness. You never provide code without explaining the trade-offs first."

---

## 2. Core Engineering Constraints (Enforced on AI)

### A. Interface Safety (The "Pydantic-First" Rule)
* **Constraint:** No raw JSON or dictionaries are to be processed in the backend.
* **Guidance:** All incoming requests and outgoing responses must pass through Pydantic (Python) or TypeScript Interfaces (React). 
* **Evaluation Alignment:** This enforces **Interface Safety** and prevents invalid states from entering the database.

### B. Simplicity > Cleverness
* **Constraint:** Avoid deeply nested logic or complex list comprehensions that reduce readability.
* **Guidance:** "If a function is longer than 20 lines, it must be broken down into the Service Layer."
* **Evaluation Alignment:** Ensures **Structure** and **Predictability**.

### C. Observability & Telemetry
* **Constraint:** Every feature toggle evaluation must trigger a telemetry "hit."
* **Guidance:** "Do not write a fetch call for a flag status without also ensuring the backend registers a hit for the Blast Radius HUD."
* **Evaluation Alignment:** Direct focus on **Observability**.

---

## 3. Workflow & Verification Logic

During the 48-hour build, the following workflow was used to maintain **Change Resilience**:

1. **Context Injection:** Before any code generation, the AI was fed the existing database schema (`models.py`) to ensure new features wouldn't cause "schema drift."
2. **Incremental Implementation:** Code was generated in small modules (Routes -> Services -> Schemas). The AI was forbidden from overwriting entire files to prevent widespread regression.
3. **Manual Audit (Human-in-the-loop):** * Every AI-generated Flask route was manually checked for proper decorator usage (`@jwt_required`).
    * React components were audited to ensure state changes (`useState`) didn't trigger infinite re-renders.

---

## 4. AI Guardrails for this Assessment

* **No Legacy Code:** The AI was strictly prohibited from using deprecated Flask or React patterns. 
* **Security Guard:** The AI was instructed to never "assume" a user is authenticated. Explicit Role-Based Access Control (RBAC) was required for all management endpoints.

---

## 5. Summary of AI Contribution
* **Generated:** Boilerplate for Flask App Factory, Pydantic Schema structures, and initial Tailwind/Shadcn layouts.
* **Refined:** The AI helped optimize the SQL queries for the "Global Hits" aggregation.
* **Human-led:** All logic regarding the **Neural Guardrail (Groq integration)** and the **Telemetry environment-awareness** was architected and verified by the lead engineer.
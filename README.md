# 🟢 SettleWise — Autonomous Financial Exception Investigator & Money Recovery Controller

> **Razorpay Buildathon 2026 Submission** | **Track 04: AI Finance Controller**  
> **Core Principle**: *"AI Investigates. Rules Authorize."*

---

## ⚡ Executive Summary

Financial operations in 2026 face a fundamental bottleneck: **verification capacity, not generation speed**. Reconciliation, settlement discrepancy resolution, fee audit, and cash position forecasting are still largely manual, fragile, and prone to silent money leakage.

**SettleWise** is an enterprise-grade AI Financial Controller that automates the closed-loop investigation and resolution of settlement discrepancies across **multi-source financial ledgers** (Bank Statements, Gateway Ledgers, Webhook Logs, and Enterprise ERPs). 

Rather than relying on unbounded LLM output, SettleWise strictly separates **AI Reasoning & Hypothesis Synthesis** from **Deterministic Financial Authorization**.

---

## 🎯 Razorpay Evaluation Criteria Alignment

| Evaluation Criterion | SettleWise Implementation |
| :--- | :--- |
| **Problem Taste** | Solves high-value settlement reconciliation, fee drift, and intermediate bank leakage. |
| **Build Quality** | High-density Dark Mode UI, real-time telemetry, zero-dependency Vite + React + TypeScript engine. |
| **AI Judgment** | AI decomposes root causes & synthesizes evidence; deterministic rules authorize actions. |
| **Measured Accuracy** | Real-time **Counterfactual Benchmark Engine** evaluating 50 to 10,000 record batches with precision metrics. |
| **Honest Exception List** | Safely isolates ambiguous cases (e.g., duplicate settlement candidates) to protect against double reconciliation. |

---

## 🏗️ End-to-End System Architecture

```text
               ┌─────────────────────────────────────────┐
               │ Multi-Source Financial Ingestion Batch  │
               │ (Bank UTRs, Gateway Webhooks, ERP Logs) │
               └────────────────────┬────────────────────┘
                                    │
                                    ▼
               ┌─────────────────────────────────────────┐
               │    Deterministic Ledger Hash Matcher    │
               └──────────┬───────────────────┬──────────┘
                          │                   │
                Exact Match                 Discrepancy
                          │                   │
                          ▼                   ▼
                 [Auto-Close Books] ┌────────────────────────┐
                                    │ Tri-Agent Pipeline     │
                                    │ ├─ Root Cause Agent    │
                                    │ ├─ Merchant Context    │
                                    │ └─ Fee & Tax Matcher   │
                                    └─────────┬──────────────┘
                                              │
                                              ▼
                                    ┌────────────────────────┐
                                    │ Dual-Key Adversarial   │
                                    │ Auditor Gate           │
                                    └─────────┬──────────────┘
                                              │
                                              ▼
                                    ┌────────────────────────┐
                                    │ Deterministic Policy   │
                                    │ Authorization Engine   │
                                    └─────────┬──────────────┘
                                              │
                       ┌──────────────────────┴──────────────────────┐
                       ▼                                             ▼
            [PASS: Auto-Resolution]                       [FAIL: Honest Exception]
            ├── Write Settlement Ledger                   ├── Log Failure Reason
            └── Execute Recovery Case                     └── Route to Human Review
```

---

## 🔥 Key Technical Innovations

### 1. Tri-Agent Autonomous Decomposition Network
SettleWise splits complex financial investigation across three specialized AI sub-agents:
* **Agent 01 — Root Cause & Drift Agent**: Isolates numerical deltas between expected net payouts and actual bank credits.
* **Agent 02 — Merchant Context Vector Agent**: Queries vector memory for historical resolution patterns across merchant transaction profiles.
* **Agent 03 — Fee & Tax Matcher Agent**: Validates contractual MDR rates (e.g., 1.0% Enterprise Slab) and 18% GST tax invoice alignment.

### 2. Dual-Key Adversarial Auditor Gate
Before any hypothesis is sent for execution, an **Adversarial Auditor Agent** executes counter-evidence challenges. It tests for timing shifts (T+1 bank holiday roll), dropped webhooks, and duplicate batch injections to prevent false auto-resolutions.

### 3. Deterministic Policy Authorization Engine
Money movement is governed by non-negotiable mathematical guardrails:
* **AI Confidence Threshold**: Minimum 95.0% confidence required for auto-resolution.
* **Candidate Margin Delta**: Top hypothesis must outscore runner-up by $\ge 15.0\%$.
* **Arithmetic Ledger Verification**: Hard check ensuring $\text{Payment} - \text{Refund} - \text{MDR} = \text{Net Settlement}$.
* **Transaction Amount Cap**: Configurable auto-resolution ceiling (default ₹1,00,000).

### 4. Counterfactual Policy Replay & Benchmark Engine
Allows financial controllers and hackathon evaluators to test policy adjustments (e.g., tightening confidence thresholds) over **50 to 10,000 record synthetic batches** and view live impact on precision, recall, and honest exception counts.

### 5. Money Leakage & Recovery Controller
Automatically detects intermediate bank fee deductions and un-webhooked refunds, generating formal **Claim Dispute Packages** for financial ops teams.

---

## 🚀 Quickstart & Local Development

### Prerequisites
* Node.js v18+ 
* npm v9+

### Installation & Running Locally

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Launch Local Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173`.

3. **Validate Production Build**:
   ```bash
   npm run build
   ```

---

## 🛠️ Technology Stack

* **Frontend**: React 18, TypeScript, Vite
* **Styling**: TailwindCSS, Lucide Icons, Glassmorphic Utility Design System
* **Engine**: Synthetic Financial Data Generator, Deterministic Policy Evaluator, Counterfactual Replay Suite

---

## 📜 License & Hackathon Attribution

Submitted for **Razorpay Buildathon 2026 — Track 04 (AI Finance Controller)**. Built with high precision, zero placeholders, and strict verification safety.

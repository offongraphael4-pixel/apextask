# ApexTask — Modern Crowdsourcing & Microtask Marketplace

> **Next-generation crowdsourced microtask platform with guaranteed escrow protection, SLA reviews, and instant settlements.**

---

## 🌟 Overview

**ApexTask** is a high-performance, modular crowdsourcing application designed for microtask creation, execution, validation, and escrow-based settlement.

### Key Capabilities

* **💼 Worker Portal**: Explore curated microtasks, submit cryptographic or image proof of work, track active leases, and manage real-time earnings.
* **🏢 Business Portal**: Launch campaigns, set reward tiers, configure task validation rules, review worker submissions, and release escrow funds.
* **🛡️ Admin & Ledger Terminal**: Real-time solvency monitoring, automated invariant validation audits, and audit logs.
* **⚡ Zero-Dependency SPA**: Pure ES modules, custom vanilla CSS design system with glassmorphism, responsive across desktop, tablet, and mobile.
* **🔒 Escrow Core**: Double-entry ledger simulation ensuring mathematical balance between liabilities, assets, and escrow reserves.

---

## 🚀 Live Demo

Once deployed on GitHub Pages, the application is accessible directly in any modern browser without requiring a server backend.

---

## 🛠️ Local Development

### Option 1: Native PowerShell HTTP Server
Run the built-in local server:
```powershell
powershell -ExecutionPolicy Bypass -File .\server.ps1
```
Then visit [http://localhost:8080/](http://localhost:8080/).

### Option 2: Any Static Web Server
Because ApexTask is built with pure client-side standard technologies, you can serve it with any HTTP server:
```bash
# Python 3
python -m http.server 8080

# Node / npx
npx serve .
```

---

## 📁 Project Architecture

```
microtask-marketplace/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions deployment to GitHub Pages
├── assets/                     # Static media and assets
├── css/
│   ├── variables.css           # Global design tokens, palettes & typography
│   ├── base.css                # Base reset & layout scaffolding
│   ├── components.css          # Cards, buttons, modals, badges, tables
│   ├── worker.css              # Worker marketplace & task detail styles
│   ├── business.css            # Campaign builder & submission review styles
│   ├── admin.css               # Solvency dashboard & ledger table styles
│   └── responsive.css          # Mobile navigation & breakpoint overrides
├── js/
│   ├── app.js                  # Application bootstrap & hash router
│   ├── store.js                # Reactive state store & mock datasets
│   ├── ledger.js               # Double-entry ledger core & audit invariants
│   ├── fraud.js                # Anti-abuse heuristics & submission validation
│   ├── components/             # Reusable UI components
│   └── views/                  # Modular view renderers
├── index.html                  # Single page application entry point
└── server.ps1                  # Local lightweight HTTP server script
```

---

## 📄 License
MIT License.

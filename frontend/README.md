# Frontend

The `frontend/` folder contains the React + Vite application for SmartCluster AI.

## Purpose

- Build an enterprise-grade dashboard for monitoring Kubernetes clusters, nodes, pods, and deployments.
- Display AI-powered forecasting, recommendations, anomaly alerts, and reports.
- Provide reusable UI components and charts.

## Key Subfolders

- `src/assets/` - static assets such as icons, images, and fonts
- `src/components/` - reusable UI components and layout building blocks
- `src/pages/` - application pages and route targets
- `src/services/` - API client logic and integration with backend endpoints
- `src/stores/` - state management stores and hooks
- `src/styles/` - TailwindCSS configuration, global styles, and design tokens
- `public/` - static files served by Vite at runtime
- `tests/` - frontend tests for components, pages, and integration flows

## Recommended Workflow

1. Design reusable dashboard widgets first.
2. Build page-level layouts around data visualization needs.
3. Integrate backend API services for live data and forecasting results.
4. Use Tailwind CSS utility classes for consistent responsive styling.

# SmartCluster AI: Frontend Appレット Module

This module provides the responsive user interface, data visualizations, and stress lab controls for **SmartCluster AI**.

## 🚀 Key Responsibilities
1. **Cluster Topology Map**: Render node pools alongside active containers and CPU/Memory allocation bars.
2. **Predictive Regression Charts**: Plot historical telemetry lines alongside ordinary least squares line projections and AI confidence intervals.
3. **Comparative SRE Audit**: Compare reactive standard HPA latency surges against preemptive AI scale-ups.
4. **Stress Lab Control Panel**: Interactive trigger buttons to transition cluster scenarios immediately (Standard production, weekend idle, flash sales).
5. **AI Advisor Shell**: Copy optimized YAML configuration patches created server-side by Gemini telemetry scanners.

## 📁 Suggested Directory Structure
```
frontend/
├── src/
│   ├── components/       # Reusable components (e.g., Topology, Charts)
│   ├── types.ts          # Shared TypeScript type signatures
│   ├── App.tsx           # Dashboard view coordinator
│   └── main.tsx          # React application entry-point
├── index.html            # Main HTML document template
├── package.json          # Node dependency configurations
└── vite.config.ts        # Vite execution configurations
```

## 🛠️ Main Libraries Used
- **Vite 6** (Build system)
- **React 19**
- **Tailwind CSS** (Utility spacing, responsive grids)
- **Recharts** (Telemetry plotting, Confidence ranges area bands, Step charts)
- **Framer Motion** (`motion/react` layout transitions)
- **Lucide-react** (Status and element design vectors)

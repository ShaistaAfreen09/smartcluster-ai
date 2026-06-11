import { Route, Routes, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import DashboardPage from './pages/DashboardPage'
import ClusterOverviewPage from './pages/ClusterOverviewPage'
import NodesPage from './pages/NodesPage'
import PodsPage from './pages/PodsPage'
import AIInsightsPage from './pages/AIInsightsPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="cluster" element={<ClusterOverviewPage />} />
        <Route path="nodes" element={<NodesPage />} />
        <Route path="pods" element={<PodsPage />} />
        <Route path="insights" element={<AIInsightsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App

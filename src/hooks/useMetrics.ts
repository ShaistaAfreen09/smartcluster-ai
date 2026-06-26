import { useState, useEffect } from "react";
import { monitoringService, ClusterStatus, NodeTelemetry, PodTelemetry, DeploymentTelemetry, ClusterEvent } from "../services/monitoring";
import { useWebSocket } from "./useWebSocket";

export function useMetrics(refreshIntervalMs = 15000) {
  const { connected: wsConnected, data: wsData } = useWebSocket();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // REST State fallbacks
  const [clusterStatus, setClusterStatus] = useState<ClusterStatus | null>(null);
  const [nodes, setNodes] = useState<NodeTelemetry[]>([]);
  const [pods, setPods] = useState<PodTelemetry[]>([]);
  const [deployments, setDeployments] = useState<DeploymentTelemetry[]>([]);
  const [events, setEvents] = useState<ClusterEvent[]>([]);

  // Refresh REST endpoints (used if WebSocket is offline or for initial setup)
  const fetchAllMetrics = async () => {
    try {
      const [statusRes, nodesRes, podsRes, deploymentsRes, eventsRes] = await Promise.all([
        monitoringService.getClusterStatus(),
        monitoringService.getNodes(),
        monitoringService.getPods(),
        monitoringService.getDeployments(),
        monitoringService.getEvents(),
      ]);

      setClusterStatus(statusRes);
      setNodes(nodesRes);
      setPods(podsRes);
      setDeployments(deploymentsRes);
      setEvents(eventsRes);
      setError(null);
    } catch (err: any) {
      console.error("❌ Failed fetching metrics via REST APIs:", err);
      setError(err.message || "Prometheus temporarily unavailable");
    } finally {
      setLoading(false);
    }
  };

  // React to incoming WebSocket real-time payloads
  useEffect(() => {
    if (wsConnected && wsData) {
      setLoading(false);
      setError(null);
      
      // Map WebSocket structured metrics
      if (wsData.health) {
        setClusterStatus({
          status: wsData.health.nodeReadiness === 100 && wsData.health.podHealthPercentage > 90 ? "Healthy" : "Degraded",
          nodeReadiness: wsData.health.nodeReadiness,
          podHealthPercentage: wsData.health.podHealthPercentage,
          failedPods: wsData.health.failedPods,
          cpuPressure: wsData.health.cpuPressure,
          memoryPressure: wsData.health.memoryPressure,
          networkLatencyMs: wsData.health.networkLatencyMs,
          packetDropPercent: wsData.health.packetDropPercent,
          timestamp: new Date().toISOString()
        });
      }
      if (wsData.nodes) setNodes(wsData.nodes);
      if (wsData.pods) setPods(wsData.pods);
      if (wsData.deployments) setDeployments(wsData.deployments);
      if (wsData.events) setEvents(wsData.events);
    }
  }, [wsConnected, wsData]);

  // Set up periodic fallback polling if WebSocket is offline
  useEffect(() => {
    fetchAllMetrics();

    if (!wsConnected) {
      const interval = setInterval(() => {
        fetchAllMetrics();
      }, refreshIntervalMs);
      return () => clearInterval(interval);
    }
  }, [wsConnected, refreshIntervalMs]);

  return {
    loading,
    error,
    wsConnected,
    clusterStatus,
    nodes,
    pods,
    deployments,
    events,
    refresh: fetchAllMetrics,
  };
}

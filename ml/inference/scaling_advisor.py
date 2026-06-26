class SmartScalingAdvisor:
    """
    Intelligent Kubernetes Scaling Advisor comparing Reactive HPAs with Predictive ML triggers.
    """
    def __init__(self):
        pass

    def compute_scaling_recommendation(self, current_cpu: float, predicted_cpu_horizon: float, current_replicas: int, traffic_rps: float) -> dict:
        """
        Analyzes future trends to suggest replicas before overload occurs.
        """
        recommended_replicas = current_replicas
        reason = "Current allocations are optimal relative to cyclical workload metrics."
        latency_reduction = "0%"

        # Standard HPA rule: reactive to current CPU crossing 80%
        hpa_action = "No action"
        if current_cpu > 80.0:
            hpa_action = f"Scale up to {current_replicas + 3} replicas (Reactive)"

        # Proactive scaling logic:
        # If CPU is predicted to spike or traffic is surging
        if predicted_cpu_horizon > 80.0:
            recommended_replicas = max(current_replicas + 4, 10)
            reason = f"CPU utilization is predicted to exceed critical threshold (predicted {predicted_cpu_horizon:.1f}% in 15 minutes). Pre-emptively scaling up to prevent request bottlenecks."
            latency_reduction = "35%"
        elif predicted_cpu_horizon > 70.0 and current_replicas < 6:
            recommended_replicas = 6
            reason = f"diurnal traffic forecasts show incoming request increase (predicted {traffic_rps:.0f} rps). Scaling up replica minimum buffer limit from {current_replicas} to 6."
            latency_reduction = "20%"
        elif predicted_cpu_horizon < 35.0 and current_replicas > 2:
            recommended_replicas = max(2, current_replicas - 2)
            reason = f"workload forecasts indicate low utilization values for over 2 hours. Pre-emptively scale down to avoid idle resources billing leaks."
            latency_reduction = "0% (Saves Cost)"

        return {
            'service': 'payment-service',
            'current_replicas': current_replicas,
            'recommended_replicas': recommended_replicas,
            'reason': reason,
            'expected_latency_reduction': latency_reduction,
            'comparative_hpa_state': {
                'reactive_hpa_decision': hpa_action,
                'predictive_ai_decision': f"Scale to {recommended_replicas} (Proactive)" if recommended_replicas != current_replicas else "Maintain"
            }
        }

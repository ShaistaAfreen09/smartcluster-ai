import numpy as np
import pandas as pd

class CostOptimizer:
    """
    Financial SRE engine analyzing nodes, pod waste, and replica profiles to output monthly savings reports.
    """
    def __init__(self, hourly_node_cost=0.0475, hourly_pod_cost=0.005):
        self.hourly_node_cost = hourly_node_cost # standard general-purpose VM cost
        self.hourly_pod_cost = hourly_pod_cost

    def analyze_cost_structure(self, current_metrics: dict) -> dict:
        """
        Calculates cloud compute billing metrics and savings based on underutilization.
        """
        nodes_count = current_metrics.get('nodes_count', 3)
        pods_count = current_metrics.get('pods_count', 10)
        cpu_util = current_metrics.get('cpu_utilization', 45.0) # percentage
        mem_util = current_metrics.get('memory_usage', 55.0) # percentage

        # Hourly and monthly base cost
        node_hourly_total = nodes_count * self.hourly_node_cost
        pod_hourly_total = pods_count * self.hourly_pod_cost
        current_hourly_cost = node_hourly_total + pod_hourly_total
        
        current_monthly_cost = current_hourly_cost * 24 * 30
        
        # Determine idle waste factor (relative to 70% standard target load)
        resource_util = (cpu_util + mem_util) / 2.0
        target_util = 70.0
        
        waste_factor = max(0.0, (target_util - resource_util) / target_util)
        
        # Savings potential
        potential_monthly_savings = current_monthly_cost * waste_factor * 0.85 # dampener
        predicted_monthly_cost = current_monthly_cost - potential_monthly_savings
        
        # Specific cost recommendations
        recommendations = []
        if cpu_util < 25.0:
            recommendations.append({
                'recommendation': 'Consolidate workloads: Downsize active nodes pool by 1 VM',
                'monthly_savings': f"${float(self.hourly_node_cost * 24 * 30):.0f}",
                'confidence': 0.90,
                'category': 'Compute'
            })
            
        if pods_count > 15 and resource_util < 35.0:
            recommendations.append({
                'recommendation': 'Reduce analytics-worker replicas from 8 to 4 during off-peak hours',
                'monthly_savings': '$450',
                'confidence': 0.92,
                'category': 'Sizing'
            })
            
        if mem_util < 40.0:
            recommendations.append({
                'recommendation': 'Optimize LimitRanges: Decrease default container memory requests',
                'monthly_savings': '$280',
                'confidence': 0.85,
                'category': 'Limits'
            })

        # Default recommendations if quiet
        if not recommendations:
            recommendations.append({
                'recommendation': 'Apply Spot VMs for non-critical developer tasks',
                'monthly_savings': '$150',
                'confidence': 0.95,
                'category': 'Provisioning'
            })

        return {
            'current_hourly_cost': float(current_hourly_cost),
            'current_monthly_cost': float(current_monthly_cost),
            'predicted_monthly_cost': float(predicted_monthly_cost),
            'potential_monthly_savings': float(potential_monthly_savings),
            'waste_factor': float(waste_factor),
            'recommendations': recommendations
        }

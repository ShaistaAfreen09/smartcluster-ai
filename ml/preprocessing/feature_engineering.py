import pandas as pd
import numpy as np

def create_features(df: pd.DataFrame, window_sizes=[3, 6]) -> pd.DataFrame:
    """
    Constructs ML features for cluster metrics:
    - Time of day and Day of week sine/cosine seasonal encodings
    - Rolling window means and standard deviations
    - Momentum / Trend indicators
    - Peak metrics detection
    """
    feat_df = df.copy()
    
    # Ensure correct sorting
    if 'timestamp' in feat_df.columns:
        feat_df = feat_df.sort_values('timestamp').reset_index(drop=True)
        
    # Standard time attributes
    if 'timestamp' in feat_df.columns:
        feat_df['hour'] = feat_df['timestamp'].dt.hour
        feat_df['day_of_week'] = feat_df['timestamp'].dt.dayofweek
    else:
        if 'time_of_day' in feat_df.columns:
            feat_df['hour'] = feat_df['time_of_day']
        else:
            feat_df['hour'] = 12
        if 'day_of_week' not in feat_df.columns:
            feat_df['day_of_week'] = 0

    # Sine/Cosine Seasonal Transformations for Cyclic Time Features
    feat_df['hour_sin'] = np.sin(2 * np.pi * feat_df['hour'] / 24.0)
    feat_df['hour_cos'] = np.cos(2 * np.pi * feat_df['hour'] / 24.0)
    feat_df['dow_sin'] = np.sin(2 * np.pi * feat_df['day_of_week'] / 7.0)
    feat_df['dow_cos'] = np.cos(2 * np.pi * feat_df['day_of_week'] / 7.0)

    # Core columns for rolling features
    core_cols = ['cpu_utilization', 'memory_usage', 'network_traffic', 'request_rate']
    
    # Rolling averages & std deviations
    for col in core_cols:
        if col in feat_df.columns:
            for w in window_sizes:
                # Rolling mean (minimum periods=1 to prevent NaN at start)
                feat_df[f'{col}_roll_mean_{w}'] = feat_df[col].rolling(window=w, min_periods=1).mean()
                # Rolling standard deviation
                feat_df[f'{col}_roll_std_{w}'] = feat_df[col].rolling(window=w, min_periods=1).std().fillna(0.0)
                # Trend / Delta indicators (difference from previous timestep rolling mean)
                feat_df[f'{col}_trend_{w}'] = feat_df[col] - feat_df[f'{col}_roll_mean_{w}']

    # Peak detection (boolean / float flags indicating values > 2 std deviations above rolling mean)
    for col in ['cpu_utilization', 'network_traffic']:
        if col in feat_df.columns:
            mean_6 = feat_df[f'{col}_roll_mean_6']
            std_6 = feat_df[f'{col}_roll_std_6']
            feat_df[f'{col}_is_peak'] = (feat_df[col] > (mean_6 + 1.8 * std_6)).astype(float)
            
    return feat_df

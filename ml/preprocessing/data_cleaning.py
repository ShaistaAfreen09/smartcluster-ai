import pandas as pd
import numpy as np

def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Cleans raw telemetry dataframe by:
    - Handling missing values via linear interpolation or forward fill
    - Dropping exact duplicates
    - Parsing and indexing timestamps
    """
    cleaned_df = df.copy()
    
    # Drop exact duplicate rows
    cleaned_df = cleaned_df.drop_duplicates()
    
    # Handle timestamp conversion
    if 'timestamp' in cleaned_df.columns:
        cleaned_df['timestamp'] = pd.to_datetime(cleaned_df['timestamp'])
        cleaned_df = cleaned_df.sort_values('timestamp').reset_index(drop=True)
    
    # Replace zeros or negatives with NaN for strictly positive columns if appropriate, then impute
    cols_to_interpolate = [
        'cpu_utilization', 'memory_usage', 'network_traffic', 
        'request_rate', 'response_latency', 'error_percentage'
    ]
    
    for col in cols_to_interpolate:
        if col in cleaned_df.columns:
            # Replace negative values with NaN
            cleaned_df.loc[cleaned_df[col] < 0, col] = np.nan
            # Interpolate missing values
            cleaned_df[col] = cleaned_df[col].interpolate(method='linear').ffill().bfill()
            
    # Convert active_pods and replica_count to integer
    for col in ['active_pods', 'replica_count']:
        if col in cleaned_df.columns:
            cleaned_df[col] = cleaned_df[col].round().astype(int)
            
    return cleaned_df

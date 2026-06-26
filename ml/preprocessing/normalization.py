import pandas as pd
import numpy as np

class TelemetryScaler:
    """
    MinMax style scaler for normalization and scaling of GKE metrics features.
    """
    def __init__(self):
        self.stats = {}

    def fit(self, df: pd.DataFrame, columns: list):
        for col in columns:
            if col in df.columns:
                col_min = float(df[col].min())
                col_max = float(df[col].max())
                # Handle zero variance column
                if col_max == col_min:
                    col_max += 1e-5
                self.stats[col] = {'min': col_min, 'max': col_max}

    def transform(self, df: pd.DataFrame, columns: list) -> pd.DataFrame:
        scaled_df = df.copy()
        for col in columns:
            if col in scaled_df.columns and col in self.stats:
                col_min = self.stats[col]['min']
                col_max = self.stats[col]['max']
                scaled_df[col] = (scaled_df[col] - col_min) / (col_max - col_min)
        return scaled_df

    def fit_transform(self, df: pd.DataFrame, columns: list) -> pd.DataFrame:
        self.fit(df, columns)
        return self.transform(df, columns)

    def inverse_transform_column(self, values: np.ndarray, col_name: str) -> np.ndarray:
        if col_name in self.stats:
            col_min = self.stats[col_name]['min']
            col_max = self.stats[col_name]['max']
            return values * (col_max - col_min) + col_min
        return values

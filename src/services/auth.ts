export interface CyberUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  workspaceRole: "Viewer" | "Operator" | "Admin";
  clusterAccess: string[];
  loginTimestamp: string;
}

export const loginWithGoogle = async (): Promise<CyberUser> => {
  // Fetch Google Auth URL from our compiled Express/Postgres backend
  const res = await fetch("/api/auth/google/url");
  if (!res.ok) {
    throw new Error("SRE_AUTH_ERR: Telemetry auth endpoints unavailable.");
  }
  const { url } = await res.json();

  // Compute centered popup location
  const width = 550;
  const height = 650;
  const left = window.screen.width / 2 - width / 2;
  const top = window.screen.height / 2 - height / 2;

  const authWindow = window.open(
    url,
    "Google Sign In",
    `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes,status=yes`
  );

  if (!authWindow) {
    throw new Error("Popup blocked by browser. Please allow popups for SmartCluster AI.");
  }

  return new Promise<CyberUser>((resolve, reject) => {
    const handleOAuthMessage = async (event: MessageEvent) => {
      const origin = event.origin;
      // Allow current domain pattern safely
      if (!origin.endsWith(".run.app") && !origin.includes("localhost") && !origin.includes("127.0.0.1")) {
        return;
      }

      if (event.data?.type === "OAUTH_AUTH_SUCCESS") {
        window.removeEventListener("message", handleOAuthMessage);
        try {
          const profileRes = await fetch("/api/users/me");
          if (!profileRes.ok) {
            reject(new Error("Access profile synchronization failed."));
            return;
          }
          const data = await profileRes.json();
          resolve(data.user);
        } catch (err: any) {
          reject(err);
        }
      }
    };

    window.addEventListener("message", handleOAuthMessage);

    // Watch for popup termination
    const timer = setInterval(() => {
      if (authWindow.closed) {
        clearInterval(timer);
        window.removeEventListener("message", handleOAuthMessage);
        reject(new Error("Secure gateway login was cancelled by user."));
      }
    }, 1000);
  });
};

export const logoutUser = async (): Promise<void> => {
  const res = await fetch("/api/auth/logout", { method: "POST" });
  if (!res.ok) {
    throw new Error("SRE_LOGOUT_ERR: Failed to terminate security session.");
  }
};

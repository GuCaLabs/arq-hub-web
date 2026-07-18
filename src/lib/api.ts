import { getApiUrl } from "@/lib/api-url";

export async function fetchApi(path: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("arqhub_access_token") : null;
  
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(getApiUrl(path), {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized for refresh token (basic implementation)
  if (response.status === 401 && token) {
    const refreshToken = localStorage.getItem("arqhub_refresh_token");
    if (refreshToken) {
      try {
        const refreshRes = await fetch(getApiUrl("/auth/refresh"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshRes.ok) {
          const data = await refreshRes.json();
          if (data.success && data.data?.accessToken) {
            localStorage.setItem("arqhub_access_token", data.data.accessToken);
            localStorage.setItem("arqhub_refresh_token", data.data.refreshToken);
            
            // Retry the original request
            headers.set("Authorization", `Bearer ${data.data.accessToken}`);
            return fetch(getApiUrl(path), { ...options, headers });
          }
        }
      } catch (err) {
        console.error("Failed to refresh token", err);
      }
    }
    
    // If refresh fails, clear auth
    localStorage.removeItem("arqhub_access_token");
    localStorage.removeItem("arqhub_refresh_token");
    localStorage.removeItem("arqhub_user");
    window.location.href = "/login";
  }

  return response;
}

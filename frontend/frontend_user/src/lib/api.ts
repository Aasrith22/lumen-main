const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:3000/api";

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    credentials: "include",
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) {
    throw new Error(data.message || `Request failed: ${res.status}`);
  }
  return data;
}

export const api = {
  // Public
  getPlans: () => request("/plans"),
  // Subscriptions
  listSubscriptions: (params?: { userId?: string }) => {
    const qs = params?.userId ? `?userId=${encodeURIComponent(params.userId)}` : "";
    return request(`/subscriptions${qs}`);
  },
  subscribe: (userId: string | undefined, planId: string) => request("/subscriptions", { method: "POST", body: JSON.stringify({ userId, planId }) }),
  changePlan: (subscriptionId: string, newPlanId: string) => request(`/subscriptions/${subscriptionId}/change-plan`, { method: "PUT", body: JSON.stringify({ newPlanId }) }),
  cancel: (subscriptionId: string) => request(`/subscriptions/${subscriptionId}/cancel`, { method: "PUT" }),
  renew: (subscriptionId: string) => request(`/subscriptions/${subscriptionId}/renew`, { method: "PUT" }),
};

export default api;

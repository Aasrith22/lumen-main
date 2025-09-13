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
  // Plans
  getPlans: () => request("/plans"),
  createPlan: (body: any) => request("/plans", { method: "POST", body: JSON.stringify(body) }),
  updatePlan: (id: string, body: any) => request(`/plans/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deletePlan: (id: string) => request(`/plans/${id}`, { method: "DELETE" }),

  // Subscriptions
  listSubscriptions: (params?: { userId?: string }) => {
    const qs = params?.userId ? `?userId=${encodeURIComponent(params.userId)}` : "";
    return request(`/subscriptions${qs}`);
  },
  adminStats: () => request("/subscriptions/admin/stats"),
};

export default api;

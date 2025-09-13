export type NotificationItem = {
  id: string;
  title: string;
  description?: string;
  timestamp: number;
  read?: boolean;
};

const STORAGE_KEY = "notifications";

function load(): NotificationItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as NotificationItem[]) : [];
  } catch {
    return [];
  }
}

function save(items: NotificationItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  // Notify listeners
  window.dispatchEvent(new Event("notifications-updated"));
}

export function getNotifications(): NotificationItem[] {
  return load();
}

export function addNotification(n: Omit<NotificationItem, "id" | "timestamp">) {
  const items = load();
  const item: NotificationItem = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    read: false,
    ...n,
  };
  items.push(item);
  save(items);
}

export function getUnreadCount() {
  return load().filter((n) => !n.read).length;
}

export function markAllRead() {
  const items = load().map((n) => ({ ...n, read: true }));
  save(items);
}

export function ensureSeed() {
  const items = load();
  if (items.length === 0) {
    save([
      {
        id: crypto.randomUUID(),
        title: "Welcome to SubManager",
        description: "You're all set! Browse plans and manage subscriptions.",
        timestamp: Date.now() - 1000 * 60 * 60,
        read: false,
      },
      {
        id: crypto.randomUUID(),
        title: "Tip",
        description: "You can upgrade or cancel your plan anytime.",
        timestamp: Date.now() - 1000 * 60 * 10,
        read: false,
      },
    ]);
  }
}

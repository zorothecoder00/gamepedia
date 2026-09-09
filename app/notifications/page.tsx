"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useApi } from "@/hooks/useApi";
import { useMutation } from "@/hooks/useMutation";

interface Notification {
  id: string;
  type: string;
  title: string;
  message?: string | null;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

const TYPE_ICONS: Record<string, string> = {
  INFO: "ℹ️",
  SUCCESS: "✅",
  WARNING: "⚠️",
  TOURNAMENT: "🏆",
  MATCH: "🎮",
  ACHIEVEMENT: "🏅",
  SYSTEM: "🔧",
  WAGER: "💰",
};

export default function NotificationsPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const { data: notifications, loading, refetch } = useApi<Notification[]>(
    "/api/notifications?limit=50",
  );
  const { mutate: markAllRead, loading: markingAll } = useMutation(
    "/api/notifications/read-all",
    "PATCH",
  );

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push("/auth/login");
  }, [authLoading, isAuthenticated, router]);

  const handleClick = async (n: Notification) => {
    if (!n.isRead) {
      await fetch(`/api/notifications/${n.id}/read`, { method: "PATCH" });
      refetch();
    }
    if (n.link) router.push(n.link);
  };

  const handleMarkAllRead = async () => {
    const r = await markAllRead();
    if (r) refetch();
  };

  const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-[var(--text-muted)]">
        Chargement...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-black text-[var(--text-primary)]">Notifications</h1>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={markingAll}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer disabled:opacity-50"
          >
            {markingAll ? "..." : "Tout marquer comme lu"}
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-[var(--text-muted)]">Chargement...</div>
      ) : !notifications || notifications.length === 0 ? (
        <div className="text-center py-12 rounded-xl border border-dashed border-[var(--border)] text-[var(--text-muted)]">
          Aucune notification pour le moment.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => handleClick(n)}
              className={`text-left flex items-start gap-3 p-4 rounded-xl border transition-colors cursor-pointer ${
                n.isRead
                  ? "bg-[var(--bg-card)] border-[var(--border)]"
                  : "bg-[rgba(0,196,74,0.05)] border-[rgba(0,196,74,0.25)]"
              }`}
            >
              <span className="text-xl shrink-0">{TYPE_ICONS[n.type] ?? "🔔"}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--text-primary)]">{n.title}</p>
                {n.message && (
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">{n.message}</p>
                )}
                <p className="text-[0.7rem] text-[var(--text-muted)] mt-1">
                  {new Date(n.createdAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              {!n.isRead && (
                <span className="w-2 h-2 rounded-full bg-[var(--accent-green)] shrink-0 mt-1.5" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

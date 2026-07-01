"use client";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useApi } from "@/hooks/useApi";
import { useMutation } from "@/hooks/useMutation";
import { useAuth } from "@/hooks/useAuth";

interface AdminUser {
  id: string;
  email: string;
  username: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

const ROLES = ["VISITOR", "PLAYER", "MODERATOR", "ADMIN"];
const ROLE_COLOR: Record<string, string> = {
  ADMIN: "var(--accent-red)",
  MODERATOR: "var(--tier-a)",
  PLAYER: "var(--accent-green)",
  VISITOR: "var(--text-muted)",
};

export default function AdminUsersPage() {
  const { token, me, authHeader, loading: authLoading } = useAuth();
  const isStaff = me?.role === "ADMIN" || me?.role === "MODERATOR";
  const [search, setSearch] = useState("");

  const q = search.trim() ? `&search=${encodeURIComponent(search.trim())}` : "";
  const {
    data: users,
    loading,
    refetch,
  } = useApi<AdminUser[]>(
    token && isStaff ? `/api/admin/users?limit=50${q}` : null,
    [token, isStaff, search],
    authHeader,
  );

  if (authLoading) {
    return <div className="min-h-[50vh] grid place-items-center text-[var(--text-muted)]">Chargement...</div>;
  }
  if (!token || !isStaff) {
    return (
      <div className="min-h-[50vh] grid place-items-center text-[var(--text-muted)]">
        <div className="flex flex-col items-center gap-3">
          <p>Accès réservé à l&apos;administration.</p>
          <Link href="/" className="text-[var(--accent-green)] no-underline hover:underline">Retour à l&apos;accueil</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto px-6 py-8">
      <Link href="/admin" className="inline-block text-[0.82rem] text-[var(--text-muted)] no-underline hover:text-[var(--text-secondary)] mb-5">
        ← Dashboard
      </Link>
      <h1 className="text-[2rem] font-black text-[var(--text-primary)] mb-2">Utilisateurs</h1>
      <p className="text-[0.95rem] text-[var(--text-secondary)] mb-6">
        Gérez les rôles et l&apos;accès des comptes.
      </p>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Rechercher email ou username…"
        className="w-full max-w-sm mb-6 bg-[var(--bg-card)] border border-[var(--border)] focus:border-[var(--accent-green)] rounded-lg text-[var(--text-primary)] px-3.5 py-2 text-[0.88rem] outline-none box-border"
      />

      {loading ? (
        <div className="text-center py-12 text-[var(--text-muted)]">Chargement...</div>
      ) : !users || users.length === 0 ? (
        <div className="text-center py-12 text-[var(--text-muted)]">Aucun utilisateur.</div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {users.map((u) => (
            <UserRow
              key={u.id}
              user={u}
              isSelf={u.id === me?.id}
              canManageRoles={me?.role === "ADMIN"}
              authHeader={authHeader}
              onChanged={refetch}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function UserRow({
  user,
  isSelf,
  canManageRoles,
  authHeader,
  onChanged,
}: {
  user: AdminUser;
  isSelf: boolean;
  canManageRoles: boolean;
  authHeader?: Record<string, string>;
  onChanged: () => void;
}) {
  const roleMut = useMutation(`/api/admin/users/${user.id}/role`, "PATCH", authHeader, "Rôle mis à jour.");
  const activeMut = useMutation(`/api/admin/users/${user.id}`, "PATCH", authHeader);
  const busy = roleMut.loading || activeMut.loading;

  const changeRole = async (role: string) => {
    if (role === user.role) return;
    const r = await roleMut.mutate({ role });
    if (r) onChanged();
  };
  const toggleActive = async () => {
    const r = await activeMut.mutate({ isActive: !user.isActive });
    if (r) {
      toast.success(user.isActive ? "Compte désactivé." : "Compte réactivé.");
      onChanged();
    }
  };

  return (
    <div
      className={`bg-[var(--bg-card)] border rounded-xl px-5 py-4 flex items-center gap-4 flex-wrap ${
        user.isActive ? "border-[var(--border)]" : "border-[rgba(255,68,68,0.35)] opacity-70"
      }`}
    >
      <div className="flex-1 min-w-[200px]">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-[0.95rem] text-[var(--text-primary)]">{user.username}</span>
          {isSelf && (
            <span className="text-[0.66rem] font-semibold px-1.5 py-0.5 rounded bg-[var(--bg-primary)] text-[var(--text-muted)] border border-[var(--border)]">
              vous
            </span>
          )}
          {!user.isActive && (
            <span className="text-[0.68rem] font-semibold px-1.5 py-0.5 rounded bg-[rgba(255,68,68,0.12)] text-[var(--accent-red)] border border-[rgba(255,68,68,0.3)]">
              Désactivé
            </span>
          )}
        </div>
        <div className="text-[0.76rem] text-[var(--text-muted)] mt-0.5">{user.email}</div>
      </div>

      {canManageRoles && !isSelf ? (
        <select
          value={user.role}
          onChange={(e) => changeRole(e.target.value)}
          disabled={busy}
          className="bg-[var(--bg-primary)] border rounded-lg text-[0.8rem] px-2.5 py-1.5 outline-none cursor-pointer disabled:opacity-50 font-semibold"
          style={{ color: ROLE_COLOR[user.role], borderColor: `${ROLE_COLOR[user.role]}55` }}
        >
          {ROLES.map((r) => (
            <option key={r} value={r} className="text-[var(--text-primary)] bg-[var(--bg-primary)]">
              {r}
            </option>
          ))}
        </select>
      ) : (
        <span
          className="text-[0.78rem] font-bold px-2.5 py-1 rounded-lg"
          style={{ color: ROLE_COLOR[user.role], border: `1px solid ${ROLE_COLOR[user.role]}55` }}
        >
          {user.role}
        </span>
      )}

      <button
        onClick={toggleActive}
        disabled={busy || isSelf}
        title={isSelf ? "Vous ne pouvez pas désactiver votre propre compte." : undefined}
        className="px-3 py-1.5 rounded-lg text-[0.78rem] font-semibold bg-transparent border border-[var(--border)] text-[var(--text-secondary)] cursor-pointer hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {user.isActive ? "Désactiver" : "Réactiver"}
      </button>
    </div>
  );
}

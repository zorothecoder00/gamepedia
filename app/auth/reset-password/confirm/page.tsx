"use client";
import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@/hooks/useMutation";

export default function ResetPasswordConfirmPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordConfirmContent />
    </Suspense>
  );
}

function ResetPasswordConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [done, setDone] = useState(false);
  const { mutate, loading, error } = useMutation("/api/auth/password/confirm");

  const handleSubmit = async () => {
    if (password.length < 8) return;
    if (password !== confirmPassword) return;
    if (!token) return;
    const r = await mutate({ token, password });
    if (r) setDone(true);
  };

  if (!token) {
    return (
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-[420px] text-center">
          <div className="text-[3.5rem] mb-4">❌</div>
          <h1 className="text-2xl font-black text-[var(--text-primary)] mb-2">Lien invalide</h1>
          <p className="text-[0.9rem] text-[var(--text-secondary)] leading-relaxed mb-6">
            Aucun token de réinitialisation fourni.
          </p>
          <Link
            href="/auth/reset-password"
            className="inline-block px-6 py-2.5 rounded-lg border border-[var(--accent-green)] bg-transparent text-[var(--accent-green)] font-semibold text-sm no-underline hover:bg-[rgba(0,230,118,0.08)] transition-colors"
          >
            Redemander un lien
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-6 py-8">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-8">
          <div className="text-[2.5rem] mb-3">{done ? "✅" : "🔑"}</div>
          <h1 className="text-[1.375rem] font-bold text-[var(--text-primary)] mb-1">
            {done ? "Mot de passe changé !" : "Nouveau mot de passe"}
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            {done ? "Vous pouvez maintenant vous connecter." : "Choisissez un nouveau mot de passe (8 caractères minimum)."}
          </p>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-8">
          {!done ? (
            <div className="flex flex-col gap-[1.125rem]">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Nouveau mot de passe</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border)] focus:border-[var(--accent-green)] rounded-lg text-[var(--text-primary)] px-3.5 py-2.5 text-[0.9rem] outline-none box-border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Confirmez le mot de passe</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  placeholder="••••••••"
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border)] focus:border-[var(--accent-green)] rounded-lg text-[var(--text-primary)] px-3.5 py-2.5 text-[0.9rem] outline-none box-border"
                />
              </div>
              {password && password.length < 8 && (
                <p className="text-xs text-[var(--accent-red)]">8 caractères minimum.</p>
              )}
              {password && confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-[var(--accent-red)]">Les mots de passe ne correspondent pas.</p>
              )}
              {error && <p className="text-xs text-[var(--accent-red)]">{error}</p>}
              <button
                disabled={loading || password.length < 8 || password !== confirmPassword}
                onClick={handleSubmit}
                className={`w-full py-3 rounded-lg border-none font-bold text-[0.95rem] transition-colors disabled:cursor-not-allowed ${
                  password.length >= 8 && password === confirmPassword && !loading
                    ? "bg-[var(--accent-green)] text-black cursor-pointer"
                    : "bg-[var(--border)] text-[var(--text-muted)] cursor-not-allowed"
                }`}
              >
                {loading ? "Enregistrement..." : "Changer le mot de passe"}
              </button>
            </div>
          ) : (
            <button
              onClick={() => router.push("/auth/login")}
              className="w-full py-3 rounded-lg border-none font-bold text-[0.95rem] bg-[var(--accent-green)] text-black cursor-pointer hover:opacity-90 transition-opacity"
            >
              Se connecter
            </button>
          )}
        </div>

        <p className="text-center text-sm mt-5">
          <Link href="/auth/login" className="text-[var(--accent-green)] font-semibold no-underline hover:underline">
            ← Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  );
}

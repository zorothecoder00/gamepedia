"use client";
import Link from "next/link";
import { useState } from "react";
import { useMutation } from "@/hooks/useMutation";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const { mutate, loading } = useMutation("/api/auth/password/reset");

  const handleSend = async () => {
    if (!email) return;
    await mutate({ email });
    setSent(true);
  };

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-6 py-8">
      <div className="w-full max-w-[400px]">

        <div className="text-center mb-8">
          <div className="text-[2.5rem] mb-3">{sent ? "📬" : "🔑"}</div>
          <h1 className="text-[1.375rem] font-bold text-[var(--text-primary)] mb-1">
            {sent ? "Email envoyé !" : "Mot de passe oublié"}
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            {sent
              ? `Un lien de réinitialisation a été envoyé à ${email}`
              : "Entrez votre email pour recevoir un lien de réinitialisation"}
          </p>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-8">
          {!sent ? (
            <div className="flex flex-col gap-[1.125rem]">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Adresse email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="votre@email.com"
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border)] focus:border-[var(--accent-green)] rounded-lg text-[var(--text-primary)] px-3.5 py-2.5 text-[0.9rem] outline-none box-border"
                />
              </div>
              <button
                disabled={!email || loading}
                onClick={handleSend}
                className={`w-full py-3 rounded-lg border-none font-bold text-[0.95rem] transition-colors disabled:cursor-not-allowed ${email && !loading ? "bg-[var(--accent-green)] text-black cursor-pointer" : "bg-[var(--border)] text-[var(--text-muted)] cursor-not-allowed"}`}
              >
                {loading ? "Envoi..." : "Envoyer le lien"}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="bg-[rgba(0,230,118,0.08)] border border-[rgba(0,230,118,0.25)] rounded-lg p-4 text-[var(--accent-green)] text-sm text-center">
                Vérifiez votre boîte mail et cliquez sur le lien reçu.
              </div>
              <button
                onClick={() => setSent(false)}
                className="w-full py-2.5 rounded-lg border border-[var(--border)] bg-transparent text-[var(--text-secondary)] text-sm cursor-pointer hover:text-[var(--text-primary)] transition-colors"
              >
                Renvoyer l&apos;email
              </button>
            </div>
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

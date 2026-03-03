"use client";
import Link from "next/link";
import { useState } from "react";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <div
      style={{
        minHeight: "calc(100vh - 120px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1.5rem",
      }}
    >
      <div style={{ width: "100%", maxWidth: "400px" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>{sent ? "📬" : "🔑"}</div>
          <h1 style={{ color: "var(--text-primary)", fontSize: "1.375rem", fontWeight: 700, marginBottom: "0.25rem" }}>
            {sent ? "Email envoyé !" : "Mot de passe oublié"}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
            {sent
              ? `Un lien de réinitialisation a été envoyé à ${email}`
              : "Entrez votre email pour recevoir un lien de réinitialisation"}
          </p>
        </div>

        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "14px",
            padding: "2rem",
          }}
        >
          {!sent ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}>
              <div>
                <label style={{ display: "block", color: "var(--text-secondary)", fontSize: "0.85rem", fontWeight: 500, marginBottom: "0.4rem" }}>
                  Adresse email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  style={{
                    width: "100%",
                    background: "var(--bg-primary)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    color: "var(--text-primary)",
                    padding: "0.625rem 0.875rem",
                    fontSize: "0.9rem",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--accent-green)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                />
              </div>

              <button
                onClick={() => email && setSent(true)}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  border: "none",
                  background: email ? "var(--accent-green)" : "var(--border)",
                  color: email ? "#000" : "var(--text-muted)",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  cursor: email ? "pointer" : "not-allowed",
                }}
                disabled={!email}
              >
                Envoyer le lien
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div
                style={{
                  background: "rgba(0,230,118,0.08)",
                  border: "1px solid rgba(0,230,118,0.25)",
                  borderRadius: "8px",
                  padding: "1rem",
                  color: "var(--accent-green)",
                  fontSize: "0.85rem",
                  textAlign: "center",
                }}
              >
                Vérifiez votre boîte mail et cliquez sur le lien reçu.
              </div>
              <button
                onClick={() => setSent(false)}
                style={{
                  width: "100%",
                  padding: "0.625rem",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  background: "transparent",
                  color: "var(--text-secondary)",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                }}
              >
                Renvoyer l&apos;email
              </button>
            </div>
          )}
        </div>

        <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "1.25rem" }}>
          <Link href="/auth/login" style={{ color: "var(--accent-green)", fontWeight: 600, textDecoration: "none" }}>
            ← Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  );
}

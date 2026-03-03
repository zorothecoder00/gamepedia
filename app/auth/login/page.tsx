"use client";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div
      style={{
        minHeight: "calc(100vh - 120px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1.5rem",
        background: "radial-gradient(ellipse at 50% 0%, rgba(0,230,118,0.06) 0%, transparent 60%)",
      }}
    >
      <div style={{ width: "100%", maxWidth: "420px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <span
              style={{
                background: "linear-gradient(135deg, var(--accent-green), var(--accent-blue))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                fontWeight: 900,
                fontSize: "1.5rem",
              }}
            >
              GamePedia
            </span>
            <span style={{ background: "var(--accent-gold)", color: "#000", fontSize: "0.7rem", fontWeight: 700, padding: "1px 6px", borderRadius: "3px" }}>
              TG
            </span>
          </div>
          <h1 style={{ color: "var(--text-primary)", fontSize: "1.375rem", fontWeight: 700, marginBottom: "0.25rem" }}>
            Connexion
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
            Bienvenue ! Connectez-vous à votre compte.
          </p>
        </div>

        {/* Form card */}
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "14px",
            padding: "2rem",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}>
            {/* Email */}
            <div>
              <label style={{ display: "block", color: "var(--text-secondary)", fontSize: "0.85rem", fontWeight: 500, marginBottom: "0.4rem" }}>
                Email ou pseudo
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="exemple@email.com"
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

            {/* Password */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                <label style={{ color: "var(--text-secondary)", fontSize: "0.85rem", fontWeight: 500 }}>
                  Mot de passe
                </label>
                <Link href="/auth/reset-password" style={{ color: "var(--accent-blue)", fontSize: "0.78rem", textDecoration: "none" }}>
                  Mot de passe oublié ?
                </Link>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  style={{
                    width: "100%",
                    background: "var(--bg-primary)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    color: "var(--text-primary)",
                    padding: "0.625rem 2.5rem 0.625rem 0.875rem",
                    fontSize: "0.9rem",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--accent-green)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "0.75rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    padding: 0,
                  }}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={form.remember}
                onChange={(e) => setForm({ ...form, remember: e.target.checked })}
                style={{ accentColor: "var(--accent-green)", width: "16px", height: "16px" }}
              />
              <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>Se souvenir de moi</span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "8px",
                border: "none",
                background: "var(--accent-green)",
                color: "#000",
                fontWeight: 700,
                fontSize: "0.95rem",
                cursor: "pointer",
                transition: "opacity 0.15s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "0.9")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "1")}
            >
              Se connecter
            </button>
          </div>
        </div>

        {/* Register link */}
        <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "1.25rem" }}>
          Pas encore de compte ?{" "}
          <Link href="/auth/register" style={{ color: "var(--accent-green)", fontWeight: 600, textDecoration: "none" }}>
            S&apos;inscrire gratuitement
          </Link>
        </p>
      </div>
    </div>
  );
}

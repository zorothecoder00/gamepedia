"use client";
import Link from "next/link";
import { useState } from "react";

const cities = ["Lomé", "Kara", "Sokodé", "Atakpamé", "Dapaong", "Tsévié", "Kpalimé", "Autre"];

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    email: "", username: "", password: "", confirmPassword: "",
    city: "", acceptTerms: false,
  });

  const update = (field: string, value: string | boolean) => setForm({ ...form, [field]: value });

  return (
    <div
      style={{
        minHeight: "calc(100vh - 120px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1.5rem",
        background: "radial-gradient(ellipse at 50% 0%, rgba(79,195,247,0.06) 0%, transparent 60%)",
      }}
    >
      <div style={{ width: "100%", maxWidth: "460px" }}>
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
            Créer un compte
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
            Rejoignez la communauté esport togolaise
          </p>
        </div>

        {/* Step indicator */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
          {[1, 2].map((s) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: step >= s ? "var(--accent-green)" : "var(--bg-card)",
                  border: `1px solid ${step >= s ? "var(--accent-green)" : "var(--border)"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: step >= s ? "#000" : "var(--text-muted)",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                }}
              >
                {s}
              </div>
              {s < 2 && <div style={{ width: "40px", height: "1px", background: step > s ? "var(--accent-green)" : "var(--border)" }} />}
            </div>
          ))}
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
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}>
              <h2 style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "1rem", marginBottom: "0.25rem" }}>
                Informations de compte
              </h2>

              <FormField
                label="Adresse email"
                type="email"
                value={form.email}
                onChange={(v) => update("email", v)}
                placeholder="votre@email.com"
              />
              <FormField
                label="Pseudo (nom affiché)"
                type="text"
                value={form.username}
                onChange={(v) => update("username", v)}
                placeholder="MonPseudo"
                hint="Sera visible publiquement"
              />
              <FormField
                label="Mot de passe"
                type="password"
                value={form.password}
                onChange={(v) => update("password", v)}
                placeholder="Minimum 8 caractères"
              />
              <FormField
                label="Confirmer le mot de passe"
                type="password"
                value={form.confirmPassword}
                onChange={(v) => update("confirmPassword", v)}
                placeholder="Répétez le mot de passe"
              />

              <button
                onClick={() => setStep(2)}
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
                  marginTop: "0.25rem",
                }}
              >
                Continuer →
              </button>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}>
              <h2 style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "1rem", marginBottom: "0.25rem" }}>
                Profil joueur (optionnel)
              </h2>

              {/* City */}
              <div>
                <label style={{ display: "block", color: "var(--text-secondary)", fontSize: "0.85rem", fontWeight: 500, marginBottom: "0.4rem" }}>
                  Ville
                </label>
                <select
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  style={{
                    width: "100%",
                    background: "var(--bg-primary)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    color: form.city ? "var(--text-primary)" : "var(--text-muted)",
                    padding: "0.625rem 0.875rem",
                    fontSize: "0.9rem",
                    outline: "none",
                  }}
                >
                  <option value="">Sélectionner votre ville</option>
                  {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Terms */}
              <label style={{ display: "flex", alignItems: "flex-start", gap: "0.625rem", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={form.acceptTerms}
                  onChange={(e) => update("acceptTerms", e.target.checked)}
                  style={{ accentColor: "var(--accent-green)", width: "16px", height: "16px", marginTop: "2px", flexShrink: 0 }}
                />
                <span style={{ color: "var(--text-secondary)", fontSize: "0.82rem", lineHeight: 1.5 }}>
                  J&apos;accepte les{" "}
                  <a href="#" style={{ color: "var(--accent-green)", textDecoration: "none" }}>conditions d&apos;utilisation</a>
                  {" "}et la{" "}
                  <a href="#" style={{ color: "var(--accent-green)", textDecoration: "none" }}>politique de confidentialité</a>
                </span>
              </label>

              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button
                  onClick={() => setStep(1)}
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    background: "var(--bg-primary)",
                    color: "var(--text-secondary)",
                    fontWeight: 500,
                    fontSize: "0.9rem",
                    cursor: "pointer",
                  }}
                >
                  ← Retour
                </button>
                <button
                  style={{
                    flex: 2,
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: "none",
                    background: form.acceptTerms ? "var(--accent-green)" : "var(--border)",
                    color: form.acceptTerms ? "#000" : "var(--text-muted)",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    cursor: form.acceptTerms ? "pointer" : "not-allowed",
                  }}
                  disabled={!form.acceptTerms}
                >
                  Créer mon compte
                </button>
              </div>
            </div>
          )}
        </div>

        <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "1.25rem" }}>
          Déjà un compte ?{" "}
          <Link href="/auth/login" style={{ color: "var(--accent-green)", fontWeight: 600, textDecoration: "none" }}>
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}

function FormField({
  label, type, value, onChange, placeholder, hint,
}: {
  label: string; type: string; value: string;
  onChange: (v: string) => void; placeholder: string; hint?: string;
}) {
  return (
    <div>
      <label style={{ display: "block", color: "var(--text-secondary)", fontSize: "0.85rem", fontWeight: 500, marginBottom: "0.4rem" }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
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
      {hint && <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginTop: "0.25rem" }}>{hint}</p>}
    </div>
  );
}

"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@/hooks/useMutation";

const cities = ["Lomé", "Kara", "Sokodé", "Atakpamé", "Dapaong", "Tsévié", "Kpalimé", "Autre"];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    email: "", username: "", password: "", confirmPassword: "", city: "", acceptTerms: false,
  });
  const { mutate, loading } = useMutation("/api/auth/register");

  const update = (field: string, value: string | boolean) => setForm({ ...form, [field]: value });

  const handleRegister = async () => {
    const result = await mutate({ email: form.email, username: form.username, password: form.password });
    if (result) router.push("/auth/verify-email");
  };

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-6 py-8 bg-[radial-gradient(ellipse_at_50%_0%,rgba(79,195,247,0.06)_0%,transparent_60%)]">
      <div className="w-full max-w-[460px]">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="font-black text-2xl bg-gradient-to-br from-[var(--accent-green)] to-[var(--accent-blue)] bg-clip-text text-transparent">
              GamePedia
            </span>
            <span className="bg-[var(--accent-gold)] text-black text-[0.7rem] font-bold px-1.5 py-0.5 rounded">TG</span>
          </div>
          <h1 className="text-[1.375rem] font-bold text-[var(--text-primary)] mb-1">Créer un compte</h1>
          <p className="text-sm text-[var(--text-muted)]">Rejoignez la communauté esport togolaise</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[0.8rem] border ${step >= s ? "bg-[var(--accent-green)] border-[var(--accent-green)] text-black" : "bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-muted)]"}`}>
                {s}
              </div>
              {s < 2 && <div className={`w-10 h-px ${step > s ? "bg-[var(--accent-green)]" : "bg-[var(--border)]"}`} />}
            </div>
          ))}
        </div>

        {/* Form card */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-8">
          {step === 1 && (
            <div className="flex flex-col gap-[1.125rem]">
              <h2 className="text-base font-semibold text-[var(--text-primary)] mb-1">Informations de compte</h2>
              <FormField label="Adresse email" type="email" value={form.email} onChange={(v) => update("email", v)} placeholder="votre@email.com" />
              <FormField label="Pseudo (nom affiché)" type="text" value={form.username} onChange={(v) => update("username", v)} placeholder="MonPseudo" hint="Sera visible publiquement" />
              <FormField label="Mot de passe" type="password" value={form.password} onChange={(v) => update("password", v)} placeholder="Minimum 8 caractères" />
              <FormField label="Confirmer le mot de passe" type="password" value={form.confirmPassword} onChange={(v) => update("confirmPassword", v)} placeholder="Répétez le mot de passe" />
              <button
                onClick={() => setStep(2)}
                className="w-full py-3 rounded-lg border-none font-bold text-[0.95rem] cursor-pointer mt-1 bg-[var(--accent-green)] text-black"
              >
                Continuer →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-[1.125rem]">
              <h2 className="text-base font-semibold text-[var(--text-primary)] mb-1">Profil joueur (optionnel)</h2>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Ville</label>
                <select
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  className={`w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-3.5 py-2.5 text-[0.9rem] outline-none ${form.city ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"}`}
                >
                  <option value="">Sélectionner votre ville</option>
                  {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.acceptTerms}
                  onChange={(e) => update("acceptTerms", e.target.checked)}
                  className="accent-[var(--accent-green)] w-4 h-4 mt-0.5 shrink-0"
                />
                <span className="text-[0.82rem] text-[var(--text-secondary)] leading-relaxed">
                  J&apos;accepte les{" "}
                  <a href="#" className="text-[var(--accent-green)] no-underline hover:underline">conditions d&apos;utilisation</a>
                  {" "}et la{" "}
                  <a href="#" className="text-[var(--accent-green)] no-underline hover:underline">politique de confidentialité</a>
                </span>
              </label>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-secondary)] font-medium text-[0.9rem] cursor-pointer"
                >
                  ← Retour
                </button>
                <button
                  disabled={!form.acceptTerms || loading}
                  onClick={handleRegister}
                  className={`flex-[2] py-3 rounded-lg border-none font-bold text-[0.95rem] transition-opacity disabled:cursor-not-allowed ${form.acceptTerms && !loading ? "bg-[var(--accent-green)] text-black cursor-pointer" : "bg-[var(--border)] text-[var(--text-muted)] cursor-not-allowed"}`}
                >
                  {loading ? "Création..." : "Créer mon compte"}
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-[var(--text-muted)] mt-5">
          Déjà un compte ?{" "}
          <Link href="/auth/login" className="text-[var(--accent-green)] font-semibold no-underline hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}

function FormField({ label, type, value, onChange, placeholder, hint }: {
  label: string; type: string; value: string;
  onChange: (v: string) => void; placeholder: string; hint?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[var(--bg-primary)] border border-[var(--border)] focus:border-[var(--accent-green)] rounded-lg text-[var(--text-primary)] px-3.5 py-2.5 text-[0.9rem] outline-none box-border"
      />
      {hint && <p className="text-[0.75rem] text-[var(--text-muted)] mt-1">{hint}</p>}
    </div>
  );
}

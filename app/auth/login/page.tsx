"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@/hooks/useMutation";

interface LoginResponse {
  token: string;
  user: { id: string; email: string; username: string; role: string };
}

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [showPassword, setShowPassword] = useState(false);
  const { mutate, loading } = useMutation<LoginResponse>("/api/auth/login");

  const handleSubmit = async () => {
    const result = await mutate({ email: form.email, password: form.password });
    if (result) {
      localStorage.setItem("gp_token", result.token);
      localStorage.setItem("gp_user", JSON.stringify(result.user));
      router.push("/profile");
    }
  };

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-6 py-8 bg-[radial-gradient(ellipse_at_50%_0%,rgba(0,230,118,0.06)_0%,transparent_60%)]">
      <div className="w-full max-w-[420px]">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="font-black text-2xl bg-gradient-to-br from-[var(--accent-green)] to-[var(--accent-blue)] bg-clip-text text-transparent">
              GamePedia
            </span>
            <span className="bg-[var(--accent-gold)] text-black text-[0.7rem] font-bold px-1.5 py-0.5 rounded">TG</span>
          </div>
          <h1 className="text-[1.375rem] font-bold text-[var(--text-primary)] mb-1">Connexion</h1>
          <p className="text-sm text-[var(--text-muted)]">Bienvenue ! Connectez-vous à votre compte.</p>
        </div>

        {/* Form card */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-8">
          <div className="flex flex-col gap-[1.125rem]">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Email ou pseudo</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="exemple@email.com"
                className="w-full bg-[var(--bg-primary)] border border-[var(--border)] focus:border-[var(--accent-green)] rounded-lg text-[var(--text-primary)] px-3.5 py-2.5 text-[0.9rem] outline-none box-border"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-medium text-[var(--text-secondary)]">Mot de passe</label>
                <Link href="/auth/reset-password" className="text-[var(--accent-blue)] text-[0.78rem] no-underline hover:underline">
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  placeholder="••••••••"
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border)] focus:border-[var(--accent-green)] rounded-lg text-[var(--text-primary)] pl-3.5 pr-10 py-2.5 text-[0.9rem] outline-none box-border"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none text-[var(--text-muted)] cursor-pointer text-sm p-0"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.remember}
                onChange={(e) => setForm({ ...form, remember: e.target.checked })}
                className="accent-[var(--accent-green)] w-4 h-4"
              />
              <span className="text-sm text-[var(--text-secondary)]">Se souvenir de moi</span>
            </label>

            {/* Submit */}
            <button
              type="button"
              disabled={loading}
              onClick={handleSubmit}
              className="w-full py-3 rounded-lg border-none font-bold text-[0.95rem] cursor-pointer transition-opacity disabled:opacity-50 disabled:cursor-not-allowed bg-[var(--accent-green)] text-black"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </div>
        </div>

        {/* Register link */}
        <p className="text-center text-sm text-[var(--text-muted)] mt-5">
          Pas encore de compte ?{" "}
          <Link href="/auth/register" className="text-[var(--accent-green)] font-semibold no-underline hover:underline">
            S&apos;inscrire gratuitement
          </Link>
        </p>
      </div>
    </div>
  );
}

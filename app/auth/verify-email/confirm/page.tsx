"use client";
import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation } from "@/hooks/useMutation";

export default function VerifyEmailConfirmPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailConfirmContent />
    </Suspense>
  );
}

function VerifyEmailConfirmContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { mutate, error } = useMutation("/api/auth/email/verify");
  const [status, setStatus] = useState<"pending" | "success" | "error">("pending");
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current || !token) return;
    attempted.current = true;
    mutate({ token }).then((result) => setStatus(result ? "success" : "error"));
  }, [token, mutate]);

  const icon = status === "success" ? "✅" : status === "error" ? "❌" : "⏳";
  const title = status === "success"
    ? "Email vérifié !"
    : status === "error"
      ? "Lien invalide"
      : "Vérification en cours...";
  const message = status === "success"
    ? "Votre adresse email est confirmée. Vous pouvez maintenant vous connecter."
    : status === "error"
      ? (error ?? "Ce lien de vérification est invalide ou a expiré.")
      : "Un instant, nous vérifions votre lien.";

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-6 py-8">
      <div className="w-full max-w-[420px] text-center">
        <div className="text-[3.5rem] mb-4">{!token ? "❌" : icon}</div>
        <h1 className="text-2xl font-black text-[var(--text-primary)] mb-2">
          {!token ? "Lien invalide" : title}
        </h1>
        <p className="text-[0.9rem] text-[var(--text-secondary)] leading-relaxed mb-6">
          {!token ? "Aucun token de vérification fourni." : message}
        </p>

        {status === "error" && (
          <Link
            href="/auth/verify-email"
            className="inline-block px-6 py-2.5 rounded-lg border border-[var(--accent-green)] bg-transparent text-[var(--accent-green)] font-semibold text-sm no-underline hover:bg-[rgba(0,230,118,0.08)] transition-colors mb-6"
          >
            Redemander un lien
          </Link>
        )}

        <div>
          <Link href="/auth/login" className="text-sm text-[var(--text-muted)] no-underline hover:text-[var(--text-secondary)] transition-colors">
            ← Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
}

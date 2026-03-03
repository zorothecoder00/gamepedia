import Link from "next/link";

export default function VerifyEmailPage() {
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
      <div style={{ width: "100%", maxWidth: "420px", textAlign: "center" }}>
        <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>✉️</div>
        <h1 style={{ color: "var(--text-primary)", fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem" }}>
          Vérifiez votre email
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
          Un email de vérification a été envoyé à votre adresse. Cliquez sur le lien dans l&apos;email pour activer votre compte.
        </p>

        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "12px",
            padding: "1.5rem",
            marginBottom: "1.5rem",
          }}
        >
          <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1rem" }}>
            Vous n&apos;avez pas reçu l&apos;email ?
          </div>
          <button
            style={{
              padding: "0.625rem 1.5rem",
              borderRadius: "7px",
              border: "1px solid var(--accent-green)",
              background: "transparent",
              color: "var(--accent-green)",
              fontWeight: 600,
              fontSize: "0.88rem",
              cursor: "pointer",
            }}
          >
            Renvoyer l&apos;email
          </button>
        </div>

        <Link href="/auth/login" style={{ color: "var(--text-muted)", fontSize: "0.85rem", textDecoration: "none" }}>
          ← Retour à la connexion
        </Link>
      </div>
    </div>
  );
}

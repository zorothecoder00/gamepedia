"use client";
import { useState } from "react";
import Link from "next/link";
import GameTag from "../components/GameTag";
import { useApi } from "@/hooks/useApi";

interface Game {
  id: string; slug: string; name: string; genre: string; format: string;
  platforms: string[]; description: string; color: string; logoUrl: string | null;
  _count: { playerProfiles: number; tournaments: number };
}

const PLATFORMS = ["Tous", "PC", "Mobile", "Console"];

export default function GamesPage() {
  const [filter, setFilter] = useState("Tous");
  const { data: games, loading } = useApi<Game[]>("/api/games");

  const filtered = filter === "Tous"
    ? (games ?? [])
    : (games ?? []).filter((g) => g.platforms?.includes(filter));

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-[2rem] font-black text-[var(--text-primary)] mb-2">Catalogue des Jeux</h1>
        <p className="text-[0.95rem] text-[var(--text-secondary)]">
          {loading ? "Chargement..." : `${games?.length ?? 0} jeux actifs sur la plateforme GamePedia TG`}
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-8 flex-wrap items-center">
        <span className="text-sm text-[var(--text-muted)] mr-1">Plateforme :</span>
        {PLATFORMS.map((p) => (
          <button
            key={p}
            onClick={() => setFilter(p)}
            className={`px-3.5 py-1.5 rounded-lg border border-[var(--border)] text-sm cursor-pointer transition-colors ${filter === p ? "bg-[var(--accent-green)] text-black font-semibold" : "bg-[var(--bg-card)] text-[var(--text-secondary)] font-normal"}`}
          >
            {p}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-[var(--text-muted)]">Chargement des jeux...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-[var(--text-muted)]">Aucun jeu disponible.</div>
      ) : (
        <div className="grid gap-5 [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">
          {filtered.map((game) => (
            <Link key={game.slug} href={`/games/${game.slug}`} className="no-underline">
              <div
                className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden cursor-pointer transition-all duration-150 hover:-translate-y-0.5"
              >
                {/* Banner */}
                <div
                  className="h-20 flex items-center justify-center text-[2.5rem]"
                  style={{
                    background: `linear-gradient(135deg, ${game.color ?? "#333"}22, ${game.color ?? "#333"}08)`,
                    borderBottom: `1px solid ${game.color ?? "#333"}33`,
                  }}
                >
                  {game.logoUrl
                    ? <img src={game.logoUrl} alt={game.name} className="w-12 h-12 object-contain" />
                    : "🎮"}
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-bold text-[var(--text-primary)]">{game.name}</h3>
                    <GameTag name={game.genre} color={game.color} />
                  </div>
                  <p className="text-[0.82rem] text-[var(--text-muted)] leading-relaxed mb-4">{game.description}</p>
                  <div className="flex gap-1.5 mb-4 flex-wrap">
                    {(game.platforms ?? []).map((p) => (
                      <span key={p} className="bg-[var(--bg-primary)] border border-[var(--border)] rounded px-1.5 text-[0.7rem] text-[var(--text-muted)]">{p}</span>
                    ))}
                  </div>
                  <div className="flex gap-4 pt-3 border-t border-[var(--border)]">
                    <div>
                      <div className="font-bold text-[1.1rem]" style={{ color: game.color ?? "var(--accent-green)" }}>{game._count.playerProfiles}</div>
                      <div className="text-[0.7rem] text-[var(--text-muted)]">Joueurs</div>
                    </div>
                    <div>
                      <div className="font-bold text-[1.1rem] text-[var(--accent-gold)]">{game._count.tournaments}</div>
                      <div className="text-[0.7rem] text-[var(--text-muted)]">Tournois</div>
                    </div>
                    <div className="ml-auto self-center">
                      <span className="text-[0.8rem] font-semibold" style={{ color: game.color ?? "var(--accent-green)" }}>Voir →</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

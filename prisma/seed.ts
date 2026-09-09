// ============================================================
// GAMEPEDIA TG — Seed de démonstration
//
// Peuple chaque modèle du schéma avec des données réalistes pour
// permettre une vérification manuelle de toutes les fonctionnalités
// (auth, admin, tournois, bracket, classements, wagers dans tous
// leurs statuts, notifications...).
//
// Idempotent par sortie anticipée : si "Valorant" existe déjà, le
// script ne fait rien (évite de dupliquer/planter sur un re-run).
// Ne peuple pas EmailVerificationToken/PasswordResetToken : ce sont
// des tokens à usage unique dont la valeur brute n'est de toute
// façon jamais récupérable une fois hashée, donc sans intérêt en seed.
//
// Lancer avec : npx prisma db seed
// ============================================================

import "dotenv/config";
import bcrypt from "bcryptjs";
import { db } from "../lib/prisma";

const PASSWORD = "Password123!";

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function main() {
  const already = await db.game.findUnique({ where: { slug: "valorant" } });
  if (already) {
    console.log("Seed déjà appliqué (le jeu 'valorant' existe) — rien à faire.");
    return;
  }

  const passwordHash = await hashPassword(PASSWORD);

  // ── Jeux ─────────────────────────────────────────────────────
  const valorant = await db.game.create({
    data: {
      name: "Valorant",
      slug: "valorant",
      description: "FPS tactique 5v5 par Riot Games.",
      genre: "FPS",
      format: "FIVE_VS_FIVE",
      platforms: "PC",
      publisher: "Riot Games",
    },
  });
  const fifa = await db.game.create({
    data: {
      name: "FIFA 25",
      slug: "fifa-25",
      description: "Simulation de football par EA Sports.",
      genre: "Sports",
      format: "ONE_VS_ONE",
      platforms: "PC,Console",
      publisher: "EA Sports",
    },
  });
  const freeFire = await db.game.create({
    data: {
      name: "Free Fire",
      slug: "free-fire",
      description: "Battle royale mobile par Garena.",
      genre: "Battle Royale",
      format: "BATTLE_ROYALE",
      platforms: "Mobile",
      publisher: "Garena",
    },
  });
  const mobileLegends = await db.game.create({
    data: {
      name: "Mobile Legends",
      slug: "mobile-legends",
      description: "MOBA mobile par Moonton.",
      genre: "MOBA",
      format: "MOBA",
      platforms: "Mobile",
      publisher: "Moonton",
    },
  });

  // ── Utilisateurs & joueurs ──────────────────────────────────
  const adminUser = await db.user.create({
    data: {
      email: "admin@gamepedia.tg",
      username: "admin",
      passwordHash,
      role: "ADMIN",
      emailVerifiedAt: new Date(),
    },
  });
  const modUser = await db.user.create({
    data: {
      email: "moderateur@gamepedia.tg",
      username: "moderateur",
      passwordHash,
      role: "MODERATOR",
      emailVerifiedAt: new Date(),
    },
  });

  interface PlayerSeed {
    key: string;
    username: string;
    email: string;
    pseudo: string;
    firstName: string;
    lastName: string;
    city: string;
    region: string;
    bio: string;
    isVerified: boolean;
    trustScore: number;
    acceptedWagerCgu: boolean;
    isAdult: boolean;
    isActive: boolean;
    emailVerified: boolean;
  }

  const playerSeeds: PlayerSeed[] = [
    {
      key: "phantom",
      username: "phantom_tg",
      email: "phantom.tg@example.com",
      pseudo: "Phantom_TG",
      firstName: "Kokou",
      lastName: "Amegan",
      city: "Lomé",
      region: "Maritime",
      bio: "Duelist Valorant, capitaine de Togo Esports. Champion Valorant Open Togo 2026.",
      isVerified: true,
      trustScore: 100,
      acceptedWagerCgu: true,
      isAdult: true,
      isActive: true,
      emailVerified: true,
    },
    {
      key: "queen",
      username: "queenkoffi",
      email: "queen.koffi@example.com",
      pseudo: "QueenKoffi",
      firstName: "Ama",
      lastName: "Koffi",
      city: "Lomé",
      region: "Maritime",
      bio: "Entry fragger, membre de Togo Esports. Aussi active en FIFA.",
      isVerified: true,
      trustScore: 100,
      acceptedWagerCgu: true,
      isAdult: true,
      isActive: true,
      emailVerified: true,
    },
    {
      key: "sokode",
      username: "sokodefury",
      email: "sokode.fury@example.com",
      pseudo: "SokodeFury",
      firstName: "Yawo",
      lastName: "Mensah",
      city: "Sokodé",
      region: "Centrale",
      bio: "Support Valorant chez Lomé Gaming.",
      isVerified: false,
      trustScore: 100,
      acceptedWagerCgu: true,
      isAdult: true,
      isActive: true,
      emailVerified: false,
    },
    {
      key: "velox",
      username: "veloxtg",
      email: "velox.tg@example.com",
      pseudo: "VeloxTG",
      firstName: "Nadia",
      lastName: "Seddoh",
      city: "Kara",
      region: "Kara",
      bio: "Duelist chez Lomé Gaming.",
      isVerified: true,
      trustScore: 100,
      acceptedWagerCgu: true,
      isAdult: true,
      isActive: true,
      emailVerified: true,
    },
    {
      key: "kara",
      username: "karastorm",
      email: "kara.storm@example.com",
      pseudo: "KaraStorm",
      firstName: "Essi",
      lastName: "Adjovi",
      city: "Kara",
      region: "Kara",
      bio: "Joueuse Free Fire — compte de test avec score de confiance bas.",
      isVerified: true,
      trustScore: 30, // < MIN_TRUST_SCORE (50) — pour tester le blocage wager
      acceptedWagerCgu: true,
      isAdult: true,
      isActive: true,
      emailVerified: true,
    },
    {
      key: "atakpame",
      username: "atakpameace",
      email: "atakpame.ace@example.com",
      pseudo: "AtakpameAce",
      firstName: "Kossi",
      lastName: "Bako",
      city: "Atakpamé",
      region: "Plateaux",
      bio: "Joueur Mobile Legends — compte de test, CGU des paris non acceptées.",
      isVerified: true,
      trustScore: 100,
      acceptedWagerCgu: false, // pour tester le blocage wager (CGU)
      isAdult: true,
      isActive: true,
      emailVerified: true,
    },
    {
      key: "ghost",
      username: "lomeghost",
      email: "lome.ghost@example.com",
      pseudo: "LomeGhost",
      firstName: "Afi",
      lastName: "Dosseh",
      city: "Lomé",
      region: "Maritime",
      bio: "Joueuse Mobile Legends — compte de test, mineure (18+ non déclaré).",
      isVerified: true,
      trustScore: 100,
      acceptedWagerCgu: true,
      isAdult: false, // pour tester le blocage wager (18+)
      isActive: true,
      emailVerified: true,
    },
    {
      key: "titan",
      username: "titanovo",
      email: "titan.ovo@example.com",
      pseudo: "TitanOvo",
      firstName: "Komi",
      lastName: "Ayivor",
      city: "Kara",
      region: "Kara",
      bio: "Membre de Kara Legends — compte de test, actuellement suspendu.",
      isVerified: true,
      trustScore: 90,
      acceptedWagerCgu: true,
      isAdult: true,
      isActive: false, // suspendu (voir Suspension plus bas)
      emailVerified: true,
    },
  ];

  const players: Record<string, { userId: string; playerId: string }> = {};
  for (const p of playerSeeds) {
    const user = await db.user.create({
      data: {
        email: p.email,
        username: p.username,
        passwordHash,
        role: "PLAYER",
        emailVerifiedAt: p.emailVerified ? new Date() : null,
      },
    });
    const player = await db.player.create({
      data: {
        userId: user.id,
        pseudo: p.pseudo,
        firstName: p.firstName,
        lastName: p.lastName,
        city: p.city,
        region: p.region,
        bio: p.bio,
        isActive: p.isActive,
        isVerified: p.isVerified,
        trustScore: p.trustScore,
        acceptedWagerCgu: p.acceptedWagerCgu,
        isAdult: p.isAdult,
        socialLinks: { discord: `${p.username}#0001`, twitter: `@${p.username}` },
      },
    });
    players[p.key] = { userId: user.id, playerId: player.id };
  }

  // ── Profils in-game ──────────────────────────────────────────
  await db.playerGameProfile.createMany({
    data: [
      { playerId: players.phantom.playerId, gameId: valorant.id, inGameName: "Phantom#TG1", rank: "Immortal" },
      { playerId: players.queen.playerId, gameId: valorant.id, inGameName: "QueenK#TG2", rank: "Diamond" },
      { playerId: players.sokode.playerId, gameId: valorant.id, inGameName: "SokodeFury#TG3", rank: "Platinum" },
      { playerId: players.velox.playerId, gameId: valorant.id, inGameName: "Velox#TG4", rank: "Diamond" },
      { playerId: players.phantom.playerId, gameId: fifa.id, inGameName: "PhantomFC" },
      { playerId: players.queen.playerId, gameId: fifa.id, inGameName: "QueenFC" },
      { playerId: players.sokode.playerId, gameId: fifa.id, inGameName: "SokodeFC" },
      { playerId: players.kara.playerId, gameId: freeFire.id, inGameName: "KaraStorm_FF", rank: "Heroic" },
      { playerId: players.titan.playerId, gameId: freeFire.id, inGameName: "TitanOvo_FF", rank: "Grandmaster" },
      { playerId: players.atakpame.playerId, gameId: mobileLegends.id, inGameName: "AtakAce_ML", rank: "Mythic" },
      { playerId: players.ghost.playerId, gameId: mobileLegends.id, inGameName: "GhostML", rank: "Legend" },
    ],
  });

  // ── Équipes ──────────────────────────────────────────────────
  const togoEsports = await db.team.create({
    data: {
      name: "Togo Esports",
      slug: "togo-esports",
      tag: "TGE",
      city: "Lomé",
      region: "Maritime",
      description: "Structure esport phare de Lomé, championne du Valorant Open Togo 2026.",
      foundedAt: new Date("2023-03-01"),
      socialLinks: { twitter: "@togoesports" },
    },
  });
  const lomeGaming = await db.team.create({
    data: {
      name: "Lomé Gaming",
      slug: "lome-gaming",
      tag: "LMG",
      city: "Lomé",
      region: "Maritime",
      description: "Équipe montante de la capitale.",
      foundedAt: new Date("2024-01-15"),
    },
  });
  const karaLegends = await db.team.create({
    data: {
      name: "Kara Legends",
      slug: "kara-legends",
      tag: "KRL",
      city: "Kara",
      region: "Kara",
      description: "Représentants de la région de la Kara.",
      foundedAt: new Date("2024-06-01"),
    },
  });
  const sokodeUnited = await db.team.create({
    data: {
      name: "Sokodé United",
      slug: "sokode-united",
      tag: "SKU",
      city: "Sokodé",
      region: "Centrale",
      description: "Club communautaire de Sokodé.",
      foundedAt: new Date("2024-09-01"),
    },
  });

  await db.teamMember.createMany({
    data: [
      { teamId: togoEsports.id, playerId: players.phantom.playerId, role: "IGL" },
      { teamId: togoEsports.id, playerId: players.queen.playerId, role: "Entry Fragger" },
      { teamId: lomeGaming.id, playerId: players.sokode.playerId, role: "Support" },
      { teamId: lomeGaming.id, playerId: players.velox.playerId, role: "Duelist" },
      { teamId: karaLegends.id, playerId: players.titan.playerId, role: "IGL" },
      { teamId: karaLegends.id, playerId: players.kara.playerId, role: "Support" },
      { teamId: sokodeUnited.id, playerId: players.atakpame.playerId, role: "Duelist" },
    ],
  });

  // ── Tournoi 1 : Valorant Open Togo (COMPLETED, avec bracket complet) ──
  const valorantOpen = await db.tournament.create({
    data: {
      name: "Valorant Open Togo",
      slug: "valorant-open-togo-2026",
      edition: 1,
      description: "Premier tournoi national Valorant ouvert aux équipes togolaises.",
      rules: "Format BO1 en demi-finale, BO3 en finale. Anti-cheat obligatoire.",
      format: "SINGLE_ELIMINATION",
      participantType: "TEAM",
      maxParticipants: 4,
      minParticipants: 4,
      tier: "A",
      location: "Lomé, Togo",
      venue: "Centre Culturel Français",
      isOnline: false,
      startDate: new Date("2026-07-10T09:00:00Z"),
      endDate: new Date("2026-07-12T18:00:00Z"),
      registrationDeadline: new Date("2026-07-01T00:00:00Z"),
      prizePool: 500000,
      currency: "XOF",
      prizeDistribution: { "1": 50, "2": 30, "3": 20 },
      status: "COMPLETED",
      organizerName: "GamePedia TG",
      streamUrl: "https://twitch.tv/gamepediatg",
      vodUrl: "https://youtube.com/watch?v=demo-valorant-open",
    },
  });
  await db.tournamentGame.create({ data: { tournamentId: valorantOpen.id, gameId: valorant.id } });

  await db.tournamentParticipant.createMany({
    data: [
      { tournamentId: valorantOpen.id, teamId: togoEsports.id, seed: 1, isConfirmed: true, finalPlacement: 1, prizeWon: 250000 },
      { tournamentId: valorantOpen.id, teamId: lomeGaming.id, seed: 2, isConfirmed: true, finalPlacement: 2, prizeWon: 150000 },
      { tournamentId: valorantOpen.id, teamId: karaLegends.id, seed: 3, isConfirmed: true, finalPlacement: 3, prizeWon: 100000 },
      { tournamentId: valorantOpen.id, teamId: sokodeUnited.id, seed: 4, isConfirmed: true, finalPlacement: 4, prizeWon: 0 },
    ],
  });

  const semis = await db.tournamentStage.create({
    data: { tournamentId: valorantOpen.id, name: "Demi-finale", stageNumber: 1, format: "SINGLE_ELIMINATION", bestOf: 1, isActive: false },
  });
  const final = await db.tournamentStage.create({
    data: { tournamentId: valorantOpen.id, name: "Finale", stageNumber: 2, format: "SINGLE_ELIMINATION", bestOf: 3, isActive: false },
  });

  const semi1 = await db.match.create({
    data: {
      stageId: semis.id, matchNumber: 1, round: 1, status: "COMPLETED",
      scheduledAt: new Date("2026-07-10T10:00:00Z"), startedAt: new Date("2026-07-10T10:05:00Z"), endedAt: new Date("2026-07-10T11:10:00Z"),
      notes: "Togo Esports domine sur Ascent.",
    },
  });
  await db.matchParticipant.createMany({
    data: [
      { matchId: semi1.id, teamId: togoEsports.id, score: 13, isWinner: true },
      { matchId: semi1.id, teamId: sokodeUnited.id, score: 4, isWinner: false },
    ],
  });

  const semi2 = await db.match.create({
    data: {
      stageId: semis.id, matchNumber: 2, round: 1, status: "COMPLETED",
      scheduledAt: new Date("2026-07-10T13:00:00Z"), startedAt: new Date("2026-07-10T13:05:00Z"), endedAt: new Date("2026-07-10T14:20:00Z"),
    },
  });
  await db.matchParticipant.createMany({
    data: [
      { matchId: semi2.id, teamId: lomeGaming.id, score: 13, isWinner: true },
      { matchId: semi2.id, teamId: karaLegends.id, score: 9, isWinner: false },
    ],
  });

  const finalMatch = await db.match.create({
    data: {
      stageId: final.id, matchNumber: 1, round: 1, status: "COMPLETED",
      scheduledAt: new Date("2026-07-12T15:00:00Z"), startedAt: new Date("2026-07-12T15:10:00Z"), endedAt: new Date("2026-07-12T17:45:00Z"),
      streamUrl: "https://twitch.tv/gamepediatg", vodUrl: "https://youtube.com/watch?v=demo-valorant-final",
      notes: "Finale disputée en 3 manches, Togo Esports remporte le trophée.",
    },
  });
  await db.matchParticipant.createMany({
    data: [
      { matchId: finalMatch.id, teamId: togoEsports.id, score: 2, isWinner: true },
      { matchId: finalMatch.id, teamId: lomeGaming.id, score: 1, isWinner: false },
    ],
  });

  await db.playerMatchPerformance.createMany({
    data: [
      { matchId: finalMatch.id, playerId: players.phantom.playerId, teamId: togoEsports.id, isMvp: true, stats: { kills: 24, deaths: 12, assists: 8, acs: 265, adr: 145, hs_percent: 32 } },
      { matchId: finalMatch.id, playerId: players.queen.playerId, teamId: togoEsports.id, isMvp: false, stats: { kills: 18, deaths: 14, assists: 11, acs: 210, adr: 120, hs_percent: 25 } },
      { matchId: finalMatch.id, playerId: players.sokode.playerId, teamId: lomeGaming.id, isMvp: false, stats: { kills: 15, deaths: 16, assists: 9, acs: 190, adr: 110, hs_percent: 22 } },
      { matchId: finalMatch.id, playerId: players.velox.playerId, teamId: lomeGaming.id, isMvp: false, stats: { kills: 20, deaths: 15, assists: 6, acs: 220, adr: 130, hs_percent: 29 } },
    ],
  });

  // ── Tournoi 2 : FIFA Solo Cup Lomé (COMPLETED, solo, sans bracket) ──
  const fifaCup = await db.tournament.create({
    data: {
      name: "FIFA Solo Cup Lomé",
      slug: "fifa-solo-cup-lome-2026",
      edition: 3,
      description: "Coupe individuelle FIFA 25, format aller simple.",
      format: "SINGLE_ELIMINATION",
      participantType: "SOLO",
      maxParticipants: 16,
      tier: "B",
      location: "Lomé, Togo",
      isOnline: true,
      startDate: new Date("2026-06-01T09:00:00Z"),
      endDate: new Date("2026-06-01T20:00:00Z"),
      registrationDeadline: new Date("2026-05-28T00:00:00Z"),
      prizePool: 100000,
      currency: "XOF",
      prizeDistribution: { "1": 60, "2": 40 },
      status: "COMPLETED",
      organizerName: "GamePedia TG",
    },
  });
  await db.tournamentGame.create({ data: { tournamentId: fifaCup.id, gameId: fifa.id } });
  await db.tournamentParticipant.createMany({
    data: [
      { tournamentId: fifaCup.id, playerId: players.phantom.playerId, seed: 1, isConfirmed: true, finalPlacement: 1, prizeWon: 60000 },
      { tournamentId: fifaCup.id, playerId: players.queen.playerId, seed: 2, isConfirmed: true, finalPlacement: 2, prizeWon: 40000 },
      { tournamentId: fifaCup.id, playerId: players.sokode.playerId, seed: 3, isConfirmed: true, finalPlacement: 3, prizeWon: 0 },
    ],
  });

  // ── Tournoi 3 : Free Fire Squad Battle (UPCOMING, sans bracket) ──
  const freeFireBattle = await db.tournament.create({
    data: {
      name: "Free Fire Squad Battle",
      slug: "free-fire-squad-battle-2026",
      edition: 1,
      description: "Tournoi par équipes de 4, plusieurs manches à points cumulés.",
      format: "SWISS",
      participantType: "TEAM",
      maxParticipants: 8,
      minParticipants: 4,
      tier: "C",
      location: "En ligne",
      isOnline: true,
      startDate: new Date("2026-10-15T14:00:00Z"),
      registrationDeadline: new Date("2026-10-10T00:00:00Z"),
      prizePool: 75000,
      currency: "XOF",
      status: "UPCOMING",
      organizerName: "GamePedia TG",
    },
  });
  await db.tournamentGame.create({ data: { tournamentId: freeFireBattle.id, gameId: freeFire.id } });
  await db.tournamentParticipant.createMany({
    data: [
      { tournamentId: freeFireBattle.id, teamId: karaLegends.id, isConfirmed: false },
      { tournamentId: freeFireBattle.id, teamId: sokodeUnited.id, isConfirmed: true },
    ],
  });

  // ── Saisons ──────────────────────────────────────────────────
  const valorantSeason = await db.season.create({
    data: { gameId: valorant.id, name: "Saison 1 - 2026", year: 2026, quarter: 1, startDate: new Date("2026-01-01"), isActive: true },
  });
  const fifaSeason = await db.season.create({
    data: { gameId: fifa.id, name: "Saison 1 - 2026", year: 2026, quarter: 1, startDate: new Date("2026-01-01"), isActive: true },
  });
  // Inactive : reste à activer depuis /admin/rankings (test du bouton "Activer")
  await db.season.create({
    data: { gameId: freeFire.id, name: "Saison 1 - 2026", year: 2026, quarter: 1, startDate: new Date("2026-01-01"), isActive: false },
  });

  // ── Règles de points ─────────────────────────────────────────
  await db.pointRule.createMany({
    data: [
      { gameId: valorant.id, placement: 1, tier: "A", pointsAwarded: 500, formatMultiplier: 1.5, description: "Vainqueur d'un tournoi tier A" },
      { gameId: valorant.id, placement: 2, tier: "A", pointsAwarded: 300, formatMultiplier: 1.5 },
      { gameId: valorant.id, placement: 3, tier: "A", pointsAwarded: 150, formatMultiplier: 1.5 },
      { gameId: valorant.id, placement: 4, tier: "A", pointsAwarded: 75, formatMultiplier: 1.5 },
      { gameId: fifa.id, placement: 1, tier: "B", pointsAwarded: 200, formatMultiplier: 1.0 },
      { gameId: fifa.id, placement: 2, tier: "B", pointsAwarded: 120, formatMultiplier: 1.0 },
      { gameId: fifa.id, placement: 3, tier: "B", pointsAwarded: 60, formatMultiplier: 1.0 },
      { gameId: freeFire.id, placement: 1, tier: "C", pointsAwarded: 80, formatMultiplier: 1.0 },
    ],
  });

  // ── Attributions de points ──────────────────────────────────
  await db.pointAttribution.createMany({
    data: [
      { tournamentId: valorantOpen.id, seasonId: valorantSeason.id, teamId: togoEsports.id, placement: 1, basePoints: 500, multiplier: 1.5, finalPoints: 750, prizeWon: 250000 },
      { tournamentId: valorantOpen.id, seasonId: valorantSeason.id, teamId: lomeGaming.id, placement: 2, basePoints: 300, multiplier: 1.5, finalPoints: 450, prizeWon: 150000 },
      { tournamentId: valorantOpen.id, seasonId: valorantSeason.id, teamId: karaLegends.id, placement: 3, basePoints: 150, multiplier: 1.5, finalPoints: 225, prizeWon: 100000 },
      { tournamentId: valorantOpen.id, seasonId: valorantSeason.id, teamId: sokodeUnited.id, placement: 4, basePoints: 75, multiplier: 1.5, finalPoints: 113 },
      { tournamentId: fifaCup.id, seasonId: fifaSeason.id, playerId: players.phantom.playerId, placement: 1, basePoints: 200, multiplier: 1.0, finalPoints: 200, prizeWon: 60000 },
      { tournamentId: fifaCup.id, seasonId: fifaSeason.id, playerId: players.queen.playerId, placement: 2, basePoints: 120, multiplier: 1.0, finalPoints: 120, prizeWon: 40000 },
      { tournamentId: fifaCup.id, seasonId: fifaSeason.id, playerId: players.sokode.playerId, placement: 3, basePoints: 60, multiplier: 1.0, finalPoints: 60 },
    ],
  });

  // ── Classements ──────────────────────────────────────────────
  await db.rankingEntry.createMany({
    data: [
      { gameId: valorant.id, seasonId: valorantSeason.id, teamId: togoEsports.id, totalPoints: 750, totalPrizeMoney: 250000, tournamentsPlayed: 1, wins: 1, top3Finishes: 1, rank: 1 },
      { gameId: valorant.id, seasonId: valorantSeason.id, teamId: lomeGaming.id, totalPoints: 450, totalPrizeMoney: 150000, tournamentsPlayed: 1, wins: 0, top3Finishes: 1, rank: 2 },
      { gameId: valorant.id, seasonId: valorantSeason.id, teamId: karaLegends.id, totalPoints: 225, totalPrizeMoney: 100000, tournamentsPlayed: 1, wins: 0, top3Finishes: 1, rank: 3 },
      { gameId: valorant.id, seasonId: valorantSeason.id, teamId: sokodeUnited.id, totalPoints: 113, totalPrizeMoney: 0, tournamentsPlayed: 1, wins: 0, top3Finishes: 0, rank: 4 },
      { gameId: valorant.id, seasonId: valorantSeason.id, playerId: players.phantom.playerId, totalPoints: 750, totalPrizeMoney: 250000, tournamentsPlayed: 1, wins: 1, top3Finishes: 1, rank: 1 },
      { gameId: valorant.id, seasonId: valorantSeason.id, playerId: players.queen.playerId, totalPoints: 750, totalPrizeMoney: 250000, tournamentsPlayed: 1, wins: 1, top3Finishes: 1, rank: 2 },
      { gameId: valorant.id, seasonId: valorantSeason.id, playerId: players.sokode.playerId, totalPoints: 450, totalPrizeMoney: 150000, tournamentsPlayed: 1, wins: 0, top3Finishes: 1, rank: 3 },
      { gameId: valorant.id, seasonId: valorantSeason.id, playerId: players.velox.playerId, totalPoints: 450, totalPrizeMoney: 150000, tournamentsPlayed: 1, wins: 0, top3Finishes: 1, rank: 4 },
      { gameId: fifa.id, seasonId: fifaSeason.id, playerId: players.phantom.playerId, totalPoints: 200, totalPrizeMoney: 60000, tournamentsPlayed: 1, wins: 1, top3Finishes: 1, rank: 1 },
      { gameId: fifa.id, seasonId: fifaSeason.id, playerId: players.queen.playerId, totalPoints: 120, totalPrizeMoney: 40000, tournamentsPlayed: 1, wins: 0, top3Finishes: 1, rank: 2 },
      { gameId: fifa.id, seasonId: fifaSeason.id, playerId: players.sokode.playerId, totalPoints: 60, totalPrizeMoney: 0, tournamentsPlayed: 1, wins: 0, top3Finishes: 1, rank: 3 },
    ],
  });

  // ── Achievements ─────────────────────────────────────────────
  const achPremierSang = await db.achievement.create({
    data: { name: "Premier Sang", description: "Remporter votre premier défi entre joueurs.", icon: "🩸", category: "Milestone", rarity: "Rare" },
  });
  const achChampion = await db.achievement.create({
    data: { name: "Champion National", description: "Remporter un tournoi de tier S ou A.", icon: "🏆", category: "Palmares", rarity: "Légendaire" },
  });
  await db.achievement.create({
    data: { name: "Vétéran", description: "Participer à 10 tournois.", icon: "🎖️", category: "Participation", rarity: "Commun" },
  });
  await db.achievement.create({
    data: { name: "Fair-Play", description: "Aucun litige en 20 défis.", icon: "🤝", category: "Special", rarity: "Commun" },
  });
  const achMvp = await db.achievement.create({
    data: { name: "MVP", description: "Être élu MVP d'un match.", icon: "⭐", category: "Palmares", rarity: "Épique" },
  });

  await db.playerAchievement.createMany({
    data: [
      { playerId: players.phantom.playerId, achievementId: achChampion.id, context: "Valorant Open Togo 2026", tournamentId: valorantOpen.id },
      { playerId: players.phantom.playerId, achievementId: achMvp.id, context: "Finale — Valorant Open Togo 2026" },
      { playerId: players.sokode.playerId, achievementId: achPremierSang.id, context: "Premier défi remporté sur GamePedia TG" },
    ],
  });

  // ── Articles ─────────────────────────────────────────────────
  await db.article.createMany({
    data: [
      {
        title: "Valorant Open Togo : Togo Esports sacré champion",
        slug: "valorant-open-togo-togo-esports-champion",
        excerpt: "Togo Esports remporte la première édition du tournoi national Valorant devant Lomé Gaming.",
        content: "# Togo Esports sacré champion\n\nAprès une finale disputée en trois manches, **Togo Esports** s'impose 2-1 face à Lomé Gaming...",
        tags: ["valorant", "tournoi", "lomé"],
        isPublished: true,
        publishedAt: new Date("2026-07-13T09:00:00Z"),
        authorName: "Rédaction GamePedia",
      },
      {
        title: "5 joueurs togolais à suivre en 2026",
        slug: "5-joueurs-togolais-a-suivre-2026",
        excerpt: "Le point sur les talents qui montent dans l'esport togolais.",
        content: "## Le futur de l'esport togolais\n\nDe Lomé à Kara, ils font parler d'eux cette saison...",
        tags: ["portrait", "esport-togo"],
        isPublished: true,
        publishedAt: new Date("2026-08-01T09:00:00Z"),
        authorName: "Rédaction GamePedia",
      },
      {
        title: "Interview exclusive avec Phantom_TG",
        slug: "interview-phantom-tg",
        excerpt: "Le capitaine de Togo Esports revient sur son sacre.",
        content: "*Brouillon en cours de relecture.*",
        tags: ["interview", "valorant"],
        isPublished: false,
        authorName: "Rédaction GamePedia",
      },
    ],
  });

  // ── Journal d'audit ──────────────────────────────────────────
  await db.auditLog.createMany({
    data: [
      {
        actorId: adminUser.id, actorName: adminUser.username, action: "VERIFY", entityType: "PLAYER",
        entityId: players.phantom.playerId, entityName: "Phantom_TG", meta: { kind: "player_verified" },
      },
      {
        actorId: adminUser.id, actorName: adminUser.username, action: "SUSPEND", entityType: "PLAYER",
        entityId: players.titan.playerId, entityName: "TitanOvo",
        meta: { kind: "user_active_toggle", isActive: false, reason: "Comportement toxique signalé" },
      },
      {
        actorId: adminUser.id, actorName: adminUser.username, action: "RECALCULATE_RANKING", entityType: "SEASON",
        entityId: valorantSeason.id, entityName: "Saison 1 - 2026 (Valorant)",
      },
      {
        actorId: modUser.id, actorName: modUser.username, action: "PUBLISH", entityType: "ARTICLE",
        entityId: valorantOpen.id, entityName: "Valorant Open Togo : Togo Esports sacré champion",
      },
    ],
  });

  // ── Notifications ────────────────────────────────────────────
  await db.notification.createMany({
    data: [
      { userId: players.phantom.userId, type: "SYSTEM", title: "Bienvenue sur GamePedia TG", message: "Votre compte est prêt.", isRead: true, readAt: new Date("2026-05-01") },
      { userId: players.phantom.userId, type: "ACHIEVEMENT", title: "Nouveau badge débloqué", message: "Vous avez débloqué « Champion National » !", link: `/players/${playerSeeds[0].pseudo}`, isRead: false },
      { userId: players.phantom.userId, type: "WAGER", title: "Défi en attente de versement", message: "Votre défi contre VeloxTG attend le versement de l'administration.", isRead: false },
      { userId: players.queen.userId, type: "WAGER", title: "Résultat à confirmer", message: "Votre adversaire a déclaré le résultat du défi. Déclarez le vôtre.", isRead: false },
      { userId: players.sokode.userId, type: "TOURNAMENT", title: "Inscriptions ouvertes", message: "Le Free Fire Squad Battle ouvre ses inscriptions.", link: `/tournaments/${freeFireBattle.slug}`, isRead: false },
    ],
  });

  // ── Suspensions ──────────────────────────────────────────────
  await db.suspension.create({
    data: {
      playerId: players.titan.playerId,
      suspendedById: adminUser.id,
      reason: "Comportement toxique signalé par plusieurs joueurs.",
      startsAt: new Date("2026-09-06"),
      endsAt: new Date("2026-09-16"),
      isActive: true,
    },
  });
  await db.suspension.create({
    data: {
      playerId: players.atakpame.playerId,
      suspendedById: modUser.id,
      reason: "Absence répétée à des matchs programmés.",
      startsAt: new Date("2026-03-01"),
      endsAt: new Date("2026-03-08"),
      isActive: false,
      liftedAt: new Date("2026-03-08"),
      liftReason: "Sanction purgée.",
    },
  });

  // ── Comptes de paiement plateforme (escrow admin) ───────────
  await db.platformPaymentAccount.createMany({
    data: [
      {
        type: "MOBILE_MONEY", label: "Moov Money GamePedia",
        details: { phone: "+228 90 12 34 56", operator: "Moov Money", holderName: "GamePedia TG" },
        instructions: "Mettre votre pseudo GamePedia en référence du transfert.",
      },
      {
        type: "WESTERN_UNION", label: "Western Union Admin",
        details: { receiverName: "GamePedia TG SARL", city: "Lomé", country: "Togo" },
        instructions: "Envoyer une capture de la preuve d'envoi après transfert.",
      },
    ],
  });

  // ── Moyens de réception des joueurs ─────────────────────────
  await db.playerPayoutMethod.createMany({
    data: [
      { playerId: players.phantom.playerId, type: "MOBILE_MONEY", label: "Mon Moov Money", details: { phone: "+228 91 11 22 33", operator: "Moov Money" }, isDefault: true },
      { playerId: players.queen.playerId, type: "MOBILE_MONEY", label: "Mon T-Money", details: { phone: "+228 92 22 33 44", operator: "T-Money" }, isDefault: true },
      { playerId: players.sokode.playerId, type: "MOBILE_MONEY", label: "Mobile Money Sokodé", details: { phone: "+228 93 33 44 55", operator: "Moov Money" }, isDefault: true },
      { playerId: players.velox.playerId, type: "MOBILE_MONEY", label: "Mon Moov Money", details: { phone: "+228 94 44 55 66", operator: "Moov Money" }, isDefault: true },
    ],
  });

  // ── Défis entre joueurs (wagers) — un par statut possible ───
  const STAKE = 5000;
  const COMMISSION = 5;

  // OPEN — en attente d'un adversaire
  await db.wager.create({
    data: {
      gameId: valorant.id, challengerId: players.sokode.playerId, stakeAmount: STAKE, commissionRate: COMMISSION,
      title: "1v1 Duel Valorant - Niveau Radiant", terms: "BO1, carte Ascent, aim duel only.",
      visibility: "PUBLIC", status: "OPEN", acceptDeadline: new Date("2026-09-20"),
    },
  });

  // ACCEPTED — adversaire rejoint, en attente d'accord des termes
  await db.wager.create({
    data: {
      gameId: valorant.id, challengerId: players.phantom.playerId, opponentId: players.queen.playerId,
      stakeAmount: STAKE, commissionRate: COMMISSION, title: "Best of 3 - Ranked Duel",
      visibility: "PRIVATE", status: "ACCEPTED", challengerAgreed: true, opponentAgreed: false,
      acceptedAt: new Date("2026-09-05"),
    },
  });

  // AWAITING_DEPOSITS — un seul des deux joueurs a déposé
  const wagerAwaitingDeposits = await db.wager.create({
    data: {
      gameId: fifa.id, challengerId: players.phantom.playerId, opponentId: players.queen.playerId,
      stakeAmount: STAKE, commissionRate: COMMISSION, title: "FIFA 25 - Manche unique",
      visibility: "PRIVATE", status: "AWAITING_DEPOSITS", challengerAgreed: true, opponentAgreed: true,
      acceptedAt: new Date("2026-09-04"),
    },
  });
  await db.wagerDeposit.create({
    data: { wagerId: wagerAwaitingDeposits.id, playerId: players.phantom.playerId, amount: STAKE, methodType: "MOBILE_MONEY", reference: "MM-20260904-001", status: "PENDING" },
  });

  // ONGOING — les deux dépôts sont confirmés, match en cours
  const wagerOngoing = await db.wager.create({
    data: {
      gameId: valorant.id, challengerId: players.sokode.playerId, opponentId: players.velox.playerId,
      stakeAmount: STAKE, commissionRate: COMMISSION, title: "1v1 Duel Valorant - Revanche",
      visibility: "PRIVATE", status: "ONGOING", challengerAgreed: true, opponentAgreed: true,
      acceptedAt: new Date("2026-09-01"),
    },
  });
  await db.wagerDeposit.createMany({
    data: [
      { wagerId: wagerOngoing.id, playerId: players.sokode.playerId, amount: STAKE, methodType: "MOBILE_MONEY", reference: "MM-20260901-011", status: "CONFIRMED", confirmedByUserId: adminUser.id, confirmedByName: adminUser.username, confirmedAt: new Date("2026-09-01") },
      { wagerId: wagerOngoing.id, playerId: players.velox.playerId, amount: STAKE, methodType: "MOBILE_MONEY", reference: "MM-20260901-012", status: "CONFIRMED", confirmedByUserId: adminUser.id, confirmedByName: adminUser.username, confirmedAt: new Date("2026-09-01") },
    ],
  });

  // AWAITING_RESULT — dépôts confirmés, match joué, aucune déclaration encore
  const wagerAwaitingResult = await db.wager.create({
    data: {
      gameId: valorant.id, challengerId: players.queen.playerId, opponentId: players.sokode.playerId,
      stakeAmount: STAKE, commissionRate: COMMISSION, title: "1v1 Duel Valorant - Aim Duel",
      visibility: "PRIVATE", status: "AWAITING_RESULT", challengerAgreed: true, opponentAgreed: true,
      acceptedAt: new Date("2026-08-28"),
    },
  });
  await db.wagerDeposit.createMany({
    data: [
      { wagerId: wagerAwaitingResult.id, playerId: players.queen.playerId, amount: STAKE, methodType: "MOBILE_MONEY", status: "CONFIRMED", confirmedByUserId: adminUser.id, confirmedByName: adminUser.username, confirmedAt: new Date("2026-08-28") },
      { wagerId: wagerAwaitingResult.id, playerId: players.sokode.playerId, amount: STAKE, methodType: "MOBILE_MONEY", status: "CONFIRMED", confirmedByUserId: adminUser.id, confirmedByName: adminUser.username, confirmedAt: new Date("2026-08-28") },
    ],
  });

  // RESULT_REPORTED — un seul joueur a déclaré le résultat
  const wagerResultReported = await db.wager.create({
    data: {
      gameId: valorant.id, challengerId: players.phantom.playerId, opponentId: players.sokode.playerId,
      stakeAmount: STAKE, commissionRate: COMMISSION, title: "1v1 Duel Valorant - Décisif",
      visibility: "PRIVATE", status: "RESULT_REPORTED", challengerAgreed: true, opponentAgreed: true,
      acceptedAt: new Date("2026-08-25"),
    },
  });
  await db.wagerDeposit.createMany({
    data: [
      { wagerId: wagerResultReported.id, playerId: players.phantom.playerId, amount: STAKE, methodType: "MOBILE_MONEY", status: "CONFIRMED", confirmedByUserId: adminUser.id, confirmedByName: adminUser.username, confirmedAt: new Date("2026-08-25") },
      { wagerId: wagerResultReported.id, playerId: players.sokode.playerId, amount: STAKE, methodType: "MOBILE_MONEY", status: "CONFIRMED", confirmedByUserId: adminUser.id, confirmedByName: adminUser.username, confirmedAt: new Date("2026-08-25") },
    ],
  });
  await db.wagerReport.create({
    data: { wagerId: wagerResultReported.id, reporterId: players.phantom.playerId, claimedWinnerId: players.phantom.playerId, note: "13-7, gg." },
  });

  // DISPUTED — déclarations contradictoires
  const wagerDisputed = await db.wager.create({
    data: {
      gameId: fifa.id, challengerId: players.queen.playerId, opponentId: players.velox.playerId,
      stakeAmount: STAKE, commissionRate: COMMISSION, title: "FIFA 25 - Manche contestée",
      visibility: "PRIVATE", status: "DISPUTED", challengerAgreed: true, opponentAgreed: true,
      acceptedAt: new Date("2026-08-20"),
    },
  });
  await db.wagerDeposit.createMany({
    data: [
      { wagerId: wagerDisputed.id, playerId: players.queen.playerId, amount: STAKE, methodType: "MOBILE_MONEY", status: "CONFIRMED", confirmedByUserId: adminUser.id, confirmedByName: adminUser.username, confirmedAt: new Date("2026-08-20") },
      { wagerId: wagerDisputed.id, playerId: players.velox.playerId, amount: STAKE, methodType: "MOBILE_MONEY", status: "CONFIRMED", confirmedByUserId: adminUser.id, confirmedByName: adminUser.username, confirmedAt: new Date("2026-08-20") },
    ],
  });
  await db.wagerReport.createMany({
    data: [
      { wagerId: wagerDisputed.id, reporterId: players.queen.playerId, claimedWinnerId: players.queen.playerId, note: "3-1 en ma faveur." },
      { wagerId: wagerDisputed.id, reporterId: players.velox.playerId, claimedWinnerId: players.velox.playerId, note: "Non, j'ai gagné 2-1." },
    ],
  });
  await db.wagerDispute.create({
    data: { wagerId: wagerDisputed.id, openedById: players.queen.playerId, reason: "Déclarations de résultat contradictoires.", status: "OPEN" },
  });

  // AWAITING_PAYOUT — vainqueur déterminé, versement en attente
  const wagerAwaitingPayout = await db.wager.create({
    data: {
      gameId: valorant.id, challengerId: players.phantom.playerId, opponentId: players.velox.playerId,
      stakeAmount: STAKE, commissionRate: COMMISSION, title: "1v1 Duel Valorant - Grand Final",
      visibility: "PRIVATE", status: "AWAITING_PAYOUT", challengerAgreed: true, opponentAgreed: true,
      winnerId: players.phantom.playerId, acceptedAt: new Date("2026-08-15"),
    },
  });
  await db.wagerDeposit.createMany({
    data: [
      { wagerId: wagerAwaitingPayout.id, playerId: players.phantom.playerId, amount: STAKE, methodType: "MOBILE_MONEY", status: "CONFIRMED", confirmedByUserId: adminUser.id, confirmedByName: adminUser.username, confirmedAt: new Date("2026-08-15") },
      { wagerId: wagerAwaitingPayout.id, playerId: players.velox.playerId, amount: STAKE, methodType: "MOBILE_MONEY", status: "CONFIRMED", confirmedByUserId: adminUser.id, confirmedByName: adminUser.username, confirmedAt: new Date("2026-08-15") },
    ],
  });
  await db.wagerReport.createMany({
    data: [
      { wagerId: wagerAwaitingPayout.id, reporterId: players.phantom.playerId, claimedWinnerId: players.phantom.playerId },
      { wagerId: wagerAwaitingPayout.id, reporterId: players.velox.playerId, claimedWinnerId: players.phantom.playerId },
    ],
  });

  // SETTLED — cycle complet, versement effectué
  const wagerSettled = await db.wager.create({
    data: {
      gameId: fifa.id, challengerId: players.sokode.playerId, opponentId: players.queen.playerId,
      stakeAmount: STAKE, commissionRate: COMMISSION, title: "FIFA 25 - Match clôturé",
      visibility: "PRIVATE", status: "SETTLED", challengerAgreed: true, opponentAgreed: true,
      winnerId: players.sokode.playerId, acceptedAt: new Date("2026-08-01"), settledAt: new Date("2026-08-02"),
    },
  });
  await db.wagerDeposit.createMany({
    data: [
      { wagerId: wagerSettled.id, playerId: players.sokode.playerId, amount: STAKE, methodType: "MOBILE_MONEY", status: "CONFIRMED", confirmedByUserId: adminUser.id, confirmedByName: adminUser.username, confirmedAt: new Date("2026-08-01") },
      { wagerId: wagerSettled.id, playerId: players.queen.playerId, amount: STAKE, methodType: "MOBILE_MONEY", status: "CONFIRMED", confirmedByUserId: adminUser.id, confirmedByName: adminUser.username, confirmedAt: new Date("2026-08-01") },
    ],
  });
  await db.wagerReport.createMany({
    data: [
      { wagerId: wagerSettled.id, reporterId: players.sokode.playerId, claimedWinnerId: players.sokode.playerId },
      { wagerId: wagerSettled.id, reporterId: players.queen.playerId, claimedWinnerId: players.sokode.playerId },
    ],
  });
  await db.wagerPayout.create({
    data: {
      wagerId: wagerSettled.id, recipientId: players.sokode.playerId, amount: 9500, commission: 500,
      methodType: "MOBILE_MONEY", note: "Versement effectué le 02/08.", paidByUserId: adminUser.id, paidByName: adminUser.username,
    },
  });

  // CANCELLED — annulé avant acceptation
  await db.wager.create({
    data: {
      gameId: valorant.id, challengerId: players.velox.playerId, stakeAmount: STAKE, commissionRate: COMMISSION,
      title: "1v1 Duel Valorant - Annulé", visibility: "PUBLIC", status: "CANCELLED",
    },
  });

  // EXPIRED — non accepté avant la date limite
  await db.wager.create({
    data: {
      gameId: valorant.id, challengerId: players.sokode.playerId, stakeAmount: STAKE, commissionRate: COMMISSION,
      title: "1v1 Duel Valorant - Expiré", visibility: "PUBLIC", status: "EXPIRED",
      acceptDeadline: new Date("2026-08-10"),
    },
  });

  console.log("Seed terminé avec succès.");
  console.log("");
  console.log("Comptes de test (mot de passe commun) :", PASSWORD);
  console.log("  ADMIN      admin@gamepedia.tg");
  console.log("  MODERATOR  moderateur@gamepedia.tg");
  for (const p of playerSeeds) {
    console.log(`  PLAYER     ${p.email}  (${p.pseudo})`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });

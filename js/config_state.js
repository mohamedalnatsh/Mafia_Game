const STORAGE_KEYS = Object.freeze({
  language: "mafia_language",
  activeSession: "mafia_active_session",
  savedPlayers: "mafia_saved_players",
  playerStats: "mafia_player_stats",
  changelogSeen: "mafia_v2_changelog_seen",
});

const DEFAULT_RULES = Object.freeze({
  revealRoleOnDeath: false,
  showVoteBreakdown: false,
  discussionTime: 180,
  jesterCurse: false,
  events: {
    eclipse: { enabled: false, rate: 30 },
    fog: { enabled: false, rate: 30 },
    decree: { enabled: false, rate: 30 },
    sandstorm: { enabled: false, rate: 30 },
    festival: { enabled: false, rate: 30 },
    rumors: { enabled: false, rate: 30 },
    curfew: { enabled: false, rate: 30 },
  },
  doubleSniper: false,
  fierceBodyguard: false,
  speedVoting: false,
});

const DEFAULT_CURRENT_EVENTS = Object.freeze({
  eclipse: false,
  fog: false,
  decree: false,
  sandstorm: false,
  festival: false,
  rumors: false,
  curfew: false,
  doctorDisabled: false,
  mafiaKillsDisabled: false,
  serialKillerKillsDisabled: false,
});

const gameState = {
  rules: structuredClone(DEFAULT_RULES),
  currentEvents: structuredClone(DEFAULT_CURRENT_EVENTS),
  executionerTarget: null,
};
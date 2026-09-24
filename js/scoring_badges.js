window.addEventListener("gameappready", () => Object.assign(GameApp, {
  recordScoreEvent(type, playerId, targetId = null) {
    if (!playerId) return;
    this.scoreEvents.push({ type, playerId, targetId, day: this.dayCount });
  },

  calculateBadges() {
    const players = this.assignedPlayers;
    const getEffectiveRoleKey = (player) => player.inheritedRoleKey || player.publicRoleKey || player.roleKey;
    const roleOf = (player) => ROLES_DATA[getEffectiveRoleKey(player)] || ROLES_DATA.citizen;
    const isWinningTeamPlayer = (player) => {
      const role = roleOf(player);
      if (this.lastWinningTeam === "town") return role.team === "town";
      if (this.lastWinningTeam === "mafia") return role.team === "mafia";
      if (this.lastWinningTeam === "jester") return getEffectiveRoleKey(player) === "jester";
      if (this.lastWinningTeam === "slasher") return getEffectiveRoleKey(player) === "slasher";
      if (this.lastWinningTeam === "executioner") return getEffectiveRoleKey(player) === "executioner";
      if (this.lastWinningTeam === "lovers") return this.lovers.includes(player.id);
      return false;
    };
    const mafiaTargetRole = (target) => {
      if (!target) return false;
      return ["mafia", "godfather", "framer", "slasher"].includes(target.inheritedRoleKey || target.publicRoleKey || target.roleKey);
    };
    const correctVoteCount = (player) => Number(this.playerStats[player.name]?.correctVotes || 0) + this.voteHistory.filter((vote) => {
      if (vote.voterId !== player.id || vote.targetId === null) return false;
      const target = this.assignedPlayers.find((candidate) => candidate.id === vote.targetId);
      return mafiaTargetRole(target);
    }).length;
    const investigationCount = (player) => Number(this.playerStats[player.name]?.investigatorReveals || 0) + this.scoreEvents.filter((event) => {
      if (event.playerId !== player.id || event.type !== "investigatorReveal") return false;
      const target = this.assignedPlayers.find((candidate) => candidate.id === event.targetId);
      return mafiaTargetRole(target);
    }).length;
    const doctorHealCount = (player) => Number(this.playerStats[player.name]?.doctorHeals || 0) + this.scoreEvents.filter((event) => event.playerId === player.id && event.type === "doctorHeal").length;
    const killCount = (player) => Number(this.playerStats[player.name]?.killsCount || 0) + this.killHistory.filter((kill) => kill.actorId === player.id).length;
    const quietFoxEligible = (player) => isWinningTeamPlayer(player) && !this.voteHistory.some((vote) => vote.targetId === player.id);
    const mafiaJesterWinCount = (player) => Number(this.playerStats[player.name]?.mafiaJesterWins || 0) + ((this.lastWinningTeam === "mafia" && ["mafia", "godfather", "framer"].includes(getEffectiveRoleKey(player))) || (this.lastWinningTeam === "jester" && getEffectiveRoleKey(player) === "jester") ? 1 : 0);
    const chooseBest = (predicate, fallbackToAll = true) => {
      const winners = players.filter((player) => isWinningTeamPlayer(player) && predicate(player));
      const pool = winners.length ? winners : fallbackToAll ? players.filter(predicate) : [];
      return pool.sort((a, b) => Number(predicate(b)) - Number(predicate(a)))[0] || null;
    };
    const badge = (icon, title, player) => player ? { icon, title, name: player.name, playerId: player.id } : null;
    const firstVictim = this.firstDeathPlayerId ? players.find((player) => player.id === this.firstDeathPlayerId) : null;

    this.badges = [
      badge("🕵🏻‍♂️", "سينشي كودو", chooseBest((player) => investigationCount(player) >= 3 ? investigationCount(player) : 0)),
      badge("🔫", "الطخيخ", chooseBest((player) => killCount(player) >= 3 ? killCount(player) : 0)),
      badge("🛡️", "ملاك الرحمة", chooseBest((player) => doctorHealCount(player) >= 3 ? doctorHealCount(player) : 0)),
      badge("⚖️", "قاضي المملكة", chooseBest((player) => correctVoteCount(player) >= 3 ? correctVoteCount(player) : 0)),
      badge("🎭", "الداهية", chooseBest((player) => mafiaJesterWinCount(player) >= 2 ? mafiaJesterWinCount(player) : 0)),
      badge("🦊", "الثعلب الصامت", chooseBest((player) => quietFoxEligible(player) ? 1 : 0)),
      badge("👻", "الضحية الأولى (المنحوس)", firstVictim),
      badge("💣", "ملك الظلال", chooseBest((player) => isWinningTeamPlayer(player) && ["slasher", "jester", "executioner"].includes(getEffectiveRoleKey(player)) ? 1 : 0)),
    ].filter(Boolean);
  },

  renderAchievements() {
    const container = document.getElementById("achievements-list");
    if (!container) return;
    container.innerHTML = this.badges.length
      ? this.badges.map((badge) => `<div class="achievement-item"><strong>${badge.icon} ${badge.title}</strong><div style="color:var(--gold-light);margin-top:0.25rem">${this.escapeHtml(badge.name)}</div></div>`).join("")
      : '<div class="stats-empty">لا توجد إنجازات كافية.</div>';
  },
}));
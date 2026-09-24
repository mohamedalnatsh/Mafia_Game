window.addEventListener("gameappready", () => Object.assign(GameApp, {
  escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
  },

  renderStats() {
    const container = document.getElementById("stats-list");
    const entries = Object.entries(this.playerStats).map(([name, stats]) => ({
      name,
      points: Number(stats.points) || 0,
      killsCount: Number(stats.killsCount) || 0,
      wins: Number(stats.wins) || 0,
      losses: Number(stats.losses) || 0,
      badges: Array.isArray(stats.badges) ? stats.badges : [],
      badgePoints: (Array.isArray(stats.badges) ? stats.badges.length : 0) * 50,
      winningRoles: Array.isArray(stats.winningRoles) ? stats.winningRoles : [],
    })).sort((first, second) => second.points - first.points || second.wins - first.wins);
    if (!entries.length) { container.innerHTML = `<div class="stats-empty">${this.t("noStats")}</div>`; return; }
    container.innerHTML = `<div class="stats-table-wrapper"><table class="stats-table"><thead><tr><th>${this.t("player")}</th><th>${this.t("points")}</th><th>${this.t("kills")}</th><th>${this.t("wins")}</th><th>${this.t("losses")}</th><th>${this.t("rolesWon")}</th><th>${this.t("badges")}</th></tr></thead><tbody>${entries.map((entry) => `<tr><td class="stats-player-name">${this.escapeHtml(entry.name)}</td><td>${entry.points}<br><small class="stats-empty-chip">+${entry.badgePoints} لقب</small></td><td>${entry.killsCount}</td><td>${entry.wins}</td><td>${entry.losses}</td><td><div class="stats-role-badges">${entry.winningRoles.length ? entry.winningRoles.map((roleKey) => { const role = ROLES_DATA[roleKey]; return `<span class="stats-role-badge">${role ? `${role.icon} ${this.escapeHtml(this.localizedRole(roleKey).name.split(" ")[0])}` : this.escapeHtml(roleKey)}</span>`; }).join("") : '<span class="stats-empty-chip">-</span>'}</div></td><td><div class="stats-role-badges">${entry.badges.length ? entry.badges.map((badge) => `<span class="stats-role-badge">${this.escapeHtml(badge)}</span>`).join("") : '<span class="stats-empty-chip">-</span>'}</div></td></tr>`).join("")}</tbody></table></div>`;
  },

  resetAllStats() {
    if (!confirm(this.t("resetConfirm"))) return;
    localStorage.removeItem(STORAGE_KEYS.savedPlayers);
    localStorage.removeItem(STORAGE_KEYS.playerStats);
    this.players = [];
    this.playerStats = {};
    this.renderPlayerChips();
    this.updatePlayerCountDisplay();
    this.renderStats();
    this.closeModals();
    this.toast(this.t("resetSuccess"));
  },

  renderEncyclopedia() {
    const container = document.getElementById("encyclopedia-list");
    if (!container) return;
    container.innerHTML = typeof this.buildEncyclopediaMarkup === "function"
      ? this.buildEncyclopediaMarkup()
      : "";
  },
}));
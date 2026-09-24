window.addEventListener("gameappready", () => Object.assign(GameApp, {
  renderExecutionState() {
    const state = this.executionState;
    if (!state) return;
    const titleEl = document.getElementById("exec-title");
    const descEl = document.getElementById("exec-description");
    const revealBox = document.getElementById("exec-role-reveal-box");
    if (state.type === "tie") { titleEl.innerText = this.t("tieTitle"); descEl.innerText = this.t("tieDesc"); revealBox.style.display = "none"; return; }
    if (state.type === "idiot") { titleEl.innerText = this.t("idiotTitle"); descEl.innerText = this.t("idiotDesc", { name: state.name }); revealBox.style.display = "none"; return; }
    titleEl.innerText = this.t("executionTitle", { name: state.name });
    descEl.innerText = this.t("executionDesc", { name: state.name });
    if (state.loverName) descEl.innerHTML += `<br><span style="color:#ff6b6b;">${this.t("loverDeath", { name: state.loverName })}</span>`;
    if (this.rules.revealRoleOnDeath) { revealBox.style.display = "block"; const role = ROLES_DATA[state.roleKey]; document.getElementById("exec-revealed-role").innerText = `${role.icon} ${this.localizedRole(state.roleKey).name} (${this.localizedTeam(role.team)})`; }
    else revealBox.style.display = "none";
  },

  triggerHunterRevenge(hunterPlayer) {
    setTimeout(() => this.openSpecialModal(this.t("hunterTitle"), this.t("hunterDesc", { name: hunterPlayer.name }), (targetId) => {
      const target = this.assignedPlayers.find((player) => player.id === targetId);
      if (!target) return;
      this.claimCopycatRole(target); this.markDeath(target); target.isAlive = false;
      this.recordSpecialMafiaKill(hunterPlayer.id, targetId, "avenger");
      if (["mafia", "godfather", "slasher"].includes(target.roleKey)) this.recordScoreEvent("hunterDyingShot", hunterPlayer.id, targetId);
      this.toast(this.t("hunterToast", { name: target.name })); SoundEngine.swordSlash(); this.checkWinCondition();
    }), 1000);
  },

  triggerKamikazeRetaliation(kamikazePlayer) {
    setTimeout(() => this.openSpecialModal(this.t("kamikazeTitle"), this.t("kamikazeDesc", { name: kamikazePlayer.name }), (targetId) => {
      const target = this.assignedPlayers.find((player) => player.id === targetId);
      if (!target) return;
      this.claimCopycatRole(target); this.markDeath(target); target.isAlive = false;
      if (this.voteHistory.some((vote) => vote.voterId === targetId && vote.targetId === kamikazePlayer.id)) this.recordScoreEvent("bomberDetonation", kamikazePlayer.id, targetId);
      this.toast(this.t("kamikazeToast", { name: target.name })); SoundEngine.swordSlash(); this.checkWinCondition();
    }), 1000);
  },

  checkWinCondition() {
    const alive = this.assignedPlayers.filter((player) => player.isAlive);
    const aliveMafia = alive.filter((player) => ["mafia", "godfather", "framer"].includes(player.roleKey));
    const aliveSlasher = alive.filter((player) => player.roleKey === "slasher");
    if (this.lovers.length === 2 && alive.length === 2 && alive.every((player) => this.lovers.includes(player.id))) { this.endGame("lovers", this.t("loversVictoryDesc")); return true; }
    if (aliveSlasher.length === 1 && alive.length <= 2 && aliveMafia.length === 0) { this.endGame("slasher", this.t("slasherVictoryDesc")); return true; }
    if (aliveMafia.length >= alive.length - aliveMafia.length && aliveSlasher.length === 0) { this.endGame("mafia", this.t("mafiaVictoryDesc")); return true; }
    if (aliveMafia.length === 0 && aliveSlasher.length === 0) { this.endGame("town", this.t("townVictoryDesc")); return true; }
    return false;
  },

  restartGame(sameRoles = false) {
    localStorage.removeItem(STORAGE_KEYS.activeSession);
    if (sameRoles) this.startRoleDistribution(); else this.goToSetup();
  },
}));
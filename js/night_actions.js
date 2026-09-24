window.addEventListener("gameappready", () => Object.assign(GameApp, {
  refreshSelection(container, activeBtn) {
    container.querySelectorAll(".player-btn").forEach((button) => button.classList.remove("selected"));
    if (activeBtn) activeBtn.classList.add("selected");
    this.saveSessionState();
    SoundEngine.playTone(440, "sine", 0.05);
  },

  submitNightAction() {
    this.clearTurnTimer();
    const player = this.nightQueue[this.nightQueueIndex];
    if (player.roleKey === "investigator" && this.nightActions.investigatorTarget) {
      const target = this.assignedPlayers.find((candidate) => candidate.id === this.nightActions.investigatorTarget);
      if (target && !this.currentEvents.fog && (ROLES_DATA[target.roleKey].team === "mafia" || this.nightActions.framedPlayer === target.id)) {
        this.recordScoreEvent("investigatorReveal", player.id, target.id);
      }
      this.openInvestigationModal(target, () => this.finishNightAction(player));
      return;
    }
    this.finishNightAction(player);
  },

  getInvestigationResult(targetPlayer) {
    if (this.currentEvents.fog) return { text: "", badgeClass: "text-warning" };
    const targetRoleKey = targetPlayer.inheritedRoleKey || targetPlayer.publicRoleKey || targetPlayer.roleKey;
    if (this.nightActions.framedPlayer === targetPlayer.id) return { text: this.t("mafiaTeamInvestigation"), badgeClass: "text-danger" };
    if (targetRoleKey === "godfather" || targetPlayer.roleKey === "godfather" || targetPlayer.publicRoleKey === "godfather") {
      return { text: this.t("innocentInvestigation"), badgeClass: "text-success" };
    }
    switch (targetRoleKey) {
      case "slasher": return { text: this.t("serialKillerInvestigation"), badgeClass: "text-danger" };
      case "jester": return { text: this.t("jesterInvestigation"), badgeClass: "text-warning" };
      case "mafia":
      case "framer": return { text: this.t("mafiaTeamInvestigation"), badgeClass: "text-danger" };
      default: return { text: this.t("innocentInvestigation"), badgeClass: "text-success" };
    }
  },

  finishNightAction(player) {
    this.clearTurnTimer();
    if (player.roleKey === "doctor" && this.nightActions.doctorTarget === player.id) this.doctorSelfHealUsed = true;
    if (player.roleKey === "witch") {
      if (this.nightActions.witchHealTarget && !this.witchHealUsed) { this.nightActions.witchHeal = true; this.witchHealUsed = true; }
      if (this.nightActions.witchKillTarget && !this.witchPoisonUsed) this.witchPoisonUsed = true;
    }
    if (player.roleKey === "sniper" && this.nightActions.sniperTarget) {
      this.sniperBullets = Math.max(0, (this.sniperBullets ?? (this.sniperBulletAvailable ? 1 : 0)) - 1);
      this.sniperBulletAvailable = this.sniperBullets > 0;
      const target = this.assignedPlayers.find((item) => item.id === this.nightActions.sniperTarget);
      if (this.rules.doubleSniper && target) {
        const targetRole = ROLES_DATA[target.roleKey];
        if (targetRole?.team !== "mafia" && target.roleKey !== "slasher") { this.sniperBullets = 0; this.sniperBulletAvailable = false; }
      }
    }
    if (player.roleKey === "cupid" && this.nightActions.cupidLovers.length === 2) {
      this.lovers = [...this.nightActions.cupidLovers];
      this.lovers.forEach((id) => { const lover = this.assignedPlayers.find((candidate) => candidate.id === id); if (lover) lover.isLover = true; });
    }
    this.nightQueueIndex++;
    if (this.nightQueueIndex < this.nightQueue.length) this.displayNightHandover();
    else this.resolveNightAndStartMorning();
    this.nightActionVisible = false;
    this.saveSessionState();
  },
}));
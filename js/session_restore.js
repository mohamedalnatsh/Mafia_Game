window.addEventListener("gameappready", () => Object.assign(GameApp, {
  restoreSessionState() {
    let state;
    try { state = JSON.parse(localStorage.getItem(STORAGE_KEYS.activeSession) || "null"); } catch (error) { state = null; }
    if (!state?.currentScreen || state.currentScreen === "screen-home") return;
    if (!Array.isArray(state.assignedPlayers) || !state.assignedPlayers.length) return;
    this.restoringSession = true;
    this.players = Array.isArray(state.players) ? state.players : this.players;
    this.assignedPlayers = Array.isArray(state.assignedPlayers) ? state.assignedPlayers : [];
    this.selectedRolesCounts = state.selectedRolesCounts && typeof state.selectedRolesCounts === "object" ? state.selectedRolesCounts : this.selectedRolesCounts;
    this.currentSetupTab = state.currentSetupTab || "players";
    this.distributionIndex = Number.isInteger(state.currentRevealIndex) ? state.currentRevealIndex : 0;
    this.nightQueue = Array.isArray(state.nightQueue) ? state.nightQueue : [];
    this.nightQueueIndex = Number.isInteger(state.nightQueueIndex) ? state.nightQueueIndex : 0;
    this.nightActions = state.nightActions || this.nightActions;
    this.witchHealUsed = Boolean(state.witchHealUsed); this.witchPoisonUsed = Boolean(state.witchPoisonUsed); this.doctorSelfHealUsed = Boolean(state.doctorSelfHealUsed);
    this.nightActionVisible = Boolean(state.nightActionVisible); this.dayVotingVisible = Boolean(state.dayVotingVisible); this.votingHandoverVisible = Boolean(state.votingHandoverVisible);
    this.votes = state.votes || {}; this.currentVoterIndex = Number.isInteger(state.currentVoterIndex) ? state.currentVoterIndex : 0;
    this.revoteCandidates = Array.isArray(state.revoteCandidates) ? state.revoteCandidates : null; this.isRevote = Boolean(state.isRevote);
    this.voteHistory = Array.isArray(state.voteHistory) ? state.voteHistory : [];
    this.specialMafiaKills = state.specialMafiaKills && typeof state.specialMafiaKills === "object" ? state.specialMafiaKills : {};
    this.killHistory = Array.isArray(state.killHistory) ? state.killHistory : []; this.mafiaActorId = state.mafiaActorId || null;
    this.votedOutByDay = Array.isArray(state.votedOutByDay) ? state.votedOutByDay : []; this.scoreEvents = Array.isArray(state.scoreEvents) ? state.scoreEvents : [];
    this.executionState = state.executionState || null; this.discussionSecondsLeft = Number(state.discussionSecondsLeft) || 180; this.timerRunning = Boolean(state.timerRunning); this.dayCount = Number(state.dayCount) || 1;
    this.rules = { ...this.rules, ...(state.rules || {}), events: { ...this.rules.events, ...(state.rules?.events || {}) } };
    this.lovers = Array.isArray(state.lovers) ? state.lovers : []; this.mafiaNote = state.mafiaNote || ""; this.playerNotes = state.playerNotes || {};
    this.currentEvents = state.currentEvents || this.currentEvents; this.executionerTarget = state.executionerTarget || null; this.mayorRevealed = state.mayorRevealed || {};
    this.lastNightAttacks = Array.isArray(state.lastNightAttacks) ? state.lastNightAttacks : []; this.lastEventDay = Number(state.lastEventDay) || 0; this.badges = Array.isArray(state.badges) ? state.badges : [];
    this.firstDeathPlayerId = state.firstDeathPlayerId || null; this.deathOrder = Array.isArray(state.deathOrder) ? state.deathOrder : []; this.jesterCurseTarget = state.jesterCurseTarget || null; this.curfewPlayerId = state.curfewPlayerId || null; this.copycatClaimed = Boolean(state.copycatClaimed);
    this.sniperBullets = Number.isInteger(state.sniperBullets) ? state.sniperBullets : state.sniperBulletAvailable === false ? 0 : 1; this.sniperBulletAvailable = this.sniperBullets > 0;
    this.syncRuleControls();
    this.assignedPlayers.forEach((player) => { player.isAlive = Array.isArray(state.alivePlayers) ? state.alivePlayers.includes(player.id) : player.isAlive; });
    this.renderRolesSetup(); this.renderPlayerChips(); this.updatePlayerCountDisplay(); this.showScreen(state.currentScreen);
    if (state.currentScreen === "screen-setup") this.switchSetupTab(this.currentSetupTab);
    else if (state.currentScreen === "screen-seating") this.renderSeatingArrangement();
    else if (state.currentScreen === "screen-reveal") {
      if (state.distributionHandoverVisible) { document.getElementById("distribution-view").classList.add("hidden"); document.getElementById("distribution-handover").classList.add("active"); this.renderDistributionHandover(this.assignedPlayers[this.distributionIndex]); }
      else { this.showRoleReveal(this.distributionIndex); document.getElementById("dist-card-flipper").classList.toggle("is-flipped", Boolean(state.isCardFlipped)); }
    } else if (state.currentScreen === "screen-night") { this.displayNightHandover(); if (this.nightActionVisible) this.showPlayerNightAction(); }
    else if (state.currentScreen === "screen-morning") this.renderMorningScreen();
    else if (state.currentScreen === "screen-day") this.restoreDayScreen();
    else if (state.currentScreen === "screen-execution" && this.executionState) this.renderExecutionState();
    this.restoringSession = false;
  },
}));
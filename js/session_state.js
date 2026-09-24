window.addEventListener("gameappready", () => Object.assign(GameApp, {
  saveSessionState() {
    if (this.restoringSession) return;
    const activeScreen = document.querySelector(".screen.active");
    const currentScreen = activeScreen ? activeScreen.id : "screen-home";
    if (currentScreen === "screen-home" || currentScreen === "screen-gameover") return;
    const state = {
      currentScreen, players: this.players, assignedPlayers: this.assignedPlayers,
      selectedRoles: Object.keys(this.selectedRolesCounts).filter((key) => this.selectedRolesCounts[key] > 0),
      selectedRolesCounts: this.selectedRolesCounts, currentSetupTab: this.currentSetupTab,
      currentRevealIndex: this.distributionIndex,
      isCardFlipped: document.getElementById("dist-card-flipper")?.classList.contains("is-flipped") || false,
      distributionHandoverVisible: document.getElementById("distribution-handover")?.classList.contains("active") || false,
      gamePhase: currentScreen.replace("screen-", ""),
      alivePlayers: this.assignedPlayers.filter((player) => player.isAlive).map((player) => player.id),
      nightQueue: this.nightQueue, nightQueueIndex: this.nightQueueIndex, nightActions: this.nightActions,
      witchHealUsed: this.witchHealUsed, witchPoisonUsed: this.witchPoisonUsed, doctorSelfHealUsed: this.doctorSelfHealUsed,
      nightActionVisible: this.nightActionVisible, dayVotingVisible: this.dayVotingVisible, votes: this.votes,
      currentVoterIndex: this.currentVoterIndex,
      votingHandoverVisible: document.getElementById("voting-handover-box")?.style.display !== "none",
      revoteCandidates: this.revoteCandidates, isRevote: this.isRevote, voteHistory: this.voteHistory,
      specialMafiaKills: this.specialMafiaKills, killHistory: this.killHistory, mafiaActorId: this.mafiaActorId,
      votedOutByDay: this.votedOutByDay, scoreEvents: this.scoreEvents, executionState: this.executionState,
      discussionSecondsLeft: this.discussionSecondsLeft, timerRunning: this.timerRunning, dayCount: this.dayCount,
      rules: this.rules, lovers: this.lovers, mafiaNote: this.mafiaNote, playerNotes: this.playerNotes,
      currentEvents: this.currentEvents, executionerTarget: this.executionerTarget, mayorRevealed: this.mayorRevealed,
      lastNightAttacks: this.lastNightAttacks, badges: this.badges, firstDeathPlayerId: this.firstDeathPlayerId,
      deathOrder: this.deathOrder, lastEventDay: this.lastEventDay, jesterCurseTarget: this.jesterCurseTarget,
      curfewPlayerId: this.curfewPlayerId, copycatClaimed: this.copycatClaimed, sniperBullets: this.sniperBullets,
      sniperBulletAvailable: this.sniperBulletAvailable, timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEYS.activeSession, JSON.stringify(state));
  },

  bindPersistenceControls() {
    ["rule-reveal-role", "rule-show-votes", "rule-discussion-time", "rule-jester-curse", "event-eclipse-enabled", "event-fog-enabled", "event-decree-enabled", "event-eclipse-rate", "event-fog-rate", "event-decree-rate", "event-sandstorm-enabled", "event-festival-enabled", "event-rumors-enabled", "event-curfew-enabled", "event-sandstorm-rate", "event-festival-rate", "event-rumors-rate", "event-curfew-rate", "rule-double-sniper", "rule-fierce-bodyguard", "rule-speed-voting"].forEach((id) => {
      const control = document.getElementById(id);
      if (control) control.addEventListener("change", () => {
        this.readRuleControls();
        this.saveRulesConfig();
        this.saveSessionState();
      });
    });
  },

  bindRuleDescriptions() {
    const descriptions = {
      "rule-reveal-role": "يعلن دور اللاعب فور إقصائه نهاراً.", "rule-show-votes": "يعرض تفاصيل من صوّت ضد من بعد التصويت.",
      "rule-jester-curse": "يأخذ المهرج لاعباً ممن صوتوا ضده.", "event-eclipse-enabled": "يمنع التصويت والإقصاء في هذا اليوم.",
      "event-fog-enabled": "يعطل نتائج تحقيق المحقق في هذه الليلة.", "event-decree-enabled": "يخفي أسماء المصوتين في سجل الأصوات.",
      "event-sandstorm-enabled": "يعطل علاج الطبيب في هذه الليلة.", "event-festival-enabled": "يمنع هجمات المافيا والسفاح في هذه الليلة.",
      "event-rumors-enabled": "ينشر شائعة عن فريق لاعب حي دون كشف دوره.", "event-curfew-enabled": "يعطل تصويت لاعب وقدرته في الليل التالي.",
      "rule-double-sniper": "• رصاصتان ملكيتان: يمنح القناص الملكي رصاصتين، في حال إصابة المافيا أو السفاح بالرصاصة الأولى تبقى معه الثانية، أما إذا أصاب بريئاً فيموت البريء ويفقد الرصاصة الثانية ندمًا.",
      "rule-fierce-bodyguard": "يجعل الحارس يقتل المهاجم بعد التضحية.", "rule-speed-voting": "يفرض مهلة 15 ثانية على التسليم والأدوار.",
    };
    Object.entries(descriptions).forEach(([id, text]) => {
      const input = document.getElementById(id);
      if (!input) return;
      const container = input.closest(".switch-row, .event-setting");
      if (!container) return;
      let help = container.querySelector(".rule-help");
      if (!help) { help = document.createElement("div"); help.className = "rule-help"; container.querySelector("div")?.appendChild(help); }
      help.textContent = text;
      const update = () => help.classList.toggle("visible", input.checked);
      input.addEventListener("change", update); update();
    });
  },

  readRuleControls() {
    const readRate = (id, fallback) => {
      const value = Number(document.getElementById(id)?.value);
      return Math.min(100, Math.max(20, Number.isFinite(value) ? value : fallback));
    };
    this.rules.revealRoleOnDeath = document.getElementById("rule-reveal-role")?.checked ?? true;
    this.rules.showVoteBreakdown = document.getElementById("rule-show-votes")?.checked ?? true;
    this.rules.discussionTime = Number(document.getElementById("rule-discussion-time")?.value) || 180;
    this.rules.jesterCurse = document.getElementById("rule-jester-curse")?.checked ?? true;
    this.rules.doubleSniper = document.getElementById("rule-double-sniper")?.checked ?? false;
    this.rules.fierceBodyguard = document.getElementById("rule-fierce-bodyguard")?.checked ?? false;
    this.rules.speedVoting = document.getElementById("rule-speed-voting")?.checked ?? false;
    this.rules.events = Object.fromEntries(["eclipse", "fog", "decree", "sandstorm", "festival", "rumors", "curfew"].map((name) => [name, { enabled: document.getElementById(`event-${name}-enabled`)?.checked ?? true, rate: readRate(`event-${name}-rate`, 30) }]));
  },

  syncRuleControls() {
    const events = this.rules.events || {};
    const set = (id, value) => { const element = document.getElementById(id); if (element && value !== undefined) element.value = value; };
    const check = (id, value) => { const element = document.getElementById(id); if (element && value !== undefined) element.checked = Boolean(value); };
    check("rule-reveal-role", this.rules.revealRoleOnDeath); check("rule-show-votes", this.rules.showVoteBreakdown); check("rule-jester-curse", this.rules.jesterCurse); check("rule-double-sniper", this.rules.doubleSniper); check("rule-fierce-bodyguard", this.rules.fierceBodyguard); check("rule-speed-voting", this.rules.speedVoting);
    ["eclipse", "fog", "decree", "sandstorm", "festival", "rumors", "curfew"].forEach((name) => { check(`event-${name}-enabled`, events[name]?.enabled); set(`event-${name}-rate`, events[name]?.rate || 30); });
    document.querySelectorAll(".toggle-switch input").forEach((input) => { const help = input.closest(".switch-row, .event-setting")?.querySelector(".rule-help"); if (help) help.classList.toggle("visible", input.checked); });
  },

  syncHomeState() { document.body.classList.toggle("home-active", document.querySelector(".screen.active")?.id === "screen-home"); },

  restoreDayScreen() {
    document.getElementById("day-discussion-box").style.display = this.dayVotingVisible ? "none" : "block";
    document.getElementById("day-voting-box").style.display = this.dayVotingVisible ? "block" : "none";
    this.updateTimerDisplay();
    if (this.dayVotingVisible) { if (this.votingHandoverVisible) this.showVotingHandover(); else this.renderVotingTurn(); } else if (this.timerRunning) this.startTimer();
  },

  loadSavedData() {
    try {
      const savedPlayers = JSON.parse(localStorage.getItem(STORAGE_KEYS.savedPlayers) || "null");
      const savedStats = JSON.parse(localStorage.getItem(STORAGE_KEYS.playerStats) || "null");
      this.players = Array.isArray(savedPlayers) ? savedPlayers.filter((name) => typeof name === "string" && name.trim()) : [];
      this.playerStats = savedStats && typeof savedStats === "object" && !Array.isArray(savedStats) ? savedStats : {};
    } catch (error) { this.players = []; this.playerStats = {}; }
  },

  saveSavedData() {
    localStorage.setItem(STORAGE_KEYS.savedPlayers, JSON.stringify(this.players));
    localStorage.setItem(STORAGE_KEYS.playerStats, JSON.stringify(this.playerStats));
  },

  ensurePlayerStats(name) {
    if (!this.playerStats[name]) this.playerStats[name] = {
      points: 0,
      wins: 0,
      losses: 0,
      killsCount: 0,
      badges: [],
      winningRoles: [],
      investigatorReveals: 0,
      doctorHeals: 0,
      correctVotes: 0,
      mafiaJesterWins: 0,
      quietWins: 0,
    };
    else {
      const stats = this.playerStats[name];
      stats.points = Number(stats.points) || 0; stats.wins = Number(stats.wins) || 0; stats.losses = Number(stats.losses) || 0; stats.killsCount = Number(stats.killsCount) || 0;
      stats.badges = Array.isArray(stats.badges) ? stats.badges : [];
      stats.winningRoles = Array.isArray(stats.winningRoles) ? stats.winningRoles : [];
      stats.investigatorReveals = Number(stats.investigatorReveals) || 0;
      stats.doctorHeals = Number(stats.doctorHeals) || 0;
      stats.correctVotes = Number(stats.correctVotes) || 0;
      stats.mafiaJesterWins = Number(stats.mafiaJesterWins) || 0;
      stats.quietWins = Number(stats.quietWins) || 0;
    }
    return this.playerStats[name];
  },
}));
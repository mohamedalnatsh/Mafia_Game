window.addEventListener("gameappready", () => Object.assign(GameApp, {
  showSeatingArrangement() {
    this.readRuleControls();
    const totalRoles = Object.values(this.selectedRolesCounts).reduce((first, second) => first + second, 0);
    if (this.players.length < 5) {
      this.toast(this.t("minPlayers"));
      return;
    }
    if (this.players.length !== totalRoles) {
      this.toast(this.t("roleMismatch", { roles: totalRoles, players: this.players.length }));
      return;
    }
    this.rules.revealRoleOnDeath = document.getElementById("rule-reveal-role").checked;
    this.rules.showVoteBreakdown = document.getElementById("rule-show-votes").checked;
    this.rules.discussionTime = parseInt(document.getElementById("rule-discussion-time").value) || 180;
    this.renderSeatingArrangement();
    this.showScreen("screen-seating");
    this.saveSessionState();
  },

  renderSeatingArrangement() {
    const container = document.getElementById("seating-circle");
    container.innerHTML = '<div class="seating-center-mark">⚜️</div>';
    const playerCount = this.players.length;
    const radius = playerCount <= 6 ? 39 : 42;
    this.players.forEach((playerName, index) => {
      const angle = -Math.PI / 2 + (index * 2 * Math.PI) / playerCount;
      const node = document.createElement("div");
      node.className = "seating-node";
      node.style.left = `${50 + radius * Math.cos(angle)}%`;
      node.style.top = `${50 + radius * Math.sin(angle)}%`;
      node.innerHTML = `<span class="seating-number">${index + 1}</span><span class="seating-name">${this.escapeHtml(playerName)}</span>`;
      container.appendChild(node);
    });
  },

  startRoleDistribution() {
    this.readRuleControls();
    const totalRoles = Object.values(this.selectedRolesCounts).reduce((first, second) => first + second, 0);
    if (this.players.length < 5) {
      this.toast(this.t("minPlayers"));
      return;
    }
    if (this.players.length !== totalRoles) {
      this.toast(this.t("roleMismatch", { roles: totalRoles, players: this.players.length }));
      return;
    }
    this.rules.revealRoleOnDeath = document.getElementById("rule-reveal-role").checked;
    this.rules.showVoteBreakdown = document.getElementById("rule-show-votes").checked;
    this.rules.discussionTime = parseInt(document.getElementById("rule-discussion-time").value) || 180;

    const deck = [];
    Object.keys(this.selectedRolesCounts).forEach((key) => {
      for (let index = 0; index < this.selectedRolesCounts[key]; index++) deck.push(key);
    });
    for (let index = deck.length - 1; index > 0; index--) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [deck[index], deck[randomIndex]] = [deck[randomIndex], deck[index]];
    }

    this.assignedPlayers = this.players.map((name, index) => ({
      id: index + 1,
      name,
      roleKey: deck[index],
      isAlive: true,
      cannotVote: false,
      isLover: false,
    }));
    this.dayCount = 1;
    this.distributionIndex = 0;
    this.resultsRecorded = false;
    this.voteHistory = [];
    this.specialMafiaKills = {};
    this.killHistory = [];
    this.mafiaActorId = null;
    this.votedOutByDay = [];
    this.scoreEvents = [];
    this.witchPoisonUsed = false;
    this.witchHealUsed = false;
    this.sniperBullets = this.rules.doubleSniper ? 2 : 1;
    this.sniperBulletAvailable = this.sniperBullets > 0;
    this.doctorSelfHealUsed = false;
    this.lovers = [];
    this.mafiaNote = "";
    this.playerNotes = {};
    this.currentEvents = structuredClone(DEFAULT_CURRENT_EVENTS);
    this.lastEventDay = 0;
    this.curfewPlayerId = null;
    this.copycatClaimed = false;
    this.mayorRevealed = {};
    this.lastNightAttacks = [];
    this.badges = [];
    this.firstDeathPlayerId = null;
    this.deathOrder = [];
    const executioner = this.assignedPlayers.find((player) => player.roleKey === "executioner");
    const knightTargets = this.assignedPlayers.filter((player) => player.roleKey !== "executioner" && ROLES_DATA[player.roleKey].team === "town");
    this.executionerTarget = executioner && knightTargets.length
      ? knightTargets[Math.floor(Math.random() * knightTargets.length)].id
      : null;

    this.showScreen("screen-reveal");
    document.getElementById("distribution-view").classList.add("hidden");
    document.getElementById("distribution-handover").classList.add("active");
    this.renderDistributionHandover(this.assignedPlayers[this.distributionIndex]);
    this.saveSessionState();
  },

  showRoleReveal(playerIndex) {
    const player = this.assignedPlayers[playerIndex];
    const role = ROLES_DATA[player.roleKey];
    const card = document.getElementById("dist-card-flipper");
    card.classList.remove("is-flipped");
    document.getElementById("dist-player-name").innerText = player.name;
    document.getElementById("dist-role-team").className = `role-type-badge team-${role.team}`;
    document.getElementById("dist-role-team").innerText = this.localizedTeam(role.team);
    const roleArt = document.getElementById("dist-role-art");
    roleArt.innerHTML = role.image
      ? `<img class="role-reveal-image" id="dist-role-image" src="${role.image}" alt="${role.title || role.name}" />`
      : `<span style="font-size:3rem;">${role.icon}</span>`;
    const localized = this.localizedRole(player.roleKey);
    document.getElementById("dist-role-name").innerText = localized.name;
    const desc = document.getElementById("dist-role-desc");
    desc.innerHTML = this.escapeHtml(localized.desc);
    if (["mafia", "godfather"].includes(player.roleKey)) {
      const teammates = this.assignedPlayers.filter((teammate) => teammate.id !== player.id && teammate.isAlive && (player.roleKey === "mafia" ? ["mafia", "godfather", "framer"].includes(teammate.roleKey) : ["mafia", "framer"].includes(teammate.roleKey)));
      const names = teammates.length ? teammates.map((teammate) => this.escapeHtml(teammate.name)).join(this.language === "ar" ? "، " : ", ") : null;
      const awareness = document.createElement("div");
      awareness.style.cssText = "margin-top:0.75rem; padding:0.55rem; color:var(--gold-light); background:rgba(122,0,22,0.45); border:1px solid var(--gold-dark); border-radius:8px; font-weight:700;";
      awareness.innerText = names ? this.t(player.roleKey === "mafia" ? "mafiaPartners" : "godfatherMafia", { names }) : this.t("soloMafia");
      desc.appendChild(awareness);
      const noteLabel = document.createElement("label");
      noteLabel.style.cssText = "display:block;margin-top:0.75rem;color:var(--gold);font-size:0.8rem;text-align:right;";
      noteLabel.innerText = "صندوق الرسائل السرية";
      const noteInput = document.createElement("textarea");
      noteInput.value = this.mafiaNote;
      noteInput.placeholder = "اتفقوا على الهدف...";
      noteInput.style.cssText = "display:block;width:100%;min-height:60px;margin-top:0.35rem;padding:0.45rem;background:#0c0c12;border:1px solid #3d3d52;border-radius:7px;color:#fff;font:0.8rem var(--font-body);";
      noteInput.addEventListener("input", (event) => {
        this.mafiaNote = event.target.value;
        this.saveSessionState();
      });
      desc.appendChild(noteLabel);
      desc.appendChild(noteInput);
    }
    this.saveSessionState();
    SoundEngine.gong();
  },

  flipDistributionCard() {
    const flipper = document.getElementById("dist-card-flipper");
    flipper.classList.toggle("is-flipped");
    this.saveSessionState();
    SoundEngine.cardFlip();
  },

  bindRoleRevealCard() {
    const card = document.getElementById("dist-card-flipper");
    if (card) card.addEventListener("click", () => this.flipDistributionCard());
  },

  nextDistributionPlayer() {
    document.getElementById("dist-card-flipper").classList.remove("is-flipped");
    this.distributionIndex++;
    if (this.distributionIndex < this.assignedPlayers.length) {
      const nextPlayer = this.assignedPlayers[this.distributionIndex];
      this.renderDistributionHandover(nextPlayer);
      document.getElementById("distribution-view").classList.add("hidden");
      document.getElementById("distribution-handover").classList.add("active");
      SoundEngine.playTone(330, "sine", 0.15);
    } else {
      this.startNightPhase();
    }
    this.saveSessionState();
  },

  renderDistributionHandover(player) {
    document.getElementById("distribution-hidden-document").innerText = this.t("hiddenDocument");
    document.getElementById("distribution-pass-prompt").innerText = this.t("passToPlayer", { name: player.name });
    document.getElementById("distribution-confirm-prompt").innerText = this.t("confirmPlayer", { name: player.name });
    this.startTurnTimer("distribution-handover");
  },

  confirmDistributionHandover() {
    this.clearTurnTimer();
    document.getElementById("distribution-handover").classList.remove("active");
    document.getElementById("distribution-view").classList.remove("hidden");
    this.showRoleReveal(this.distributionIndex);
    this.saveSessionState();
  },
}));
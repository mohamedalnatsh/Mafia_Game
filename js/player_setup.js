window.addEventListener("gameappready", () => Object.assign(GameApp, {
  switchSetupTab(tabName) {
    const nextTab = ["players", "roles", "rules"].includes(tabName) ? tabName : "players";
    this.currentSetupTab = nextTab;

    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.setupTab === nextTab);
    });

    document.querySelectorAll(".setup-step-panel").forEach((panel) => {
      panel.classList.toggle("active", panel.id === `tab-${nextTab}`);
    });

    this.saveSessionState();
  },

  addPlayer() {
    const input = document.getElementById("new-player-input");
    const name = input.value.trim();
    if (!name) return;
    if (this.players.length >= 16) {
      this.toast(this.t("maxPlayers"));
      return;
    }
    if (this.players.includes(name)) {
      this.toast(this.t("duplicatePlayer"));
      return;
    }
    this.players.push(name);
    this.ensurePlayerStats(name);
    this.saveSavedData();
    input.value = "";
    this.renderPlayerChips();
    this.updatePlayerCountDisplay();
    this.saveSessionState();
    SoundEngine.playTone(520, "sine", 0.1);
  },

  removePlayer(index) {
    this.players.splice(index, 1);
    this.saveSavedData();
    this.renderPlayerChips();
    this.updatePlayerCountDisplay();
    this.saveSessionState();
  },

  quickFillPlayers() {
    this.players = ["جنى", "حلى", "عبود", "رياض", "حمود"];
    this.players.forEach((name) => this.ensurePlayerStats(name));
    this.saveSavedData();
    this.renderPlayerChips();
    this.updatePlayerCountDisplay();
    this.applyPreset(5);
    this.toast(this.t("quickFillSuccess"));
  },

  renderPlayerChips() {
    const container = document.getElementById("players-chips-container");
    container.innerHTML = "";
    this.players.forEach((playerName, index) => {
      const chip = document.createElement("div");
      chip.className = "player-chip";
      chip.innerHTML = `
        <span>⚔️ ${this.escapeHtml(playerName)}</span>
        <button type="button" class="chip-remove" data-action="remove-player" data-player-index="${index}" aria-label="Remove player">✕</button>
      `;
      container.appendChild(chip);
    });
  },

  updatePlayerCountDisplay() {
    const count = this.players.length;
    document.getElementById("player-count-badge").innerText = count;
    this.updateRolesBalance();
  },

  renderRolesSetup() {
    const grid = document.getElementById("roles-selection-grid");
    grid.innerHTML = "";
    Object.keys(ROLES_DATA).forEach((key) => {
      const role = ROLES_DATA[key];
      const localized = this.localizedRole(key);
      if (this.selectedRolesCounts[key] === undefined) this.selectedRolesCounts[key] = role.defaultCount;
      const card = document.createElement("div");
      card.className = `role-toggle-card ${this.selectedRolesCounts[key] > 0 ? "active" : ""}`;
      card.id = `role-card-${key}`;
      card.innerHTML = `
        ${role.image ? `<img class="role-card-image" src="${role.image}" alt="${localized.name}" />` : `<div class="role-card-image" style="display:grid;place-items:center;font-size:3rem">${role.icon}</div>`}
        <div class="role-name">${localized.name.split(" ")[0]}</div>
        <span class="role-type-badge team-${role.team}">${this.localizedTeam(role.team)}</span>
        <div class="role-counter" onclick="event.stopPropagation()">
          <button class="counter-btn" onclick="GameApp.changeRoleCount('${key}', -1)">-</button>
          <span id="role-count-val-${key}" style="font-weight:bold; min-width:18px; text-align:center;">${this.selectedRolesCounts[key]}</span>
          <button class="counter-btn" onclick="GameApp.changeRoleCount('${key}', 1)">+</button>
        </div>
      `;
      grid.appendChild(card);
    });
  },

  changeRoleCount(roleKey, delta) {
    const role = ROLES_DATA[roleKey];
    let current = this.selectedRolesCounts[roleKey] || 0;
    let next = Math.max(0, current + delta);
    if (role.isUnique && next > 1) next = 1;
    if (next > 10) next = 10;
    this.selectedRolesCounts[roleKey] = next;
    document.getElementById(`role-count-val-${roleKey}`).innerText = next;
    document.getElementById(`role-card-${roleKey}`).classList.toggle("active", next > 0);
    this.updateRolesBalance();
    this.saveSessionState();
    SoundEngine.playTone(480 + delta * 50, "sine", 0.08);
  },

  updateRolesBalance() {
    const totalRoles = Object.values(this.selectedRolesCounts).reduce((first, second) => first + second, 0);
    const playerCount = this.players.length;
    const badge = document.getElementById("role-balance-badge");
    badge.innerText = `${totalRoles} / ${playerCount} ${this.t("roleUnit")}`;
    badge.style.color = totalRoles === playerCount && playerCount >= 6 ? "#69db7c" : "#ff6b6b";
  },

  applyPreset(count) {
    Object.keys(this.selectedRolesCounts).forEach((key) => { this.selectedRolesCounts[key] = 0; });
    if (count === 5) {
      this.selectedRolesCounts.mafia = 1;
      this.selectedRolesCounts.doctor = 1;
      this.selectedRolesCounts.investigator = 1;
      this.selectedRolesCounts.citizen = 2;
    } else if (count === 6) {
      this.selectedRolesCounts.mafia = 1;
      this.selectedRolesCounts.doctor = 1;
      this.selectedRolesCounts.investigator = 1;
      this.selectedRolesCounts.citizen = 3;
    } else if (count === 8) {
      this.selectedRolesCounts.mafia = 2;
      this.selectedRolesCounts.doctor = 1;
      this.selectedRolesCounts.investigator = 1;
      this.selectedRolesCounts.bodyguard = 1;
      this.selectedRolesCounts.citizen = 3;
    } else if (count === 10) {
      this.selectedRolesCounts.mafia = 2;
      this.selectedRolesCounts.godfather = 1;
      this.selectedRolesCounts.doctor = 1;
      this.selectedRolesCounts.investigator = 1;
      this.selectedRolesCounts.witch = 1;
      this.selectedRolesCounts.hunter = 1;
      this.selectedRolesCounts.jester = 1;
      this.selectedRolesCounts.citizen = 2;
    } else if (count === 12) {
      this.selectedRolesCounts.mafia = 3;
      this.selectedRolesCounts.godfather = 1;
      this.selectedRolesCounts.doctor = 1;
      this.selectedRolesCounts.investigator = 1;
      this.selectedRolesCounts.slasher = 1;
      this.selectedRolesCounts.cupid = 1;
      this.selectedRolesCounts.bodyguard = 1;
      this.selectedRolesCounts.colonel = 1;
      this.selectedRolesCounts.citizen = 2;
    }
    this.renderRolesSetup();
    this.updateRolesBalance();
    this.closeModals();
    this.saveSessionState();
  },
}));
window.addEventListener("gameappready", () => Object.assign(GameApp, {
  t(key, params = {}) {
    let text = translations[this.language]?.[key] || translations.ar?.[key] || key;
    Object.keys(params).forEach((param) => {
      text = text.replace(new RegExp(`{\\s*${param}\\s*}`, "g"), String(params[param]));
    });
    return text;
  },

  localizedRole(roleKey) {
    const role = ROLES_DATA[roleKey];
    const translated = translations[this.language].roles[roleKey];
    return {
      name: translated ? translated[0] : role.name,
      desc: translated ? translated[1] : role.desc,
    };
  },

  localizedTeam(team) {
    return team === "mafia"
      ? this.t("mafiaTeam")
      : team === "town"
        ? this.t("knightsTeam")
        : this.t("neutralTeam");
  },

  applyLanguage() {
    document.documentElement.lang = this.language;
    document.documentElement.dir = this.language === "ar" ? "rtl" : "ltr";
    document.title = `${this.t("gameTitle")} | The Crimson Mafia`;
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const value = this.t(element.dataset.i18n);
      if (value) element.textContent = value;
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
      element.placeholder = this.t(element.dataset.i18nPlaceholder);
    });
    const timerOptions = document.querySelectorAll("#rule-discussion-time option");
    const timerLabels = this.language === "en"
      ? ["90 Seconds", "3 Minutes", "5 Minutes"]
      : ["90 ثانية", "3 دقائق", "5 دقائق"];
    timerOptions.forEach((option, index) => {
      if (timerLabels[index]) option.textContent = timerLabels[index];
    });
    const toggle = document.getElementById("btn-lang-toggle");
    if (toggle) toggle.textContent = this.language === "ar" ? "🌐 EN" : "🌐 AR";
    document.body.classList.toggle(
      "game-active",
      document.querySelector(".screen.active")?.id !== "screen-home",
    );
    this.renderRolesSetup();
    this.renderEncyclopedia();
  },

  toggleLanguage() {
    this.language = this.language === "ar" ? "en" : "ar";
    localStorage.setItem(STORAGE_KEYS.language, this.language);
    this.applyLanguage();
    const activeScreen = document.querySelector(".screen.active")?.id;
    if (activeScreen === "screen-reveal" && this.assignedPlayers.length) {
      this.showRoleReveal(this.distributionIndex);
      const nextPlayer = this.assignedPlayers[this.distributionIndex];
      if (document.getElementById("distribution-handover").classList.contains("active")) {
        this.renderDistributionHandover(nextPlayer);
      }
    }
    if (activeScreen === "screen-night" && this.nightQueue.length) {
      this.displayNightHandover();
      if (this.nightActionVisible) this.showPlayerNightAction();
    }
    if (activeScreen === "screen-day" && this.dayVotingVisible) this.renderVotingTurn();
    if (activeScreen === "screen-execution" && this.executionState) this.renderExecutionState();
  },

  toast(msg) {
    const toastEl = document.getElementById("app-toast");
    toastEl.innerText = msg;
    toastEl.classList.add("show");
    setTimeout(() => toastEl.classList.remove("show"), 2800);
  },
}));
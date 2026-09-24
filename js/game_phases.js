window.addEventListener("gameappready", () => Object.assign(GameApp, {
  showScreen(screenId) {
    document.querySelectorAll(".screen").forEach((screen) => screen.classList.remove("active"));
    const target = document.getElementById(screenId);
    if (target) target.classList.add("active");
    document.body.classList.toggle("game-active", screenId !== "screen-home");
    document.body.classList.toggle("home-active", screenId === "screen-home");
    if (screenId === "screen-night") this.startAmbientAudio();
    else this.stopAmbientAudio();
    window.scrollTo({ top: 0, behavior: "smooth" });
    this.saveSessionState();
  },

  goToHome() {
    this.clearIntervals();
    localStorage.removeItem(STORAGE_KEYS.activeSession);
    document.body.classList.remove("game-active");
    this.showScreen("screen-home");
  },

  goToSetup() {
    localStorage.removeItem(STORAGE_KEYS.activeSession);
    this.showScreen("screen-setup");
  },

  proceedAfterExecution() {
    if (this.checkWinCondition()) return;
    this.dayCount++;
    this.startNightPhase();
  },
}));
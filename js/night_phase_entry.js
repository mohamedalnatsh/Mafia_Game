window.addEventListener("gameappready", () => Object.assign(GameApp, {
  startNightPhase() {
    this.rollNightEvents();
    this.nightActions = {
      mafiaTarget: null,
      doctorTarget: null,
      investigatorTarget: null,
      investigatorResult: null,
      sniperTarget: null,
      slasherTarget: null,
      bodyguardTarget: null,
      witchHeal: false,
      witchHealTarget: null,
      witchKillTarget: null,
      mafiaActorId: null,
      cupidLovers: [],
      framedPlayer: null,
    };
    this.nightQueue = this.assignedPlayers.filter((player) => player.isAlive);
    this.nightQueueIndex = 0;
    this.showScreen("screen-night");
    this.displayNightHandover();
    this.nightActionVisible = false;
    this.saveSessionState();
  },

  displayNightHandover() {
    const current = this.nightQueue?.[this.nightQueueIndex];
    if (!current) {
      this.nightActionVisible = false;
      return;
    }
    document.getElementById("night-handover-box").style.display = "block";
    document.getElementById("night-action-box").style.display = "none";
    document.getElementById("night-current-player-name").innerText = current.name;
    const nightPrompt = document.querySelector("#night-handover-box p");
    if (nightPrompt) nightPrompt.innerText = this.t("passNight");
    this.startTurnTimer("night-handover");
    SoundEngine.playTone(330, "sine", 0.2);
  },
}));
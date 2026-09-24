window.addEventListener("gameappready", () => Object.assign(GameApp, {
  clearIntervals() {
    if (this.discussionTimerInterval) clearInterval(this.discussionTimerInterval);
    this.clearTurnTimer();
  },

  startTurnTimer(kind) {
    this.clearTurnTimer();
    if (!this.rules.speedVoting) return;
    this.turnTimerKind = kind;
    this.turnSecondsLeft = 15;
    const element = kind === "distribution-handover"
      ? document.getElementById("distribution-turn-timer")
      : kind === "night-handover"
        ? document.getElementById("night-turn-timer")
        : kind === "night-action"
          ? document.getElementById("night-action-timer")
          : kind === "voting-handover"
            ? document.getElementById("voting-turn-timer")
            : document.getElementById("voting-action-timer");
    const update = () => {
      if (element) element.innerText = `⏱️ ${this.turnSecondsLeft} ثانية`;
    };
    update();
    this.turnTimerInterval = setInterval(() => {
      this.turnSecondsLeft -= 1;
      update();
      if (this.turnSecondsLeft <= 0) {
        this.clearTurnTimer();
        if (kind === "distribution-handover") this.nextDistributionPlayer();
        else if (kind === "night-handover" || kind === "night-action") {
          const player = this.nightQueue[this.nightQueueIndex];
          if (player) this.finishNightAction(player);
        } else if (kind === "voting-handover" || kind === "voting-action") {
          this.skipVote();
        }
      }
    }, 1000);
  },

  clearTurnTimer() {
    if (this.turnTimerInterval) clearInterval(this.turnTimerInterval);
    this.turnTimerInterval = null;
    this.turnTimerKind = null;
    ["distribution-turn-timer", "night-turn-timer", "night-action-timer", "voting-turn-timer", "voting-action-timer"].forEach((id) => {
      const element = document.getElementById(id);
      if (element) element.innerText = "";
    });
  },

  startAmbientAudio() {
    if (this.ambientAudio) return;
    try {
      SoundEngine.init();
      if (!SoundEngine.ctx) return;
      const oscillator = SoundEngine.ctx.createOscillator();
      const gain = SoundEngine.ctx.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = 80;
      gain.gain.value = 0.012;
      oscillator.connect(gain);
      gain.connect(SoundEngine.ctx.destination);
      oscillator.start();
      this.ambientAudio = { oscillator, gain };
    } catch (error) {}
  },

  stopAmbientAudio() {
    if (!this.ambientAudio) return;
    try {
      this.ambientAudio.oscillator.stop();
      this.ambientAudio.oscillator.disconnect();
      this.ambientAudio.gain.disconnect();
    } catch (error) {}
    this.ambientAudio = null;
  },
}));
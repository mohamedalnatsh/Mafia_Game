window.addEventListener("gameappready", () => Object.assign(GameApp, {
  startDayDiscussion() {
    this.showScreen("screen-day");
    document.getElementById("day-discussion-box").style.display = "block";
    document.getElementById("day-voting-box").style.display = "none";
    this.discussionSecondsLeft = this.rules.discussionTime;
    this.updateTimerDisplay();
    this.dayVotingVisible = false;
    this.startTimer();
    if (this.currentEvents.eclipse) this.toast("🌑 كسوف الشمس: لا يوجد تصويت أو إقصاء اليوم.");
    this.saveSessionState();
  },

  startTimer() {
    this.clearIntervals();
    this.timerRunning = true;
    document.getElementById("btn-timer-toggle").innerText = this.t("pause");
    this.discussionTimerInterval = setInterval(() => {
      if (this.discussionSecondsLeft > 0) {
        this.discussionSecondsLeft--;
        this.updateTimerDisplay();
        if (this.discussionSecondsLeft <= 10) SoundEngine.clockTick();
      } else {
        this.clearIntervals();
        SoundEngine.gong();
        this.toast(this.t("timerEnded"));
      }
    }, 1000);
  },

  toggleDiscussionTimer() {
    if (this.timerRunning) {
      this.clearIntervals();
      this.timerRunning = false;
      document.getElementById("btn-timer-toggle").innerText = this.t("resume");
    } else {
      this.startTimer();
    }
    this.saveSessionState();
  },

  addTimerSeconds(sec) {
    this.discussionSecondsLeft += sec;
    this.updateTimerDisplay();
    this.saveSessionState();
  },

  resetDiscussionTimer() {
    this.discussionSecondsLeft = this.rules.discussionTime;
    this.updateTimerDisplay();
    this.saveSessionState();
  },

  updateTimerDisplay() {
    const minutes = Math.floor(this.discussionSecondsLeft / 60);
    const seconds = this.discussionSecondsLeft % 60;
    document.getElementById("day-timer-display").innerText = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  },
}));
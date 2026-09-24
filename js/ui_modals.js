window.addEventListener("gameappready", () => Object.assign(GameApp, {
  openExitModal() {
    document.getElementById("modal-exit-confirm").classList.add("active");
  },

  closeExitModal() {
    document.getElementById("modal-exit-confirm").classList.remove("active");
  },

  confirmExit() {
    this.clearIntervals();
    localStorage.removeItem(STORAGE_KEYS.activeSession);
    this.closeExitModal();
    this.showScreen("screen-home");
    document.body.classList.remove("game-active");
  },

  openInvestigationModal(target, onClose) {
    const result = this.getInvestigationResult(target);
    document.getElementById("investigation-target-name").innerText = target.name;
    const resultText = document.getElementById("investigation-result-text");
    resultText.innerText = result.text;
    resultText.className = result.badgeClass;
    document.getElementById("modal-investigation-result").classList.add("active");
    this.pendingInvestigationClose = onClose;
  },

  closeInvestigationModal() {
    document.getElementById("modal-investigation-result").classList.remove("active");
    const onClose = this.pendingInvestigationClose;
    this.pendingInvestigationClose = null;
    if (onClose) onClose();
  },

  openSpecialModal(title, desc, callback, candidateFilter = null) {
    document.getElementById("special-modal-title").innerText = title;
    document.getElementById("special-modal-desc").innerText = desc;
    const container = document.getElementById("special-modal-targets");
    container.innerHTML = "";
    let chosenTargetId = null;
    const alivePlayers = this.assignedPlayers.filter(
      (player) => player.isAlive && (!candidateFilter || candidateFilter(player)),
    );
    alivePlayers.forEach((player) => {
      const button = document.createElement("button");
      button.className = "player-btn";
      button.innerHTML = `<span>🎯 ${this.escapeHtml(player.name)}</span>`;
      button.onclick = () => {
        chosenTargetId = player.id;
        this.refreshSelection(container, button);
      };
      container.appendChild(button);
    });
    document.getElementById("modal-special-action").classList.add("active");
    this.pendingSpecialAction = () => {
      if (!chosenTargetId) {
        this.toast(this.t("targetRequired"));
        return;
      }
      callback(chosenTargetId);
      document.getElementById("modal-special-action").classList.remove("active");
    };
  },

  confirmSpecialAction() {
    if (this.pendingSpecialAction) this.pendingSpecialAction();
  },

  showSkipVoteModal() {
    this.clearIntervals();
    document.getElementById("modal-skip-vote").classList.add("active");
    this.saveSessionState();
  },

  continueAfterSkipVote() {
    document.getElementById("modal-skip-vote").classList.remove("active");
    this.dayCount++;
    this.startNightPhase();
  },

  openVersionAnnouncement() {
    this.renderModalTemplates?.();
    const modal = document.getElementById("modal-version-announcement");
    if (!modal) return;
    const closeButton = modal.querySelector("[data-action='close-version-announcement']");
    if (closeButton) closeButton.textContent = "استمرار إلى المملكة";
    modal.classList.add("active");
  },

  closeVersionAnnouncement() {
    localStorage.setItem("seen_version_v3.3", "true");
    document.getElementById("modal-version-announcement")?.classList.remove("active");
  },

  openChangelog() {
    this.renderModalTemplates?.();
    const modal = document.getElementById("modal-changelog");
    const closeButton = modal?.querySelector("[data-action='close-modals']");
    if (closeButton) closeButton.textContent = "إغلاق";
    modal?.classList.add("active");
  },

  openEncyclopedia() {
    this.renderModalTemplates?.();
    document.getElementById("modal-encyclopedia").classList.add("active");
  },

  openPresetModal() {
    this.renderModalTemplates?.();
    document.getElementById("modal-presets").classList.add("active");
  },

  openStatsModal() {
    this.renderStats();
    document.getElementById("modal-stats").classList.add("active");
  },

  openScoringGuide() {
    document.getElementById("modal-scoring-guide").classList.add("active");
  },

  closeModals() {
    document.querySelectorAll(".modal-overlay").forEach((modal) => modal.classList.remove("active"));
  },
}));
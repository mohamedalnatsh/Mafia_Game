const GLOBAL_ACTIONS = {
  "toggle-language": () => GameApp.toggleLanguage(),
  "open-exit-modal": () => GameApp.openExitModal(),
  "toggle-notepad": () => GameApp.toggleNotepad(),
  "open-changelog": () => GameApp.openChangelog(),
  "go-to-setup": () => GameApp.goToSetup(),
  "open-encyclopedia": () => GameApp.openEncyclopedia(),
  "install-app": () => GameApp.installApp(),
  "open-stats-modal": () => GameApp.openStatsModal(),
  "open-preset-modal": () => GameApp.openPresetModal(),
  "switch-setup-tab": (el) => GameApp.switchSetupTab(el.dataset.setupTab || "players"),
  "quick-fill-players": () => GameApp.quickFillPlayers(),
  "add-player": () => GameApp.addPlayer(),
  "go-to-home": () => GameApp.goToHome(),
  "open-scoring-guide": () => GameApp.openScoringGuide(),
  "show-seating-arrangement": () => GameApp.showSeatingArrangement(),
  "start-role-distribution": () => GameApp.startRoleDistribution(),
  "next-distribution-player": () => GameApp.nextDistributionPlayer(),
  "confirm-distribution-handover": () => GameApp.confirmDistributionHandover(),
  "show-player-night-action": () => GameApp.showPlayerNightAction(),
  "submit-night-action": () => GameApp.submitNightAction(),
  "start-day-discussion": () => GameApp.startDayDiscussion(),
  "toggle-discussion-timer": () => GameApp.toggleDiscussionTimer(),
  "add-timer-seconds": (el) => GameApp.addTimerSeconds(Number(el.dataset.seconds || 30)),
  "reset-discussion-timer": () => GameApp.resetDiscussionTimer(),
  "start-voting-phase": () => GameApp.startVotingPhase(),
  "confirm-voting-handover": () => GameApp.confirmVotingHandover(),
  "submit-vote": () => GameApp.submitVote(),
  "skip-vote": () => GameApp.skipVote(),
  "proceed-after-execution": () => GameApp.proceedAfterExecution(),
  "restart-game": (el) => GameApp.restartGame(Boolean(Number(el.dataset.restartHard || 0)) || el.dataset.restartHard === "true"),
  "close-modals": () => GameApp.closeModals(),
  "close-version-announcement": () => GameApp.closeVersionAnnouncement(),
  "apply-preset": (el) => GameApp.applyPreset(Number(el.dataset.presetId || 0)),
  "reset-all-stats": () => GameApp.resetAllStats(),
  "confirm-exit": () => GameApp.confirmExit(),
  "close-exit-modal": () => GameApp.closeExitModal(),
  "continue-after-skip-vote": () => GameApp.continueAfterSkipVote(),
  "confirm-special-action": () => GameApp.confirmSpecialAction(),
  "close-investigation-modal": () => GameApp.closeInvestigationModal(),
  "save-notepad": () => GameApp.saveNotepad(),
  "remove-player": (el) => GameApp.removePlayer(Number(el.dataset.playerIndex ?? 0)),
  "change-role-count": (el) => GameApp.changeRoleCount(el.dataset.roleKey, Number(el.dataset.delta || 0)),
};

function setupGlobalUIHandlers() {
  if (document.documentElement.dataset.globalUiBound === "true") return;
  document.documentElement.dataset.globalUiBound = "true";

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-action]");
    if (!trigger || !GameApp) return;

    const actionName = trigger.dataset.action;
    const executor = GLOBAL_ACTIONS[actionName];
    if (!executor) return;

    event.preventDefault();
    executor(trigger);
  });

  document.addEventListener("keydown", (event) => {
    const target = event.target;
    if (target && target.id === "new-player-input" && event.key === "Enter") {
      event.preventDefault();
      GameApp.addPlayer();
    }
  });
}

window.addEventListener("gameappready", () => {
  setupGlobalUIHandlers();
  Object.assign(GameApp, {
    init() {
      this.applyLanguage();
      this.loadSavedData();
      this.loadSavedPresets();
      this.loadRulesConfig();
      this.saveRulesConfig();
      this.renderModalTemplates();
      this.renderRolesSetup();
      this.renderPlayerChips();
      this.updatePlayerCountDisplay();
      this.renderEncyclopedia();
      this.bindRoleRevealCard();
      this.bindPersistenceControls();
      this.bindRuleDescriptions();
      this.syncRuleControls();
      this.restoreSessionState();
      this.syncHomeState();

      if (localStorage.getItem("seen_version_v3.3") !== "true") {
        this.openVersionAnnouncement();
      }

      if (!localStorage.getItem(STORAGE_KEYS.changelogSeen) || sessionStorage.getItem("mafia_show_v2_changelog") === "1") {
        this.openChangelog();
        localStorage.setItem(STORAGE_KEYS.changelogSeen, "1");
        sessionStorage.removeItem("mafia_show_v2_changelog");
      }
    },

    loadSavedPresets() {
      // Reserved for persisted preset definitions.
    },
  });
});
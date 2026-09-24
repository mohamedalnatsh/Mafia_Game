window.addEventListener("gameappready", () => Object.assign(GameApp, {
  toggleNotepad() {
    const panel = document.getElementById("notepad-panel");
    if (!panel) return;
    const activePlayer = this.nightQueue?.[this.nightQueueIndex] ||
      this.assignedPlayers.filter((player) => player.isAlive)[this.currentVoterIndex];
    if (activePlayer) {
      document.getElementById("player-notepad").value = this.playerNotes[activePlayer.id] || "";
      panel.dataset.playerId = activePlayer.id;
    }
    panel.classList.toggle("active");
  },

  saveNotepad() {
    const panel = document.getElementById("notepad-panel");
    const playerId = Number(panel.dataset.playerId);
    if (playerId) this.playerNotes[playerId] = document.getElementById("player-notepad").value;
    this.saveSessionState();
    panel.classList.remove("active");
  },
}));
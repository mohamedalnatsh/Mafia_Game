window.addEventListener("DOMContentLoaded", () => {
  if (!window.GameApp || typeof window.GameApp.init !== "function") return;

  window.GameApp.init();
  if (window.GameApp.players.length === 0) window.GameApp.quickFillPlayers();
});
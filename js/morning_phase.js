window.addEventListener("gameappready", () => Object.assign(GameApp, {
  renderMorningScreen() {
    this.rollDayEvents();
    this.showScreen("screen-morning");
    document.getElementById("morning-day-number").innerText = this.dayCount;
    const newsList = document.getElementById("morning-news-list");
    newsList.innerHTML = "";
    this.morningReports.forEach((message) => {
      const item = document.createElement("div");
      item.className = "news-item";
      item.innerHTML = `<span>📌</span> <div>${message}</div>`;
      newsList.appendChild(item);
    });
    const aliveGrid = document.getElementById("morning-alive-grid");
    aliveGrid.innerHTML = "";
    const alivePlayers = this.assignedPlayers.filter((player) => player.isAlive);
    document.getElementById("alive-count").innerText = alivePlayers.length;
    this.assignedPlayers.forEach((player) => {
      const badge = document.createElement("span");
      badge.style.cssText = `padding:0.35rem 0.7rem; border-radius:12px; font-size:0.85rem; font-weight:600; background:${player.isAlive ? "#1e1e2c" : "#3a1118"}; color:${player.isAlive ? "#fff" : "#888"}; border:1px solid ${player.isAlive ? "#45455e" : "#5a1d26"}; ${!player.isAlive ? "text-decoration:line-through;" : ""}`;
      badge.innerText = `${player.isAlive ? "🛡️" : "💀"} ${player.name}`;
      aliveGrid.appendChild(badge);
    });
    SoundEngine.gong();
    if (this.checkWinCondition()) return;
  },

  rollDayEvents() { RandomEvents.rollDayEvents(this); },
  rollNightEvents() { RandomEvents.rollNightEvents(this); },
}));
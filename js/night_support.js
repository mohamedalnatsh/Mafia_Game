window.addEventListener("gameappready", () => Object.assign(GameApp, {
  recordKill(actorId, targetId, source) {
    const target = this.assignedPlayers.find((player) => player.id === targetId);
    const actor = this.assignedPlayers.find((player) => player.id === actorId);
    if (!target || !actor) return;
    this.killHistory.push({ actorId, targetId, source });
  },

  markDeath(player) {
    if (!player || this.deathOrder.includes(player.id)) return;
    this.deathOrder.push(player.id);
    if (!this.firstDeathPlayerId) this.firstDeathPlayerId = player.id;
  },

  claimCopycatRole(deceasedPlayer) {
    if (this.copycatClaimed || !deceasedPlayer) return;
    const copycat = this.assignedPlayers.find((player) => {
      if (player.id === deceasedPlayer.id || !player.isAlive) return false;
      return player.roleKey === "copycat" || player.publicRoleKey === "copycat" || player.originalRoleKey === "copycat" || player.isCopycatTransformed;
    });
    if (!copycat) return;
    const inheritedRoleKey = deceasedPlayer.roleKey || deceasedPlayer.inheritedRoleKey;
    if (!inheritedRoleKey || inheritedRoleKey === "copycat") return;
    copycat.originalRoleKey = copycat.originalRoleKey || copycat.roleKey || "copycat";
    copycat.publicRoleKey = "copycat";
    copycat.inheritedRoleKey = inheritedRoleKey;
    copycat.roleKey = inheritedRoleKey;
    copycat.isCopycatTransformed = true;
    this.copycatClaimed = true;
  },

  recordSpecialMafiaKill(actorId, targetId, source) {
    const target = this.assignedPlayers.find((player) => player.id === targetId);
    const actor = this.assignedPlayers.find((player) => player.id === actorId);
    if (!target || !actor) return;
    this.recordKill(actorId, targetId, source);
    if (!["mafia", "godfather", "framer"].includes(target.roleKey)) return;
    if (!this.specialMafiaKills[actorId]) this.specialMafiaKills[actorId] = [];
    this.specialMafiaKills[actorId].push({ targetId, source });
  },
}));
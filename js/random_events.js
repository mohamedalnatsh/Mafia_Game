const RandomEvents = {
  rollDayEvents(game) {
    if (game.lastEventDay === game.dayCount) return;
    const events = game.rules.events || {};
    const roll = (event) => Boolean(
      event?.enabled &&
        Math.random() * 100 <
          Math.min(100, Math.max(20, Number(event.rate) || 30)),
    );
    const previousCurfew = game.curfewPlayerId;
    if (previousCurfew) {
      const previousPlayer = game.assignedPlayers.find(
        (player) => player.id === previousCurfew,
      );
      if (previousPlayer && previousPlayer.roleKey !== "idiot") {
        previousPlayer.cannotVote = false;
      }
    }
    game.currentEvents.eclipse = roll(events.eclipse);
    game.currentEvents.decree = roll(events.decree);
    game.currentEvents.rumors = roll(events.rumors);
    game.currentEvents.curfew = roll(events.curfew);
    game.curfewPlayerId = null;
    const alivePlayers = game.assignedPlayers.filter((player) => player.isAlive);
    if (game.currentEvents.curfew && alivePlayers.length) {
      const target = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
      game.curfewPlayerId = target.id;
      target.cannotVote = true;
    }
    game.lastEventDay = game.dayCount;
    const messages = [];
    if (game.currentEvents.eclipse)
      messages.push("🌑 كسوف الشمس: أُغلقت منصة التصويت اليوم.");
    if (game.currentEvents.fog)
      messages.push("🌫️ ضباب الليل: فشلت التحقيقات السرية هذه الليلة.");
    if (game.currentEvents.decree)
      messages.push("📜 مرسوم الملك: أصبحت أصوات المجلس مجهولة.");
    const livingKnights = alivePlayers.filter(
      (player) => ROLES_DATA[player.roleKey]?.team === "town",
    );
    if (game.currentEvents.rumors && livingKnights.length) {
      const target = livingKnights[Math.floor(Math.random() * livingKnights.length)];
      messages.push(
        `📣 وصلت شائعة في السوق أن [${game.escapeHtml(target.name)}] ينتمي لفرسان المملكة!`,
      );
    }
    if (game.currentEvents.curfew && game.curfewPlayerId) {
      messages.push("⛓️ فُرض حظر التجول على لاعب حي.");
    }
    game.morningReports.push(...messages);
    game.saveSessionState();
  },

  rollNightEvents(game) {
    const events = game.rules.events || {};
    const roll = (event) => Boolean(
      event?.enabled && Math.random() * 100 < Math.min(100, Math.max(20, Number(event.rate) || 30)),
    );
    game.currentEvents.sandstorm = roll(events.sandstorm);
    game.currentEvents.festival = roll(events.festival);
    game.currentEvents.fog = roll(events.fog);
    game.currentEvents.doctorDisabled = game.currentEvents.sandstorm;
    game.currentEvents.mafiaKillsDisabled = game.currentEvents.festival;
    game.currentEvents.serialKillerKillsDisabled = game.currentEvents.festival;
  },
};
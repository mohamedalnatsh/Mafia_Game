window.addEventListener("gameappready", () => Object.assign(GameApp, {
  loadRulesConfig() {
    const fallback = structuredClone(DEFAULT_RULES);
    const saved = (() => {
      try {
        const text = localStorage.getItem("mafia_rules_config");
        return text ? JSON.parse(text) : null;
      } catch (error) {
        return null;
      }
    })();

    const mergedEvents = { ...fallback.events };
    const savedEvents = saved && typeof saved.events === "object" ? saved.events : {};

    Object.keys(mergedEvents).forEach((eventKey) => {
      const source = savedEvents[eventKey] || {};
      mergedEvents[eventKey] = {
        enabled: Boolean(source.enabled ?? fallback.events[eventKey].enabled),
        rate: Number.isFinite(Number(source.rate)) ? Number(source.rate) : fallback.events[eventKey].rate,
      };
    });

    const config = {
      ...fallback,
      ...(saved || {}),
      events: mergedEvents,
    };

    this.rules = {
      ...fallback,
      ...config,
      events: mergedEvents,
    };

    return this.rules;
  },

  saveRulesConfig() {
    const events = this.rules?.events || DEFAULT_RULES.events;
    const config = {
      revealRoleOnDeath: Boolean(this.rules?.revealRoleOnDeath ?? false),
      showVoteBreakdown: Boolean(this.rules?.showVoteBreakdown ?? false),
      discussionTime: Number(this.rules?.discussionTime) || 180,
      jesterCurse: Boolean(this.rules?.jesterCurse ?? false),
      doubleSniper: Boolean(this.rules?.doubleSniper ?? false),
      fierceBodyguard: Boolean(this.rules?.fierceBodyguard ?? false),
      speedVoting: Boolean(this.rules?.speedVoting ?? false),
      events: {
        eclipse: {
          enabled: Boolean(events.eclipse?.enabled ?? false),
          rate: Number(events.eclipse?.rate) || 30,
        },
        fog: {
          enabled: Boolean(events.fog?.enabled ?? false),
          rate: Number(events.fog?.rate) || 30,
        },
        decree: {
          enabled: Boolean(events.decree?.enabled ?? false),
          rate: Number(events.decree?.rate) || 30,
        },
        sandstorm: {
          enabled: Boolean(events.sandstorm?.enabled ?? false),
          rate: Number(events.sandstorm?.rate) || 30,
        },
        festival: {
          enabled: Boolean(events.festival?.enabled ?? false),
          rate: Number(events.festival?.rate) || 30,
        },
        rumors: {
          enabled: Boolean(events.rumors?.enabled ?? false),
          rate: Number(events.rumors?.rate) || 30,
        },
        curfew: {
          enabled: Boolean(events.curfew?.enabled ?? false),
          rate: Number(events.curfew?.rate) || 30,
        },
      },
    };

    localStorage.setItem("mafia_rules_config", JSON.stringify(config));
    return config;
  },
}));

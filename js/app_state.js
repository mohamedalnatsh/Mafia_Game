      const GameApp = window.GameApp = {
        language: localStorage.getItem(STORAGE_KEYS.language) === "en" ? "en" : "ar",
        players: [],
        selectedRolesCounts: {},
        assignedPlayers: [], // { id, name, roleKey, isAlive, cannotVote, isLover }

        // حالات اللعبة
        dayCount: 1,
        distributionIndex: 0,
        nightQueue: [],
        nightQueueIndex: 0,

        // إجراءات الليلة الحالية
        nightActions: {
          mafiaTarget: null,
          doctorTarget: null,
          investigatorTarget: null,
          investigatorResult: null,
          sniperTarget: null,
          slasherTarget: null,
          bodyguardTarget: null,
          witchHeal: false,
          witchHealTarget: null,
          witchKillTarget: null,
          cupidLovers: [],
          framedPlayer: null,
          investigatorTarget: null,
        },
        doctorSelfHealUsed: false,

        // الموارد ذات الاستخدام الواحد
        witchHealUsed: false,
        witchPoisonUsed: false,
        sniperBulletAvailable: true,
        sniperBullets: 1,
        lovers: [], // [id1, id2]

        // سجلات الصباح والتصويت
        morningReports: [],
        votes: {}, // voterId -> targetId
        currentVoterIndex: 0,
        discussionTimerInterval: null,
        discussionSecondsLeft: 180,
        timerRunning: false,

        // التفضيلات والقواعد
        rules: structuredClone(DEFAULT_RULES),

        playerStats: {},
        resultsRecorded: false,
        restoringSession: false,
        nightActionVisible: false,
        dayVotingVisible: false,
        currentSetupTab: "players",
        revoteCandidates: null,
        isRevote: false,

        pendingSpecialAction: null, // { type: 'hunter'|'kamikaze', actorId, callback }
        executionState: null,
        voteHistory: [],
        specialMafiaKills: {},
        killHistory: [],
        mafiaActorId: null,
        votedOutByDay: [],
        scoreEvents: [],
        mafiaNote: "",
        playerNotes: {},
        currentEvents: structuredClone(DEFAULT_CURRENT_EVENTS),
        curfewPlayerId: null,
        copycatClaimed: false,
        turnTimerInterval: null,
        turnTimerKind: null,
        turnSecondsLeft: 15,
        executionerTarget: null,
        mayorRevealed: {},
        lastNightAttacks: [],
        lastEventDay: 0,
        badges: [],
        firstDeathPlayerId: null,
        deathOrder: [],
        jesterCurseTarget: null,
        ambientAudio: null,
        versionChangelogShown: false,
        lastWinningTeam: null,

        /* =================== التهيئة والتنقل =================== */
        /* =================== إعداد اللاعبين والأدوار =================== */
        /* =================== توزيع الأدوار السرية =================== */
        /* =================== المرحلة الليلية (Night Phase) =================== */
        /* =================== معالجة أحداث الليل وتقرير الصباح =================== */

      };

window.dispatchEvent(new Event("gameappready"));
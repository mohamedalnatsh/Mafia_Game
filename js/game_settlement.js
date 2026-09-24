window.addEventListener("gameappready", () => Object.assign(GameApp, {
        tallyVotesAndExecute() {
          const counts = {}; // targetId -> count
          const votersDetails = [];
          let skipVotes = 0;

          Object.keys(this.votes).forEach((voterId) => {
            const targetId = this.votes[voterId];
            const voter = this.assignedPlayers.find((p) => p.id == voterId);
            const weight = voter && voter.roleKey === "colonel"
              ? 2
              : voter && voter.roleKey === "mayor" && this.mayorRevealed[voter.id]
                ? 3
                : 1;
            if (targetId === null || targetId === undefined) {
              skipVotes += weight;
              return;
            }
            const target = this.assignedPlayers.find((p) => p.id == targetId);
            counts[targetId] = (counts[targetId] || 0) + weight;

            if (voter && target && !this.currentEvents.decree) {
              votersDetails.push(
                `• [${this.escapeHtml(voter.name)}] ${this.t("voteAgainst")} [${this.escapeHtml(target.name)}] ${weight > 1 ? this.t("doubleWeight") : ""}`,
              );
            }
          });

          // إيجاد أعلى تصويت
          const maxVotes = Math.max(0, ...Object.values(counts));
          if (skipVotes >= maxVotes) {
            this.showSkipVoteModal();
            return;
          }
          const tiedIds = Object.keys(counts)
            .filter((targetId) => counts[targetId] === maxVotes)
            .map(Number);
          const executedId =
            tiedIds.length === 1 && maxVotes > 0 ? tiedIds[0] : null;

          if (tiedIds.length > 1) {
            alert(this.t("tieMessage"));
            this.startVotingPhase(tiedIds, true);
            return;
          }

          this.showScreen("screen-execution");
          const titleEl = document.getElementById("exec-title");
          const descEl = document.getElementById("exec-description");
          const revealBox = document.getElementById("exec-role-reveal-box");
          const tallyBox = document.getElementById("exec-votes-tally-box");
          const tallyList = document.getElementById("exec-votes-tally-list");

          // إظهار تفاصيل الأصوات إن كانت مفعلة
          if (this.rules.showVoteBreakdown) {
            tallyBox.style.display = "block";
            tallyList.innerHTML = votersDetails
              .map((d) => `<div>${d}</div>`)
              .join("");
          } else {
            tallyBox.style.display = "none";
          }

          if (!executedId || maxVotes === 0) {
            this.executionState = { type: "tie" };
            titleEl.innerText = this.t("tieTitle");
            descEl.innerText = this.t("tieDesc");
            revealBox.style.display = "none";
            SoundEngine.gong();
            return;
          }

          const executedPlayer = this.assignedPlayers.find(
            (p) => p.id === executedId,
          );
          this.claimCopycatRole(executedPlayer);

          if (this.executionerTarget === executedPlayer.id) {
            const executioner = this.assignedPlayers.find((player) => player.roleKey === "executioner");
            if (executioner) this.recordScoreEvent("executionerVictory", executioner.id, executedPlayer.id);
            this.endGame("executioner", `⚖️ نجح الجلاد في إقصاء هدفه: ${executedPlayer.name}!`);
            return;
          }

          // قاعدة المهرج (Jester)
          if (executedPlayer.roleKey === "jester") {
            this.recordScoreEvent("jokerVictory", executedPlayer.id);
            executedPlayer.isAlive = false;
            const finishJester = (curseTargetId = null) => {
              this.jesterCurseTarget = curseTargetId;
              if (curseTargetId) {
                const curseTarget = this.assignedPlayers.find((p) => p.id === curseTargetId);
                if (curseTarget) curseTarget.isAlive = false;
              }
              this.endGame("jester", this.t("jesterWin", { name: executedPlayer.name }));
            };
            if (this.rules.jesterCurse) {
              this.openSpecialModal(
                "انتقام المهرج",
                "اختر أحداً ممن صوتوا ضدك لتأخذه معك للقبر",
                finishJester,
                (candidate) => this.voteHistory.some((vote) => vote.voterId === candidate.id && vote.targetId === executedPlayer.id),
              );
            } else {
              finishJester();
            }
            return;
          }

          // قاعدة المجنون (Idiot)
          if (executedPlayer.roleKey === "idiot") {
            this.executionState = { type: "idiot", name: executedPlayer.name };
            executedPlayer.cannotVote = true;
            titleEl.innerText = this.t("idiotTitle");
            descEl.innerText = this.t("idiotDesc", {
              name: executedPlayer.name,
            });
            revealBox.style.display = "none";
            SoundEngine.playTone(300, "sawtooth", 0.4);
            return;
          }

          // الإعدام الفعلي
          this.executionState = {
            type: "execution",
            name: executedPlayer.name,
            roleKey: executedPlayer.roleKey,
            loverName: null,
          };
          this.votedOutByDay.push(executedPlayer.id);
          if (["mafia", "godfather", "framer"].includes(executedPlayer.roleKey)) {
            Object.keys(this.votes).forEach((voterId) => {
              const voter = this.assignedPlayers.find(
                (player) => player.id === Number(voterId),
              );
              if (
                voter?.roleKey === "colonel" &&
                this.votes[voterId] === executedPlayer.id
              ) {
                this.recordScoreEvent(
                  "colonelLead",
                  voter.id,
                  executedPlayer.id,
                );
              }
            });
          }
          executedPlayer.isAlive = false;
          this.markDeath(executedPlayer);
          SoundEngine.swordSlash();

          titleEl.innerText = this.t("executionTitle", {
            name: executedPlayer.name,
          });
          descEl.innerText = this.t("executionDesc", {
            name: executedPlayer.name,
          });

          // كشف الدور
          if (this.rules.revealRoleOnDeath) {
            revealBox.style.display = "block";
            const r = ROLES_DATA[executedPlayer.roleKey];
            document.getElementById("exec-revealed-role").innerText =
              `${r.icon} ${this.localizedRole(executedPlayer.roleKey).name} (${this.localizedTeam(r.team)})`;
          } else {
            revealBox.style.display = "none";
          }

          // التحقق من المربوطين
          if (executedPlayer.isLover) {
            const otherLoverId = this.lovers.find(
              (id) => id !== executedPlayer.id,
            );
            const otherLover = this.assignedPlayers.find(
              (p) => p.id === otherLoverId,
            );
            if (otherLover && otherLover.isAlive) {
              this.markDeath(otherLover);
              otherLover.isAlive = false;
              this.executionState.loverName = otherLover.name;
              descEl.innerHTML += `<br><span style="color:#ff6b6b;">${this.t("loverDeath", { name: otherLover.name })}</span>`;
            }
          }

          // التحقق من أدوار الانتقام الخاصة
          if (executedPlayer.roleKey === "hunter") {
            this.triggerHunterRevenge(executedPlayer);
          } else if (executedPlayer.roleKey === "kamikaze") {
            this.triggerKamikazeRetaliation(executedPlayer);
          }
        },

        /* =================== شروط النصر والختام (Win Conditions) =================== */
        endGame(winningTeam, message) {
          this.clearIntervals();
          this.lastWinningTeam = winningTeam;
          this.calculateBadges();
          this.recordGameResults(winningTeam);
          localStorage.removeItem(STORAGE_KEYS.activeSession);
          this.showScreen("screen-gameover");

          const titleEl = document.getElementById("victory-title");
          const descEl = document.getElementById("victory-desc");
          const iconEl = document.getElementById("victory-icon");

          descEl.innerText = message;

          if (winningTeam === "town") {
            titleEl.innerText = this.t("townVictoryTitle");
            iconEl.innerText = "👑";
            titleEl.style.color = "#69db7c";
          } else if (winningTeam === "mafia") {
            titleEl.innerText = this.t("mafiaVictoryTitle");
            iconEl.innerText = "☠️";
            titleEl.style.color = "#ff6b6b";
          } else if (winningTeam === "jester") {
            titleEl.innerText = this.t("jesterVictoryTitle");
            iconEl.innerText = "🎭";
            titleEl.style.color = "#ffd43b";
          } else if (winningTeam === "slasher") {
            titleEl.innerText = this.t("slasherVictoryTitle");
            iconEl.innerText = "🩸";
            titleEl.style.color = "#ff4d4d";
          } else if (winningTeam === "lovers") {
            titleEl.innerText = this.t("loversVictoryTitle");
            iconEl.innerText = "💖";
            titleEl.style.color = "#ff85a2";
          } else if (winningTeam === "executioner") {
            titleEl.innerText = "⚖️ انتصار الجلاد!";
            iconEl.innerText = "⚖️";
            titleEl.style.color = "#f3c969";
          }

          const rolesList = document.getElementById("gameover-roles-list");
          rolesList.innerHTML = "";
          this.assignedPlayers.forEach((p) => {
            const role = ROLES_DATA[p.roleKey];
            const item = document.createElement("div");
            item.style.cssText =
              "padding:0.4rem 0.6rem; background:#11111a; border-radius:6px; display:flex; justify-content:space-between; align-items:center; font-size:0.85rem;";
            item.innerHTML = `
            <span><strong>${this.escapeHtml(p.name)}</strong> ${p.isLover ? `🪢 ${this.t("loverLabel")}` : ""}</span>
            <span class="role-type-badge team-${role.team}">${role.icon} ${this.escapeHtml(this.localizedRole(p.roleKey).name)} (${p.isAlive ? this.t("alive") : this.t("dead")})</span>
          `;
            rolesList.appendChild(item);
          });

          this.renderAchievements();
          setTimeout(() => document.getElementById("modal-achievements")?.classList.add("active"), 250);

          SoundEngine.victory();
        },

        recordGameResults(winningTeam) {
          if (this.resultsRecorded) return;

          this.assignedPlayers.forEach((player) => {
            const stats = this.ensurePlayerStats(player.name);
            const role = ROLES_DATA[player.roleKey];
            const sessionKills = this.killHistory.filter(
              (kill) => kill.actorId === player.id,
            ).length;
            let isWinner = false;
            const votedCorrectly = this.voteHistory.some(
              (vote) =>
                vote.voterId === player.id &&
                vote.targetId !== null &&
                ["mafia", "godfather", "framer"].includes(
                  this.assignedPlayers.find(
                    (target) => target.id === vote.targetId,
                  )?.roleKey,
                ),
            );

            if (winningTeam === "town") {
              isWinner =
                role.team === "town" &&
                (["sniper", "witch"].includes(player.roleKey) ||
                  votedCorrectly);
            } else if (winningTeam === "mafia") {
              isWinner =
                ["mafia", "godfather", "framer"].includes(player.roleKey);
            } else if (winningTeam === "slasher") {
              isWinner = player.roleKey === "slasher";
            } else if (winningTeam === "jester") {
              isWinner = player.roleKey === "jester";
            } else if (winningTeam === "lovers") {
              isWinner = this.lovers.includes(player.id);
            }

            let points = isWinner ? 10 : 0;
            if (winningTeam === "mafia" && role.team === "mafia" && player.isAlive)
              points = 20;
            if (winningTeam === "town" && role.team === "town" && player.isAlive)
              points = 10;
            if (winningTeam === "jester" && player.roleKey === "jester")
              points = 50;
            if (winningTeam === "slasher" && player.roleKey === "slasher")
              points = 70;

            this.killHistory
              .filter((kill) => kill.actorId === player.id)
              .forEach((kill) => {
                const target = this.assignedPlayers.find(
                  (targetPlayer) => targetPlayer.id === kill.targetId,
                );
                if (!target) return;
                if (
                  role.team === "town" &&
                  ["mafia", "godfather", "framer"].includes(target.roleKey)
                ) {
                  points += target.roleKey === "godfather" ? 15 : 5;
                }
                if (role.team === "mafia") {
                  const mafiaKillPoints = {
                    sniper: 10,
                    witch: 10,
                    investigator: 10,
                    doctor: 10,
                    slasher: 10,
                    spy: 15,
                    citizen: 5,
                    bodyguard: 5,
                    cupid: 5,
                  };
                  points += mafiaKillPoints[target.roleKey] || 0;
                }
              });

            this.scoreEvents
              .filter((event) => event.playerId === player.id)
              .forEach((event) => {
                const eventPoints = {
                  bodyguardSacrifice: 15,
                  doctorHeal: 25,
                  investigatorReveal: 15,
                  friendlyFire: -10,
                  hunterDyingShot: 10,
                  colonelLead: 15,
                  bomberDetonation: 10,
                };
                points += eventPoints[event.type] || 0;
              });

            if (player.roleKey === "cupid" && this.lovers.length === 2) {
              const loversAlive = this.lovers.every(
                (loverId) =>
                  this.assignedPlayers.find((target) => target.id === loverId)
                    ?.isAlive,
              );
              const loversDead = this.lovers.every(
                (loverId) =>
                  !this.assignedPlayers.find((target) => target.id === loverId)
                    ?.isAlive,
              );
              if (loversAlive) points += 10;
              if (loversDead) points -= 5;
            }

            this.voteHistory
              .filter(
                (vote) => vote.voterId === player.id && vote.targetId !== null,
              )
              .forEach((vote) => {
                const target = this.assignedPlayers.find(
                  (targetPlayer) => targetPlayer.id === vote.targetId,
                );
                if (!target) return;
                if (target.roleKey === "jester") points -= 5;
                if (target.roleKey === "idiot") points -= 5;
                if (target.roleKey === "kamikaze") points -= 5;
                if (
                  target.roleKey === "slasher" &&
                  this.votedOutByDay.includes(target.id) &&
                  role.team === "town"
                )
                  points += 10;
                const targetRole = ROLES_DATA[target.roleKey];
                if (
                  targetRole?.team === "town" &&
                  this.votedOutByDay.includes(target.id)
                )
                  points -= 5;
              });

            if (isWinner) {
              stats.wins += 1;
              if (!stats.winningRoles.includes(player.roleKey)) {
                stats.winningRoles.push(player.roleKey);
              }
            }
            stats.investigatorReveals += this.scoreEvents.filter((event) => event.playerId === player.id && event.type === "investigatorReveal" && ["mafia", "godfather", "framer", "slasher"].includes(this.assignedPlayers.find((candidate) => candidate.id === event.targetId)?.roleKey || this.assignedPlayers.find((candidate) => candidate.id === event.targetId)?.publicRoleKey || "citizen")).length;
            stats.doctorHeals += this.scoreEvents.filter((event) => event.playerId === player.id && event.type === "doctorHeal").length;
            stats.correctVotes += this.voteHistory.filter((vote) => vote.voterId === player.id && vote.targetId !== null && ["mafia", "godfather", "framer", "slasher"].includes(this.assignedPlayers.find((target) => target.id === vote.targetId)?.roleKey || this.assignedPlayers.find((target) => target.id === vote.targetId)?.publicRoleKey || "citizen")).length;
            stats.mafiaJesterWins += ((winningTeam === "mafia" && ["mafia", "godfather", "framer"].includes(player.roleKey)) || (winningTeam === "jester" && player.roleKey === "jester")) ? 1 : 0;
            stats.quietWins += isWinner && !this.voteHistory.some((vote) => vote.targetId === player.id) ? 1 : 0;
            stats.points += points;
            const awardedBadges = this.badges.filter((badge) => badge.playerId === player.id);
            awardedBadges.forEach((badge) => {
              if (!stats.badges.includes(badge.title)) stats.badges.push(badge.title);
            });
            stats.points += awardedBadges.length * 50;
            stats.killsCount += sessionKills;
            if (!isWinner) stats.losses += 1;
          });

          this.resultsRecorded = true;
          this.saveSavedData();
        },

        /* =================== الموسوعة والمودالات =================== */
}));

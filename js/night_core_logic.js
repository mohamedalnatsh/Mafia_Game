window.addEventListener("gameappready", () => Object.assign(GameApp, {
        resolveNightAndStartMorning() {
          const deadIds = new Set();
          this.morningReports = [];

          const {
            mafiaTarget,
            doctorTarget,
            slasherTarget,
            bodyguardTarget,
            sniperTarget,
            witchHeal,
            witchHealTarget,
            witchKillTarget,
          } = this.nightActions;
          if (this.currentEvents.sandstorm)
            this.morningReports.push("🌪️ عاصفة الرمل: تعطل علاج الطبيب هذه الليلة.");
          if (this.currentEvents.festival)
            this.morningReports.push("👑 عيد الفرسان: أُحبطت هجمات المافيا والسفاح هذه الليلة.");
          const attackTargets = [
            mafiaTarget && !this.currentEvents.mafiaKillsDisabled ? mafiaTarget : null,
            slasherTarget && !this.currentEvents.serialKillerKillsDisabled ? slasherTarget : null,
            sniperTarget,
            witchKillTarget,
          ].filter(Boolean);
          this.lastNightAttacks = attackTargets;

          // 1. هجوم المافيا
          if (mafiaTarget && !this.currentEvents.mafiaKillsDisabled) {
            let saved = false;
            if (bodyguardTarget === mafiaTarget) {
              // الحارس الشخصي يموت بدلاً منه
              const bg = this.assignedPlayers.find(
                (p) => p.roleKey === "bodyguard" && p.isAlive,
              );
              if (bg) {
                deadIds.add(bg.id);
                this.recordScoreEvent("bodyguardSacrifice", bg.id, mafiaTarget);
                this.morningReports.push(
                  this.t("bodyguardDeath", { name: bg.name }),
                );
                if (this.rules.fierceBodyguard && this.nightActions.mafiaActorId) {
                  deadIds.add(this.nightActions.mafiaActorId);
                  this.recordKill(bg.id, this.nightActions.mafiaActorId, "bodyguard");
                }
                saved = true;
              }
            } else if (!this.currentEvents.doctorDisabled && (doctorTarget === mafiaTarget || witchHealTarget === mafiaTarget)) {
              saved = true;
            }

            if (!saved) {
              deadIds.add(mafiaTarget);
              if (this.nightActions.mafiaActorId)
                this.recordKill(
                  this.nightActions.mafiaActorId,
                  mafiaTarget,
                  "mafia",
                );
              const victim = this.assignedPlayers.find(
                (p) => p.id === mafiaTarget,
              );
              this.morningReports.push(
                this.t("mafiaDeath", { name: victim.name }),
              );
            } else if (doctorTarget === mafiaTarget || witchHealTarget === mafiaTarget) {
              if (!this.currentEvents.doctorDisabled && doctorTarget === mafiaTarget) {
                const doctor = this.assignedPlayers.find(
                  (p) => p.roleKey === "doctor" && p.isAlive,
                );
                if (doctor)
                  this.recordScoreEvent("doctorHeal", doctor.id, mafiaTarget);
              }
              this.morningReports.push(this.t("savedByProtection"));
            }
          }

          // 2. هجوم السفاح
          if (slasherTarget && !this.currentEvents.serialKillerKillsDisabled && (bodyguardTarget === slasherTarget || this.currentEvents.doctorDisabled || slasherTarget !== doctorTarget)) {
            deadIds.add(slasherTarget);
            const victim = this.assignedPlayers.find(
              (p) => p.id === slasherTarget,
            );
            this.morningReports.push(
              this.t("slasherDeath", { name: victim.name }),
            );
            if (this.rules.fierceBodyguard && bodyguardTarget === slasherTarget) {
              const bg = this.assignedPlayers.find((p) => p.roleKey === "bodyguard" && p.isAlive);
              const slasher = this.assignedPlayers.find((p) => p.roleKey === "slasher" && p.isAlive);
              if (bg && slasher) {
                deadIds.delete(slasherTarget);
                deadIds.add(bg.id);
                deadIds.add(slasher.id);
                this.recordKill(bg.id, slasher.id, "bodyguard");
              }
            }
          }

          // 3. هجوم القناص
          if (
            sniperTarget &&
            (bodyguardTarget === sniperTarget || this.currentEvents.doctorDisabled || sniperTarget !== doctorTarget) &&
            !deadIds.has(sniperTarget)
          ) {
            deadIds.add(sniperTarget);
            const victim = this.assignedPlayers.find(
              (p) => p.id === sniperTarget,
            );
            const sniper = this.assignedPlayers.find(
              (p) => p.roleKey === "sniper" && p.isAlive,
            );
            if (sniper) {
              this.recordSpecialMafiaKill(sniper.id, sniperTarget, "sniper");
              if (ROLES_DATA[victim.roleKey].team === "town")
                this.recordScoreEvent("friendlyFire", sniper.id, sniperTarget);
            }
            this.morningReports.push(
              this.t("sniperDeath", { name: victim.name }),
            );
          }

          // 4. سم الساحرة
          if (witchKillTarget && !deadIds.has(witchKillTarget)) {
            deadIds.add(witchKillTarget);
            const victim = this.assignedPlayers.find(
              (p) => p.id === witchKillTarget,
            );
            const witch = this.assignedPlayers.find(
              (p) => p.roleKey === "witch" && p.isAlive,
            );
            if (witch) {
              this.recordSpecialMafiaKill(witch.id, witchKillTarget, "witch");
              if (ROLES_DATA[victim.roleKey].team === "town")
                this.recordScoreEvent(
                  "friendlyFire",
                  witch.id,
                  witchKillTarget,
                );
            }
            this.morningReports.push(
              this.t("witchDeath", { name: victim.name }),
            );
          }

          if (bodyguardTarget && attackTargets.includes(bodyguardTarget)) {
            const bg = this.assignedPlayers.find((p) => p.id === bodyguardTarget && p.isAlive);
            const attackerId = mafiaTarget === bodyguardTarget
              ? this.nightActions.mafiaActorId
              : slasherTarget === bodyguardTarget
                ? this.assignedPlayers.find((p) => p.roleKey === "slasher" && p.isAlive)?.id
                : sniperTarget === bodyguardTarget
                  ? this.assignedPlayers.find((p) => p.roleKey === "sniper" && p.isAlive)?.id
                  : witchKillTarget === bodyguardTarget
                    ? this.assignedPlayers.find((p) => p.roleKey === "witch" && p.isAlive)?.id
                    : null;
            if (bg) {
              deadIds.delete(bodyguardTarget);
              deadIds.add(bg.id);
              this.morningReports.push(this.t("bodyguardDeath", { name: bg.name }));
              if (this.rules.fierceBodyguard && attackerId) {
                deadIds.add(attackerId);
                this.recordKill(bg.id, attackerId, "bodyguard");
              }
            }
          }

          if (!this.currentEvents.doctorDisabled && doctorTarget && attackTargets.includes(doctorTarget)) {
            const doctor = this.assignedPlayers.find(
              (p) => p.roleKey === "doctor" && p.isAlive,
            );
            if (
              doctor &&
              !this.scoreEvents.some(
                (event) =>
                  event.type === "doctorHeal" &&
                  event.playerId === doctor.id &&
                  event.targetId === doctorTarget &&
                  event.day === this.dayCount,
              )
            ) {
              this.recordScoreEvent("doctorHeal", doctor.id, doctorTarget);
            }
          }

          // إذا لم يمت أحد
          if (deadIds.size === 0) {
            this.morningReports.push(this.t("quietNight"));
          }

          // تطبيق الوفيات
          deadIds.forEach((id) => {
            const p = this.assignedPlayers.find((x) => x.id === id);
            if (p) {
              this.markDeath(p);
              p.isAlive = false;
            }
          });

          const firstNightDeath = [...deadIds]
            .map((id) => this.assignedPlayers.find((player) => player.id === id))
            .find(Boolean);
          this.claimCopycatRole(firstNightDeath);

          const executioner = this.assignedPlayers.find((p) => p.roleKey === "executioner");
          if (executioner && this.executionerTarget && deadIds.has(this.executionerTarget)) {
            executioner.roleKey = "jester";
            this.executionerTarget = null;
            this.morningReports.push("🎭 مات هدف الجلاد ليلاً، فتحول الجلاد إلى مهرج.");
          }

          // التحقق من موت المربوطين بالتزامن
          if (this.lovers.length === 2) {
            const lover1 = this.assignedPlayers.find(
              (p) => p.id === this.lovers[0],
            );
            const lover2 = this.assignedPlayers.find(
              (p) => p.id === this.lovers[1],
            );
            if (lover1 && lover2) {
              if (!lover1.isAlive && lover2.isAlive) {
                lover2.isAlive = false;
                this.morningReports.push(
                  this.t("loverMorning", {
                    survivor: lover2.name,
                    dead: lover1.name,
                  }),
                );
              } else if (!lover2.isAlive && lover1.isAlive) {
                lover1.isAlive = false;
                this.morningReports.push(
                  this.t("loverMorning", {
                    survivor: lover1.name,
                    dead: lover2.name,
                  }),
                );
              }
            }
          }

          this.renderMorningScreen();
        },

        /* =================== مرحلة النقاش والعداد =================== */
        /* =================== مرحلة التصويت والإقصاء =================== */
}));

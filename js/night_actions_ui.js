window.addEventListener("gameappready", () => Object.assign(GameApp, {
        showPlayerNightAction() {
          const player = this.nightQueue?.[this.nightQueueIndex];
          if (!player || !player.roleKey) {
            this.nightActionVisible = false;
            return;
          }
          const role = ROLES_DATA[player.roleKey];

          document.getElementById("night-handover-box").style.display = "none";
          document.getElementById("night-action-box").style.display = "block";
          this.nightActionVisible = true;

          document.getElementById("night-action-role-title").innerText =
            `${role.icon} ${this.localizedRole(player.roleKey).name}`;
          document.getElementById("night-action-player-sub").innerText = this.t(
            "playerRole",
            { name: player.name },
          );
          document.getElementById("night-action-badge").className =
            `role-type-badge team-${role.team}`;
          document.getElementById("night-action-badge").innerText =
            this.localizedTeam(role.team);

          const instruction = document.getElementById(
            "night-action-instruction",
          );
          const roleReveal = document.getElementById("night-role-reveal");
          const listContainer = document.getElementById("night-targets-list");
          const extraContainer = document.getElementById("night-extra-options");
          instruction.style.display = "block";
          roleReveal.style.display = "none";
          roleReveal.innerHTML = "";
          listContainer.innerHTML = "";
          extraContainer.style.display = "none";
          extraContainer.innerHTML = "";

          const alivePlayers = this.assignedPlayers.filter((p) => p.isAlive);

          if (player.id === this.curfewPlayerId) {
            instruction.innerText = "⛓️ حظر التجول: لا يمكنك استخدام قدرتك هذه الليلة.";
            this.startTurnTimer("night-action");
            this.saveSessionState();
            return;
          }

          // بناء الشاشات حسب الدور
          if (player.roleKey === "mafia" || player.roleKey === "godfather") {
            instruction.innerText = this.t("mafiaPrompt");
            extraContainer.style.display = "block";
            extraContainer.innerHTML = `<label style="display:block;color:var(--gold);font-size:0.85rem">صندوق الرسائل السرية</label><textarea id="mafia-note-input" style="width:100%;min-height:70px;margin-top:0.4rem;padding:0.5rem;background:#0c0c12;border:1px solid #3d3d52;border-radius:8px;color:#fff;font:0.85rem var(--font-body)" placeholder="اتفقوا على الهدف..."></textarea>`;
            document.getElementById("mafia-note-input").value = this.mafiaNote;
            document.getElementById("mafia-note-input").addEventListener("input", (event) => {
              this.mafiaNote = event.target.value;
              this.saveSessionState();
            });
            const mafiaPartners = alivePlayers.filter(
              (target) =>
                target.id !== player.id &&
                (target.roleKey === "mafia" || target.roleKey === "godfather"),
            );
            if (mafiaPartners.length) {
              instruction.innerHTML += `<br><strong style="color:var(--gold);">${this.t("partner")} ${mafiaPartners.map((partner) => this.escapeHtml(partner.name)).join(this.language === "ar" ? "، " : ", ")}</strong>`;
            }
            alivePlayers
              .filter(
                (target) =>
                  target.id !== player.id &&
                  !["mafia", "godfather", "framer"].includes(target.roleKey),
              )
              .forEach((target) => {
                const btn = document.createElement("button");
                btn.className = `player-btn ${this.nightActions.mafiaTarget === target.id ? "selected" : ""}`;
                btn.innerHTML = `<span>${this.t("targetPrefix")}${this.escapeHtml(target.name)}</span>`;
                btn.onclick = () => {
                  const wasSelected =
                    this.nightActions.mafiaTarget === target.id;
                  this.nightActions.mafiaActorId = wasSelected
                    ? null
                    : player.id;
                  this.nightActions.mafiaTarget = wasSelected
                    ? null
                    : target.id;
                  this.refreshSelection(
                    listContainer,
                    wasSelected ? null : btn,
                  );
                };
                listContainer.appendChild(btn);
              });
          } else if (player.roleKey === "doctor") {
            instruction.innerText = this.t("doctorPrompt");
            if (this.doctorSelfHealUsed) {
              instruction.innerHTML += `<br><em style="color:var(--gold);">${this.t("doctorSelfHealNote")}</em>`;
            }
            alivePlayers.forEach((target) => {
              const btn = document.createElement("button");
              btn.className = `player-btn ${this.nightActions.doctorTarget === target.id ? "selected" : ""}`;
              const isSelfHealDisabled = target.id === player.id && this.doctorSelfHealUsed;
              btn.disabled = isSelfHealDisabled;
              btn.innerHTML = `<span>${this.t("protectPrefix")}${this.escapeHtml(target.name)}${isSelfHealDisabled ? ` (${this.t("doctorSelfHealUsed")})` : ""}</span>`;
              if (isSelfHealDisabled) btn.style.opacity = "0.5";
              btn.onclick = () => {
                if (isSelfHealDisabled) return;
                const wasSelected =
                  this.nightActions.doctorTarget === target.id;
                this.nightActions.doctorTarget = wasSelected ? null : target.id;
                this.refreshSelection(listContainer, wasSelected ? null : btn);
              };
              listContainer.appendChild(btn);
            });
          } else if (player.roleKey === "investigator") {
            instruction.innerText = this.t("investigatorPrompt");
            alivePlayers
              .filter((p) => p.id !== player.id)
              .forEach((target) => {
                const btn = document.createElement("button");
                btn.className = `player-btn ${this.nightActions.investigatorTarget === target.id ? "selected" : ""}`;
                btn.innerHTML = `<span>${this.t("investigatePrefix")}${this.escapeHtml(target.name)}</span>`;
                btn.onclick = () => {
                  const wasSelected =
                    this.nightActions.investigatorTarget === target.id;
                  this.nightActions.investigatorTarget = wasSelected
                    ? null
                    : target.id;
                  this.nightActions.investigatorResult = wasSelected
                    ? this.getInvestigationResult(target).text
                    : null;
                  this.refreshSelection(
                    listContainer,
                    wasSelected ? null : btn,
                  );
                };
                listContainer.appendChild(btn);
              });
          } else if (player.roleKey === "framer") {
            instruction.innerText = "اختر فارساً بريئاً لتحريف نتيجة التحقيق الليلة:";
            alivePlayers
              .filter((target) => target.id !== player.id && ROLES_DATA[target.roleKey].team === "town")
              .forEach((target) => {
                const btn = document.createElement("button");
                btn.className = `player-btn ${this.nightActions.framedPlayer === target.id ? "selected" : ""}`;
                btn.innerHTML = `<span>🧙 ${this.escapeHtml(target.name)}</span>`;
                btn.onclick = () => {
                  const wasSelected = this.nightActions.framedPlayer === target.id;
                  this.nightActions.framedPlayer = wasSelected ? null : target.id;
                  this.refreshSelection(listContainer, wasSelected ? null : btn);
                };
                listContainer.appendChild(btn);
              });
          } else if (player.roleKey === "copycat" || player.originalRoleKey === "copycat" || player.isCopycatTransformed || player.roleKey === "mayor" || player.roleKey === "executioner") {
            if (player.roleKey === "executioner") {
              const target = this.assignedPlayers.find(
                (candidate) => candidate.id === this.executionerTarget,
              );
              instruction.style.display = "none";
              roleReveal.style.display = "block";
              roleReveal.innerHTML = target
                ? `<div class="target-reveal-box">🎯 <strong>هدف الثأر المكتوب:</strong> <span class="highlight-target">${this.escapeHtml(target.name)}</span></div><p class="role-hint">مهمتك: راقب تحركاته وأقنع الفرسان بتصويت إعدامه خلال النهار ليفوز دورك!</p>`
                : `<p class="role-hint">لا يوجد هدف ثأر محدد.</p>`;
            } else if (player.originalRoleKey === "copycat" || player.isCopycatTransformed || player.roleKey === "copycat") {
              const inheritedRoleKey = player.inheritedRoleKey || (player.roleKey === "copycat" ? null : player.roleKey);
              const inheritedRole = inheritedRoleKey ? this.localizedRole(inheritedRoleKey) : null;
              instruction.innerHTML = inheritedRole
                ? `🪞 <strong>رسالة سرية للنسّاخ فقط</strong><br>أنت ورثت دور <strong style="color: var(--gold);">${this.escapeHtml(inheritedRole.name)}</strong>.<br>استخدم قدراته الليلة فقط في ما يخصك، ولا يكشف هذا لأي لاعب آخر.`
                : "🪞 لا تملك قدرة بعد. ستنسخ دور أول لاعب يموت.";
              roleReveal.style.display = "block";
              roleReveal.innerHTML = inheritedRole
                ? `<div class="target-reveal-box">🔐 ${this.escapeHtml(inheritedRole.name)} - صلاحيات سرية</div><p class="role-hint">هذه الرسالة خاصة بك فقط ولا تُعلن للجميع.</p>`
                : "";
            } else {
              instruction.innerText = player.roleKey === "mayor"
                ? "لا توجد مهمة ليلية. ستظهر قدرتك في التصويت النهاري."
                : "🪞 لا تملك قدرة بعد. ستنسخ دور أول لاعب يموت.";
            }
          } else if (player.roleKey === "slasher") {
            instruction.innerText = this.t("slasherPrompt");
            alivePlayers
              .filter((p) => p.id !== player.id)
              .forEach((target) => {
                const btn = document.createElement("button");
                btn.className = `player-btn ${this.nightActions.slasherTarget === target.id ? "selected" : ""}`;
                btn.innerHTML = `<span>🪓 ${target.name}</span>`;
                btn.onclick = () => {
                  const wasSelected =
                    this.nightActions.slasherTarget === target.id;
                  this.nightActions.slasherTarget = wasSelected
                    ? null
                    : target.id;
                  this.refreshSelection(
                    listContainer,
                    wasSelected ? null : btn,
                  );
                };
                listContainer.appendChild(btn);
              });
          } else if (player.roleKey === "bodyguard") {
            instruction.innerText = this.t("bodyguardPrompt");
            alivePlayers
              .filter((p) => p.id !== player.id)
              .forEach((target) => {
                const btn = document.createElement("button");
                btn.className = `player-btn ${this.nightActions.bodyguardTarget === target.id ? "selected" : ""}`;
                btn.innerHTML = `<span>🤺 ${target.name}</span>`;
                btn.onclick = () => {
                  const wasSelected =
                    this.nightActions.bodyguardTarget === target.id;
                  this.nightActions.bodyguardTarget = wasSelected
                    ? null
                    : target.id;
                  this.refreshSelection(
                    listContainer,
                    wasSelected ? null : btn,
                  );
                };
                listContainer.appendChild(btn);
              });
          } else if (player.roleKey === "spy") {
            const mafiaVictim = this.assignedPlayers.find(
              (p) => p.id === this.nightActions.mafiaTarget,
            );
            instruction.innerHTML = `${this.t("spyReveal")}<br><strong style="color:var(--gold);">${mafiaVictim ? this.t("mafiaMove", { name: this.escapeHtml(mafiaVictim.name) }) : this.t("noMafiaMove")}</strong>`;
          } else if (player.roleKey === "cupid") {
            if (this.dayCount === 1) {
              instruction.innerText = this.t("cupidPrompt");
              extraContainer.style.display = "block";
              extraContainer.innerHTML = `<div style="color:var(--gold); font-size:0.85rem; margin-bottom:0.5rem;">${this.t("chooseTwo")}</div>`;
              this.nightActions.cupidLovers = [];
              alivePlayers.forEach((target) => {
                const btn = document.createElement("button");
                btn.className = "player-btn";
                btn.innerHTML = `<span>💘 ${target.name}</span>`;
                btn.onclick = () => {
                  if (this.nightActions.cupidLovers.includes(target.id)) {
                    this.nightActions.cupidLovers =
                      this.nightActions.cupidLovers.filter(
                        (id) => id !== target.id,
                      );
                    btn.classList.remove("selected");
                  } else if (this.nightActions.cupidLovers.length < 2) {
                    this.nightActions.cupidLovers.push(target.id);
                    btn.classList.add("selected");
                  }
                };
                listContainer.appendChild(btn);
              });
            } else {
              instruction.innerText = this.t("cupidDone");
            }
          } else if (player.roleKey === "witch") {
            instruction.innerText = this.t("witchPrompt");
            extraContainer.style.display = "block";
            extraContainer.innerHTML = `
            <div style="background:#0c0c14; padding:0.75rem; border-radius:8px; margin-bottom:0.75rem;">
              <div style="font-size:0.9rem; color:var(--gold); margin-bottom:0.5rem;">${this.t("witchHealSection", { status: this.witchHealUsed ? this.t("witchUsed") : this.t("witchAvailable") })}</div>
              <div class="player-selection-list" id="witch-heal-targets"></div>
            </div>
          `;
            const healTargets = document.getElementById("witch-heal-targets");
            alivePlayers.forEach((target) => {
              const btn = document.createElement("button");
              const selected = this.nightActions.witchHealTarget === target.id;
              btn.className = `player-btn ${selected ? "selected" : ""}`;
              btn.disabled = this.witchHealUsed;
              btn.style.opacity = this.witchHealUsed ? "0.5" : "1";
              btn.innerHTML = `<span>${this.t("protectPrefix")}${this.escapeHtml(target.name)}</span>`;
              btn.onclick = () => {
                if (this.witchHealUsed) return;
                const wasSelected = this.nightActions.witchHealTarget === target.id;
                this.nightActions.witchHealTarget = wasSelected ? null : target.id;
                this.refreshSelection(healTargets, wasSelected ? null : btn);
              };
              healTargets.appendChild(btn);
            });

            listContainer.innerHTML = `<div style="font-size:0.9rem; color:var(--gold); margin-bottom:0.5rem;">${this.t("witchPoisonSection", { status: this.witchPoisonUsed ? this.t("witchUsed") : this.t("witchAvailable") })}</div>`;
            alivePlayers
              .filter((p) => p.id !== player.id)
              .forEach((target) => {
                const btn = document.createElement("button");
                const selected = this.nightActions.witchKillTarget === target.id;
                btn.className = `player-btn ${selected ? "selected" : ""}`;
                btn.disabled = this.witchPoisonUsed;
                btn.style.opacity = this.witchPoisonUsed ? "0.5" : "1";
                btn.innerHTML = `<span>${this.t("poisonPrefix")}${this.escapeHtml(target.name)}</span>`;
                btn.onclick = () => {
                  if (this.witchPoisonUsed) return;
                  const wasSelected = this.nightActions.witchKillTarget === target.id;
                  this.nightActions.witchKillTarget = wasSelected ? null : target.id;
                  this.refreshSelection(listContainer, wasSelected ? null : btn);
                };
                listContainer.appendChild(btn);
              });
          } else if (player.roleKey === "sniper") {
            if (this.sniperBulletAvailable) {
              instruction.innerText = this.t("sniperPrompt");
              alivePlayers
                .filter((p) => p.id !== player.id)
                .forEach((target) => {
                  const btn = document.createElement("button");
                  btn.className = `player-btn ${this.nightActions.sniperTarget === target.id ? "selected" : ""}`;
                  btn.innerHTML = `<span>${this.t("sniperPrefix")}${this.escapeHtml(target.name)}</span>`;
                  btn.onclick = () => {
                    const wasSelected =
                      this.nightActions.sniperTarget === target.id;
                    this.nightActions.sniperTarget = wasSelected
                      ? null
                      : target.id;
                    this.refreshSelection(
                      listContainer,
                      wasSelected ? null : btn,
                    );
                  };
                  listContainer.appendChild(btn);
                });
            } else {
              instruction.innerText = this.t("sniperSpent");
            }
          } else {
            // شاشة التمويه الذكية لجميع المواطنين والأدوار السلبية (Decoy Screen)
            instruction.innerText = this.t("citizenPrompt");
            alivePlayers.forEach((target) => {
              const btn = document.createElement("button");
              btn.className = "player-btn";
              btn.innerHTML = `<span>${this.t("camouflagePrefix")}${this.escapeHtml(target.name)}</span>`;
              btn.onclick = () => {
                this.refreshSelection(listContainer, btn);
              };
              listContainer.appendChild(btn);
            });
          }
          this.startTurnTimer("night-action");
          this.saveSessionState();
        },
}));
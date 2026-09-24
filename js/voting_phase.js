window.addEventListener("gameappready", () => Object.assign(GameApp, {
  startVotingPhase(candidates = null, isRevote = false) {
    if (this.currentEvents.eclipse) { this.showSkipVoteModal(); return; }
    this.clearIntervals();
    document.getElementById("day-discussion-box").style.display = "none";
    document.getElementById("day-voting-box").style.display = "block";
    this.votes = {};
    this.currentVoterIndex = 0;
    this.dayVotingVisible = true;
    this.revoteCandidates = candidates;
    this.isRevote = isRevote;
    this.votingHandoverVisible = true;
    this.showVotingHandover();
    this.saveSessionState();
  },

  showVotingHandover() {
    const eligibleVoters = this.assignedPlayers.filter((player) => player.isAlive && !player.cannotVote && player.id !== this.curfewPlayerId);
    if (this.currentVoterIndex >= eligibleVoters.length) { this.votingHandoverVisible = false; this.tallyVotesAndExecute(); return; }
    const nextVoter = eligibleVoters[this.currentVoterIndex];
    document.getElementById("voting-turn-box").style.display = "none";
    document.getElementById("voting-handover-box").style.display = "block";
    document.getElementById("voting-pass-prompt").innerText = this.t("passVotingPhone", { name: nextVoter.name });
    document.getElementById("btn-confirm-voting-handover").innerText = this.t("readyToVote", { name: nextVoter.name });
    this.startTurnTimer("voting-handover");
    this.saveSessionState();
  },

  confirmVotingHandover() {
    this.clearTurnTimer();
    this.votingHandoverVisible = false;
    document.getElementById("voting-handover-box").style.display = "none";
    document.getElementById("voting-turn-box").style.display = "block";
    this.renderVotingTurn();
    this.saveSessionState();
  },

  renderVotingTurn() {
    const eligibleVoters = this.assignedPlayers.filter((player) => player.isAlive && !player.cannotVote && player.id !== this.curfewPlayerId);
    if (this.currentVoterIndex >= eligibleVoters.length) { this.tallyVotesAndExecute(); return; }
    const voter = eligibleVoters[this.currentVoterIndex];
    const confirmVoteButton = document.getElementById("btn-submit-vote");
    confirmVoteButton.disabled = true;
    document.getElementById("voting-turn-indicator").innerText = `${this.t("knightVote")}: ${this.currentVoterIndex + 1}/${eligibleVoters.length}`;
    const voterLabel = `${this.escapeHtml(voter.name)}${voter.roleKey === "colonel" ? " (2x 🎖️)" : ""}`;
    document.getElementById("voting-voter-prompt").innerHTML = this.t("votePrompt", { name: `<strong style="color:var(--gold);">${voterLabel}</strong>` });
    const candidatesList = document.getElementById("voting-candidates-list");
    candidatesList.innerHTML = "";
    if (voter.roleKey === "mayor" && !this.mayorRevealed[voter.id]) {
      const mayorButton = document.createElement("button");
      mayorButton.className = "btn btn-outline";
      mayorButton.style.marginBottom = "0.75rem";
      mayorButton.innerText = "كشف الهوية كعمدة";
      mayorButton.onclick = () => { this.mayorRevealed[voter.id] = true; this.renderVotingTurn(); this.saveSessionState(); };
      candidatesList.appendChild(mayorButton);
    }
    const aliveCandidates = this.assignedPlayers.filter((player) => player.isAlive && player.id !== voter.id && (!this.revoteCandidates || this.revoteCandidates.includes(player.id)));
    aliveCandidates.forEach((candidate) => {
      const button = document.createElement("button");
      button.className = "player-btn";
      button.innerHTML = `<span>${this.t("accuseExecute")} ${this.escapeHtml(candidate.name)}</span>`;
      button.onclick = () => { const wasSelected = this.votes[voter.id] === candidate.id; this.votes[voter.id] = wasSelected ? null : candidate.id; confirmVoteButton.disabled = !this.votes[voter.id]; this.refreshSelection(candidatesList, wasSelected ? null : button); };
      candidatesList.appendChild(button);
    });
    this.startTurnTimer("voting-action");
    SoundEngine.playTone(380, "triangle", 0.1);
  },

  submitVote() {
    const eligibleVoters = this.assignedPlayers.filter((player) => player.isAlive && !player.cannotVote && player.id !== this.curfewPlayerId);
    const voter = eligibleVoters[this.currentVoterIndex];
    const selectedTargetId = voter ? this.votes[voter.id] : null;
    if (!selectedTargetId) { this.toast(this.t("abstainPrompt")); return; }
    this.voteHistory.push({ voterId: voter.id, targetId: selectedTargetId, day: this.dayCount, isRevote: this.isRevote });
    this.currentVoterIndex++;
    this.showVotingHandover();
    this.saveSessionState();
  },

  skipVote() {
    const eligibleVoters = this.assignedPlayers.filter((player) => player.isAlive && !player.cannotVote && player.id !== this.curfewPlayerId);
    const voter = eligibleVoters[this.currentVoterIndex];
    if (!voter) return;
    this.votes[voter.id] = null;
    this.voteHistory.push({ voterId: voter.id, targetId: null, day: this.dayCount, isRevote: this.isRevote });
    this.currentVoterIndex++;
    this.showVotingHandover();
    this.saveSessionState();
  },
}));
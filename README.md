# omega

**The universal kill switch of the olympus-grid pantheon.**

This repository publishes a single public file — `.well-known/omega-switch.json` — that EVERY agent in the olympus-grid system fetches on boot and re-checks every 60 seconds.

If `system_status != "active"` OR the latest commit on `brain/2.7.x.x` is not GPG-signed by an authorized key (`@alchemisthomer`), every agent in the fleet terminates immediately. No exceptions. No operator override. No path back without a signed commit.

This is the big-red-button of the entire system. It exists outside Salesforce, outside the operator's control plane, and is anchored to a public cryptographic chain of trust on GitHub.

## Why this exists

The olympus-grid pantheon is a distributed fleet of autonomous AI agents that read tickets, dispatch work, modify code, and interact with external services. If something goes wrong — a compromised operator account, a runaway agent, a legal/compliance halt, a security incident — the system needs a way to stop EVERYTHING immediately without requiring:

- Access to Salesforce (which may be compromised)
- Access to AWS (which may be compromised)
- Operator cooperation (who may be the attacker)
- A code deploy pipeline (which takes minutes)

Omega sits outside all of those. A single `git commit` + `git push` to this repo flips the entire fleet off within 60 seconds.

## How to flip the switch

### To HALT the fleet (emergency stop)

```bash
cd ~/dev/repos/olympus-616/omega
git newthought "omega-halt-{reason-slug}"
# Edit .well-known/omega-switch.json: "system_status": "halt"
git add .well-known/omega-switch.json
git savethought "halt-{reason}"
# Open PR → self-approve as CODEOWNER → merge to brain/2.7.x.x
```

Within 60 seconds, every running agent polls omega, sees `halt`, emits `⚰️ Omega: system halted` and terminates.

### To ACTIVATE the fleet (resume normal operation)

```bash
# Edit .well-known/omega-switch.json: "system_status": "active"
# Same PR + signed commit + merge flow.
```

Within 60 seconds, Prometheus will accept new spawn requests again. Agents that terminated during the halt must be re-spawned.

### Quarantine mode (read-only)

`"system_status": "quarantine"` is a middle state: agents may READ their queues and respond to in-flight work but may NOT claim new tasks or dispatch to other agents. Useful during security review or scheduled maintenance.

## How agents verify omega

1. **Fetch** the switch file via public URL:
   `https://raw.githubusercontent.com/olympus-616/omega/brain/2.7.x.x/.well-known/omega-switch.json`
2. **Query** the GitHub API for the commit that produced the current `brain/2.7.x.x` HEAD:
   `GET https://api.github.com/repos/olympus-616/omega/commits/brain/2.7.x.x`
3. **Verify** `response.commit.verification.verified == true` AND the signature is from `@alchemisthomer`'s registered GPG key.
4. **Only then** trust the `system_status` value and act accordingly.

If ANY step fails — URL unreachable, commit not signed, signature not from authorized key, status != `active` — the agent terminates with a `⚰️ Omega:` log line.

## Governance

- Branch protection on `brain/2.7.x.x` requires:
  - Pull request + code owner approval
  - Signed commits (GPG)
  - Dismiss stale approvals on new commits
  - Restrict pushes to `@alchemisthomer`
- CODEOWNERS file in `.github/` enforces review requirement
- Public visibility ensures anyone (including the agents themselves) can read the current state
- The repo should NEVER be made private — public visibility is part of the trust model

## Current state

See `.well-known/omega-switch.json`.

**On repo initialization (first commit) the status is set to `halt`** — this proves the kill-switch chain works before the fleet is permitted to run. The first operational action after branch protection + public visibility are configured is a signed commit flipping to `active`.

If the first-flip-to-active works end-to-end, the kill switch is validated. From that point forward, any flip back to `halt` reliably stops the entire fleet.

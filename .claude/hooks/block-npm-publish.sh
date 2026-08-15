#!/usr/bin/env bash
# PreToolUse hook (matcher: Bash). Denies any command that invokes `npm publish`.
# Heredoc bodies are stripped before matching so prose (e.g. a commit message
# that mentions "npm publish") inside `git commit -m "$(cat <<'EOF' ... EOF)"`
# isn't mistaken for an actual invocation.
set -euo pipefail

cmd=$(jq -r '.tool_input.command')

stripped=$(printf '%s\n' "$cmd" | awk '
  BEGIN { indelim = 0 }
  {
    if (indelim) {
      line = $0
      sub(/^[[:space:]]+/, "", line)
      if (line == delim) { indelim = 0 }
      next
    }
    if (match($0, /<<-?[[:space:]]*['"'"'"]?[A-Za-z_][A-Za-z0-9_]*['"'"'"]?/)) {
      tok = substr($0, RSTART, RLENGTH)
      gsub(/<<-?[[:space:]]*/, "", tok)
      gsub(/['"'"'"]/, "", tok)
      delim = tok
      indelim = 1
    }
    print
  }
')

if printf '%s' "$stripped" | grep -qiE '(^|[;&|]|[[:space:]])npm(\.cmd)?[[:space:]]+publish([[:space:]]|$)'; then
  printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"npm publish is blocked by project policy (.claude/hooks/block-npm-publish.sh)."}}'
fi

exit 0

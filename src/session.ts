import * as fs from "fs";
import * as path from "path";

const SESSION_FILE = path.join(process.cwd(), "session.json");

interface SessionState {
  login: string;
  defaultOwner?: string;
  defaultRepo?: string;
}

let _state: SessionState | null = null;

export function loadSession(): SessionState | null {
  if (_state) return _state;
  try {
    const raw = fs.readFileSync(SESSION_FILE, "utf-8");
    _state = JSON.parse(raw);
    return _state;
  } catch {
    return null;
  }
}

export function saveSession(state: SessionState): void {
  _state = state;
  fs.writeFileSync(SESSION_FILE, JSON.stringify(state, null, 2));
}

export function getSession(): SessionState | null {
  return _state ?? loadSession();
}

export function setDefault(key: "defaultOwner" | "defaultRepo", value: string): void {
  const current = getSession() ?? { login: "" };
  saveSession({ ...current, [key]: value });
}

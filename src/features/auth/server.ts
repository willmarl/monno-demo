// Static demo build: auth is fully mocked. Bob is always logged in.

import { DEMO_USER } from "@/lib/demo/mockStore";

export async function requireAuth() {
  return DEMO_USER;
}

export async function getServerUser() {
  return DEMO_USER;
}

export async function redirectIfLoggedIn() {
  // No-op. Must NOT redirect during static export build or the auth pages
  // would fail to pre-render.
}

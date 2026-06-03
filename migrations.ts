/**
 * ELEVO DATA MIGRATIONS
 * =====================
 * Task names are used as sub-keys in several AsyncStorage records.
 * When a task is renamed in utils.ts, add the rename here and bump SCHEMA_VERSION.
 *
 * HOW TO ADD A FUTURE RENAME:
 *   1. Add the old-name → new-name pair to TASK_RENAMES below.
 *   2. Increment SCHEMA_VERSION by 1.
 *   3. If the rename needs custom merge logic, add a new migration function
 *      in MIGRATIONS and assign it to the new version number.
 *      For standard task-key renames the existing migration_1 handles it automatically.
 *
 * The migration runs once at app launch (inside _layout.tsx) before the tab
 * shell renders. It is a no-op for users already on the current schema version.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Schema version ──────────────────────────────────────────────────────────
// Bump this whenever you add a rename or a new migration step.
export const SCHEMA_VERSION = 1;

// ─── Known task renames ───────────────────────────────────────────────────────
// Key   = the old task name that may exist in stored data.
// Value = the canonical task name now used in utils.ts.
const TASK_RENAMES: Record<string, string> = {
  // v1 — capitalisation fix applied when the task list was normalised.
  'Meditating/NSDR/Breathing exercises': 'Meditating/NSDR/breathing exercises',

  // ── Add future renames below this line ────────────────────────────────────
  // 'Old task name here': 'New task name here',
  // 'Old task name here': 'New task name here',
};

// ─── Keys whose sub-keys are task names ──────────────────────────────────────
// Each entry declares the AsyncStorage key and how to merge if both old and
// new names already exist in the stored object (e.g. user logged both spellings).
const TASK_KEYED_STORES: Array<{
  key: string;
  merge: (oldVal: unknown, existingNewVal: unknown) => unknown;
}> = [
  {
    key: 'elevo_completions',
    // Numeric count — add together so no completions are lost.
    merge: (o, n) => (o as number) + (n as number),
  },
  {
    key: 'elevo_new_task_starts',
    // ISO timestamp — keep the earlier date (task was started first).
    merge: (o, n) => ((o as string) < (n as string) ? o : n),
  },
  {
    key: 'elevo_earned_xp',
    // Today's per-task XP display — add together.
    merge: (o, n) => (o as number) + (n as number),
  },
];

// ─── Migration functions ──────────────────────────────────────────────────────

async function migration_1(): Promise<void> {
  if (Object.keys(TASK_RENAMES).length === 0) return;

  for (const { key, merge } of TASK_KEYED_STORES) {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) continue;

    const obj = JSON.parse(raw) as Record<string, unknown>;
    let dirty = false;

    for (const [oldName, newName] of Object.entries(TASK_RENAMES)) {
      if (!(oldName in obj)) continue;
      const oldVal = obj[oldName];
      if (newName in obj) {
        // Both keys exist — merge values, then drop the old key.
        obj[newName] = merge(oldVal, obj[newName]);
      } else {
        obj[newName] = oldVal;
      }
      delete obj[oldName];
      dirty = true;
    }

    if (dirty) {
      await AsyncStorage.setItem(key, JSON.stringify(obj));
    }
  }
}

// ─── Migration registry ───────────────────────────────────────────────────────
// Map schema version → the function that upgrades TO that version.
const MIGRATIONS: Record<number, () => Promise<void>> = {
  1: migration_1,
  // 2: migration_2,   ← add future steps here
};

// ─── Public entry point ───────────────────────────────────────────────────────
export async function runMigrations(): Promise<void> {
  const raw = await AsyncStorage.getItem('elevo_schema_version');
  const currentVersion = raw ? parseInt(raw) || 0 : 0;

  if (currentVersion >= SCHEMA_VERSION) return;

  for (let v = currentVersion + 1; v <= SCHEMA_VERSION; v++) {
    if (MIGRATIONS[v]) {
      await MIGRATIONS[v]();
    }
  }

  await AsyncStorage.setItem('elevo_schema_version', String(SCHEMA_VERSION));
}

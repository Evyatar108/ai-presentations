/**
 * Migration script: Rename data files from string-based segment IDs to 0-based numeric segment IDs.
 *
 * Changes:
 * 1. Audio files: s{slide}_segment_{pad(idx+1)}_{segmentId}.wav -> s{slide}_segment_{pad(idx)}.wav
 * 2. .tts-narration-cache.json: same key transformation as audio files
 * 3. narration-cache.json per demo: ch{ch}:s{sl}:{segmentId} -> ch{ch}:s{sl}:{0-based-index}
 * 4. narration.json per demo: segment.id from string -> 0-based array index
 * 5. alignment.json per demo: segment.segmentId from string -> 0-based array index
 * 6. .previews/ directories: ch{ch}_s{sl}_{segmentId}/ -> ch{ch}_s{sl}_{segmentIndex}/
 *
 * Usage: npx tsx scripts/migrate-0indexed.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const AUDIO_DIR = path.join(PUBLIC, 'audio');
const NARRATION_DIR = path.join(PUBLIC, 'narration');
const TTS_CACHE_PATH = path.join(ROOT, '.tts-narration-cache.json');
const PREVIEWS_DIR = path.join(ROOT, '.previews');

// Regex to match old-format audio filenames
const OLD_AUDIO_REGEX = /^s(\d+)_segment_(\d+)_(.+)\.wav$/;

// Regex to match old-format narration cache keys (ch{ch}:s{sl}:{segmentId} where segmentId is non-numeric)
const OLD_NARR_CACHE_KEY_REGEX = /^(ch\d+:s\d+):(.+)$/;

// Regex to match old-format preview directory names
const OLD_PREVIEW_DIR_REGEX = /^(ch\d+_s\d+)_(.+)$/;

let totalChanges = 0;

function log(msg: string) {
  console.log(`  ${msg}`);
}

function logSection(msg: string) {
  console.log(`\n=== ${msg} ===`);
}

// ---------------------------------------------------------------------------
// 1. Migrate audio files on disk
// ---------------------------------------------------------------------------
function migrateAudioFiles(demoId: string): void {
  const demoAudioDir = path.join(AUDIO_DIR, demoId);
  if (!fs.existsSync(demoAudioDir)) return;

  const chapters = fs.readdirSync(demoAudioDir).filter(entry => {
    const fullPath = path.join(demoAudioDir, entry);
    return fs.statSync(fullPath).isDirectory() && /^c\d+$/.test(entry);
  });

  for (const chapter of chapters) {
    const chapterDir = path.join(demoAudioDir, chapter);
    const files = fs.readdirSync(chapterDir).filter(f => f.endsWith('.wav'));

    for (const file of files) {
      const match = file.match(OLD_AUDIO_REGEX);
      if (!match) {
        // Already migrated or non-matching file — skip
        continue;
      }

      const slideNum = match[1];
      const oldOneBased = parseInt(match[2], 10);
      const newZeroBased = oldOneBased - 1;
      const newPadded = String(newZeroBased).padStart(2, '0');
      const newName = `s${slideNum}_segment_${newPadded}.wav`;

      const oldPath = path.join(chapterDir, file);
      const newPath = path.join(chapterDir, newName);

      if (oldPath === newPath) continue;

      // Check for collision
      if (fs.existsSync(newPath)) {
        console.warn(`  WARNING: Target already exists, skipping: ${newPath}`);
        continue;
      }

      fs.renameSync(oldPath, newPath);
      log(`RENAME ${chapter}/${file} -> ${chapter}/${newName}`);
      totalChanges++;
    }
  }
}

// ---------------------------------------------------------------------------
// 2. Migrate .tts-narration-cache.json
// ---------------------------------------------------------------------------
function migrateTtsNarrationCache(): void {
  if (!fs.existsSync(TTS_CACHE_PATH)) {
    log('File not found — skipping');
    return;
  }

  const data = JSON.parse(fs.readFileSync(TTS_CACHE_PATH, 'utf8'));
  let changed = false;

  for (const key of Object.keys(data)) {
    const value = data[key];

    // Check if this is a top-level orphaned path key (not a demo ID)
    if (key.includes('/') && OLD_AUDIO_REGEX.test(path.basename(key))) {
      // Transform orphaned top-level path key
      const dir = path.dirname(key);
      const basename = path.basename(key);
      const match = basename.match(OLD_AUDIO_REGEX)!;
      const slideNum = match[1];
      const oldOneBased = parseInt(match[2], 10);
      const newZeroBased = oldOneBased - 1;
      const newPadded = String(newZeroBased).padStart(2, '0');
      const newBasename = `s${slideNum}_segment_${newPadded}.wav`;
      const newKey = `${dir}/${newBasename}`;

      if (newKey !== key) {
        delete data[key];
        data[newKey] = value;
        log(`ORPHAN KEY: ${key} -> ${newKey}`);
        changed = true;
        totalChanges++;
      }
      continue;
    }

    // Demo-level entries: value is an object with path keys
    if (typeof value === 'object' && value !== null && !('narrationText' in value) && !('hash' in value)) {
      const demoEntries = value as Record<string, unknown>;
      const keysToMigrate: Array<{ oldKey: string; newKey: string }> = [];

      for (const entryKey of Object.keys(demoEntries)) {
        const basename = path.posix.basename(entryKey);
        const match = basename.match(OLD_AUDIO_REGEX);
        if (!match) continue;

        const dir = entryKey.substring(0, entryKey.length - basename.length);
        const slideNum = match[1];
        const oldOneBased = parseInt(match[2], 10);
        const newZeroBased = oldOneBased - 1;
        const newPadded = String(newZeroBased).padStart(2, '0');
        const newBasename = `s${slideNum}_segment_${newPadded}.wav`;
        const newKey = `${dir}${newBasename}`;

        if (newKey !== entryKey) {
          keysToMigrate.push({ oldKey: entryKey, newKey });
        }
      }

      for (const { oldKey, newKey } of keysToMigrate) {
        const entryValue = demoEntries[oldKey];
        delete demoEntries[oldKey];
        // If new key already exists (e.g., stale duplicate), the latest wins
        demoEntries[newKey] = entryValue;
        log(`[${key}] ${oldKey} -> ${newKey}`);
        changed = true;
        totalChanges++;
      }
    }
  }

  if (changed) {
    fs.writeFileSync(TTS_CACHE_PATH, JSON.stringify(data, null, 2) + '\n', 'utf8');
    log(`Wrote updated ${TTS_CACHE_PATH}`);
  } else {
    log('No changes needed');
  }
}

// ---------------------------------------------------------------------------
// 3. Migrate narration-cache.json per demo
// ---------------------------------------------------------------------------
function migrateNarrationCache(demoId: string): void {
  const narrationJsonPath = path.join(NARRATION_DIR, demoId, 'narration.json');
  const cacheJsonPath = path.join(NARRATION_DIR, demoId, 'narration-cache.json');

  if (!fs.existsSync(cacheJsonPath)) {
    log('narration-cache.json not found — skipping');
    return;
  }

  // Build segmentId -> index mapping from narration.json
  const idToIndexMap = new Map<string, number>(); // key: "ch{ch}:s{sl}:{segmentId}" -> index

  if (fs.existsSync(narrationJsonPath)) {
    const narrationData = JSON.parse(fs.readFileSync(narrationJsonPath, 'utf8'));
    if (narrationData.slides && Array.isArray(narrationData.slides)) {
      for (const slide of narrationData.slides) {
        const ch = slide.chapter;
        const sl = slide.slide;
        if (slide.segments && Array.isArray(slide.segments)) {
          slide.segments.forEach((seg: { id: string | number }, idx: number) => {
            const oldKey = `ch${ch}:s${sl}:${seg.id}`;
            idToIndexMap.set(oldKey, idx);
          });
        }
      }
    }
  }

  const cacheData = JSON.parse(fs.readFileSync(cacheJsonPath, 'utf8'));
  if (!cacheData.segments || typeof cacheData.segments !== 'object') {
    log('No segments in narration-cache.json — skipping');
    return;
  }

  const segments = cacheData.segments as Record<string, unknown>;
  const keysToMigrate: Array<{ oldKey: string; newKey: string }> = [];

  for (const segKey of Object.keys(segments)) {
    const match = segKey.match(OLD_NARR_CACHE_KEY_REGEX);
    if (!match) continue;

    const prefix = match[1]; // e.g., "ch1:s1"
    const segmentId = match[2]; // e.g., "intro"

    // Skip if segmentId is already numeric (already migrated)
    if (/^\d+$/.test(segmentId)) continue;

    // Look up the index from narration.json
    const index = idToIndexMap.get(segKey);
    if (index === undefined) {
      console.warn(`  WARNING: No index mapping for "${segKey}" — skipping`);
      continue;
    }

    const newKey = `${prefix}:${index}`;
    keysToMigrate.push({ oldKey: segKey, newKey });
  }

  let changed = false;
  for (const { oldKey, newKey } of keysToMigrate) {
    const value = segments[oldKey];
    delete segments[oldKey];
    segments[newKey] = value;
    log(`${oldKey} -> ${newKey}`);
    changed = true;
    totalChanges++;
  }

  if (changed) {
    fs.writeFileSync(cacheJsonPath, JSON.stringify(cacheData, null, 2) + '\n', 'utf8');
    log(`Wrote updated ${cacheJsonPath}`);
  } else {
    log('No changes needed');
  }
}

// ---------------------------------------------------------------------------
// 4. Migrate narration.json per demo
// ---------------------------------------------------------------------------
function migrateNarrationJson(demoId: string): void {
  const narrationJsonPath = path.join(NARRATION_DIR, demoId, 'narration.json');

  if (!fs.existsSync(narrationJsonPath)) {
    log('narration.json not found — skipping');
    return;
  }

  const data = JSON.parse(fs.readFileSync(narrationJsonPath, 'utf8'));
  if (!data.slides || !Array.isArray(data.slides)) {
    log('No slides in narration.json — skipping');
    return;
  }

  let changed = false;

  for (const slide of data.slides) {
    if (!slide.segments || !Array.isArray(slide.segments)) continue;

    slide.segments.forEach((seg: { id: string | number }, idx: number) => {
      if (typeof seg.id === 'string') {
        log(`ch${slide.chapter}:s${slide.slide} segment "${seg.id}" -> ${idx}`);
        seg.id = idx;
        changed = true;
        totalChanges++;
      }
    });
  }

  if (changed) {
    fs.writeFileSync(narrationJsonPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
    log(`Wrote updated ${narrationJsonPath}`);
  } else {
    log('No changes needed');
  }
}

// ---------------------------------------------------------------------------
// 5. Migrate alignment.json per demo
// ---------------------------------------------------------------------------
function migrateAlignmentJson(demoId: string): void {
  const alignmentPath = path.join(AUDIO_DIR, demoId, 'alignment.json');

  if (!fs.existsSync(alignmentPath)) {
    log('alignment.json not found — skipping');
    return;
  }

  const data = JSON.parse(fs.readFileSync(alignmentPath, 'utf8'));
  if (!data.slides || typeof data.slides !== 'object') {
    log('No slides in alignment.json — skipping');
    return;
  }

  let changed = false;

  for (const slideKey of Object.keys(data.slides)) {
    const slideData = data.slides[slideKey];
    if (!slideData.segments || !Array.isArray(slideData.segments)) continue;

    slideData.segments.forEach((seg: { segmentId: string | number }, idx: number) => {
      if (typeof seg.segmentId === 'string') {
        log(`${slideKey} segment "${seg.segmentId}" -> ${idx}`);
        seg.segmentId = idx;
        changed = true;
        totalChanges++;
      }
    });
  }

  if (changed) {
    fs.writeFileSync(alignmentPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
    log(`Wrote updated ${alignmentPath}`);
  } else {
    log('No changes needed');
  }
}

// ---------------------------------------------------------------------------
// 6. Migrate .previews/ directories
// ---------------------------------------------------------------------------
function migratePreviewDirs(): void {
  if (!fs.existsSync(PREVIEWS_DIR)) {
    log('.previews/ directory not found — skipping');
    return;
  }

  const entries = fs.readdirSync(PREVIEWS_DIR);
  let changed = false;

  for (const entry of entries) {
    const fullPath = path.join(PREVIEWS_DIR, entry);
    if (!fs.statSync(fullPath).isDirectory()) continue;

    const match = entry.match(OLD_PREVIEW_DIR_REGEX);
    if (!match) continue;

    const prefix = match[1]; // e.g., "ch1_s1"
    const segmentId = match[2]; // e.g., "intro"

    // Skip if already numeric
    if (/^\d+$/.test(segmentId)) continue;

    // We don't know the exact index without narration.json context,
    // but preview dirs may not need full mapping — log a warning
    console.warn(`  WARNING: Preview dir "${entry}" has string segmentId "${segmentId}" — cannot determine index without narration.json context. Skipping.`);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function discoverDemoIds(): string[] {
  const demoIds = new Set<string>();

  // From audio directories
  if (fs.existsSync(AUDIO_DIR)) {
    for (const entry of fs.readdirSync(AUDIO_DIR)) {
      const fullPath = path.join(AUDIO_DIR, entry);
      if (fs.statSync(fullPath).isDirectory()) {
        demoIds.add(entry);
      }
    }
  }

  // From narration directories
  if (fs.existsSync(NARRATION_DIR)) {
    for (const entry of fs.readdirSync(NARRATION_DIR)) {
      const fullPath = path.join(NARRATION_DIR, entry);
      if (fs.statSync(fullPath).isDirectory()) {
        demoIds.add(entry);
      }
    }
  }

  return Array.from(demoIds).sort();
}

function main(): void {
  console.log('=== Migration: 0-indexed segment IDs ===');
  console.log(`Project root: ${ROOT}`);

  const demoIds = discoverDemoIds();
  console.log(`\nDiscovered demos: ${demoIds.join(', ')}`);

  // Step 1: Audio files
  for (const demoId of demoIds) {
    logSection(`[${demoId}] Audio files`);
    try {
      migrateAudioFiles(demoId);
    } catch (err) {
      console.error(`  ERROR migrating audio for ${demoId}:`, err);
    }
  }

  // Step 2: TTS narration cache (global)
  logSection('TTS narration cache (.tts-narration-cache.json)');
  try {
    migrateTtsNarrationCache();
  } catch (err) {
    console.error('  ERROR migrating TTS cache:', err);
  }

  // Step 3: Narration cache per demo (must run BEFORE narration.json migration
  // because we need the string IDs from narration.json to build the mapping)
  for (const demoId of demoIds) {
    logSection(`[${demoId}] Narration cache`);
    try {
      migrateNarrationCache(demoId);
    } catch (err) {
      console.error(`  ERROR migrating narration cache for ${demoId}:`, err);
    }
  }

  // Step 4: Narration JSON per demo
  for (const demoId of demoIds) {
    logSection(`[${demoId}] Narration JSON`);
    try {
      migrateNarrationJson(demoId);
    } catch (err) {
      console.error(`  ERROR migrating narration.json for ${demoId}:`, err);
    }
  }

  // Step 5: Alignment JSON per demo
  for (const demoId of demoIds) {
    logSection(`[${demoId}] Alignment JSON`);
    try {
      migrateAlignmentJson(demoId);
    } catch (err) {
      console.error(`  ERROR migrating alignment.json for ${demoId}:`, err);
    }
  }

  // Step 6: Preview directories
  logSection('Preview directories');
  try {
    migratePreviewDirs();
  } catch (err) {
    console.error('  ERROR migrating preview dirs:', err);
  }

  console.log(`\n=== Migration complete: ${totalChanges} changes ===`);
}

main();

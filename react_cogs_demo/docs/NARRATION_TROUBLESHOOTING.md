# Narration System Troubleshooting Guide

Common issues and solutions for the narration externalization system.

**Last Updated**: January 21, 2025  
**Version**: 1.0

---

## Table of Contents

1. [Common Errors](#common-errors)
2. [Debug Checklist](#debug-checklist)
3. [Component-Specific Issues](#component-specific-issues)
4. [Performance Issues](#performance-issues)
5. [FAQ](#faq)

---

## Common Errors

### Error: "Backend API unavailable"

**Symptoms**:
- Orange warning toast when saving narration
- Console error: `Failed to save to file: Network error`
- Changes not persisting to disk

**Cause**: Narration API server not running

**Solution**:
```bash
# Option 1: Start API server separately
npm run narration-api

# Option 2: Start both servers together
npm run dev:full
```

**Verification**:
```bash
# Check if API is running
curl http://localhost:3001/api/health

# Expected output:
# {"status":"ok","timestamp":"...","service":"narration-api","version":"1.0.0"}
```

**Alternative**:
- Edit `narration.json` directly and reload page
- Changes will load even without API server

---

### Error: "Missing narration for 'meeting-highlights'"

**Symptoms**:
- Console error on demo load
- Slides load but no narration text
- Audio files don't play

**Cause**: `narration.json` file missing or corrupt

**Solution**:
```bash
# Re-extract narration from React components
npm run extract-narration -- --demo meeting-highlights

# Verify file exists
ls public/narration/meeting-highlights/narration.json

# Validate JSON syntax
cat public/narration/meeting-highlights/narration.json | python -m json.tool
```

**Prevention**:
- Commit `narration.json` to git
- Don't delete demo narration directories
- Use version control

---

### Error: "TTS server unavailable"

**Symptoms**:
- "Save & Regenerate Audio" fails
- Console error: `503 Service Unavailable`
- Audio files not generated

**Cause**: TTS server not running on port 5000

**Solution**:
```bash
# Navigate to TTS directory
cd ../tts

# Start TTS server (requires Python + dependencies)
python server.py --voice-sample path/to/voice.wav

# Verify server is running
curl http://localhost:5000/health
```

**Workaround**:
- Use "Save" button only (no audio regeneration)
- Generate audio later via CLI: `npm run tts:from-json`

**See**: [`TTS_GUIDE.md`](../../docs/TTS_GUIDE.md) for TTS server setup

---

### Error: "Failed to load narration: JSON parse error"

**Symptoms**:
- Demo fails to load
- Console error: `SyntaxError: Unexpected token`
- Narration system breaks

**Cause**: Corrupt or invalid JSON in `narration.json`

**Solution**:
```bash
# Validate JSON syntax
cat public/narration/meeting-highlights/narration.json | python -m json.tool

# Or use online validator
# Copy file contents to https://jsonlint.com/

# Fix syntax errors
code public/narration/meeting-highlights/narration.json

# Common issues:
# - Missing commas
# - Trailing commas
# - Unescaped quotes
# - Missing brackets
```

**Recovery**:
```bash
# Restore from git
git checkout public/narration/meeting-highlights/narration.json

# Or re-extract from components
npm run extract-narration -- --demo meeting-highlights
```

---

### Error: "EADDRINUSE: port 3001 already in use"

**Symptoms**:
- API server won't start
- Error message about port conflict

**Cause**: Another process using port 3001

**Solution (Windows)**:
```bash
# Find process using port 3001
netstat -ano | findstr :3001

# Kill process (replace <PID> with actual PID)
taskkill /PID <PID> /F

# Restart API server
npm run narration-api
```

**Solution (Linux/Mac)**:
```bash
# Find and kill process
lsof -ti:3001 | xargs kill -9

# Or use different port
NARRATION_API_PORT=3002 npm run narration-api
```

---

### Error: "Access to fetch blocked by CORS policy"

**Symptoms**:
- Browser console error about CORS
- Save operations fail silently
- Network tab shows CORS error

**Cause**: Dev server not on expected origin

**Solution**:
1. **Verify dev server URL**: Should be `http://localhost:5173`
2. **Check API CORS config**: Edit `server/narration-api.cjs`
   ```javascript
   app.use(cors({
     origin: 'http://localhost:5173',  // Ensure this matches
     methods: ['GET', 'POST']
   }));
   ```
3. **Restart API server**: Changes require restart
4. **Clear browser cache**: Hard refresh (Ctrl+Shift+R)

---

### Error: "EACCES: permission denied"

**Symptoms**:
- Save operations fail
- Console error about file permissions
- Files can't be written

**Cause**: Insufficient file system permissions

**Solution (Windows)**:
1. Right-click `public/narration/` folder
2. Properties → Security → Edit
3. Grant write permissions to your user
4. Apply changes

**Solution (Linux/Mac)**:
```bash
# Fix permissions
chmod -R 755 public/narration/

# Verify permissions
ls -la public/narration/
```

**Prevention**:
- Don't run dev server with elevated privileges
- Ensure proper ownership of project files

---

### Warning: "X segment(s) modified - TTS regeneration recommended"

**Symptoms**:
- Warning after running `npm run check-narration`
- Lists specific segments with changes

**Cause**: Narration text changed but audio not regenerated

**Not an Error**: This is expected behavior

**Action Required**:
```bash
# Regenerate audio for changed segments
npm run tts:from-json -- --demo meeting-highlights

# Or regenerate all demos
npm run tts:from-json
```

**Understanding the Warning**:
- System detects narration changes via hash comparison
- Audio files now out of sync with narration text
- Regeneration ensures audio matches current narration

---

## Debug Checklist

When things aren't working, systematically check:

### 1. Server Status

- [ ] Is narration-api server running? (`npm run narration-api`)
- [ ] Is dev server running? (`npm run dev`)
- [ ] Can you access `http://localhost:3001/api/health`?
- [ ] Can you access `http://localhost:5173`?

### 2. File System

- [ ] Does `public/narration/{demo-id}/narration.json` exist?
- [ ] Is narration.json valid JSON? (use validator)
- [ ] Do you have write permissions on narration directory?
- [ ] Is there sufficient disk space?

### 3. Code Status

- [ ] Are there TypeScript errors? (`npx tsc --noEmit`)
- [ ] Did you pull latest changes from git?
- [ ] Did you run `npm install` after pulling?
- [ ] Are dependencies up to date?

### 4. Browser State

- [ ] Check browser console for errors (F12)
- [ ] Check Network tab for failed requests
- [ ] Try hard refresh (Ctrl+Shift+R)
- [ ] Try incognito/private mode
- [ ] Try different browser

### 5. Cache Status

- [ ] Check narration cache: `cat public/narration/{demo-id}/narration-cache.json`
- [ ] Check TTS cache: `cat .tts-narration-cache.json`
- [ ] Run cache check: `npm run tts:check`

---

## Component-Specific Issues

### DemoPlayer: Narration Not Loading

**Symptoms**: Slides display but narration missing

**Debug Steps**:
```typescript
// Check browser console for:
console.log('[DemoPlayer] Loading narration for:', demoId);
console.log('[DemoPlayer] Narration loaded:', narrationData);
console.log('[DemoPlayer] Slides with narration:', slidesWithNarration);
```

**Common Causes**:
- `useExternalNarration` flag not set in metadata
- Narration JSON file missing
- Fetch request failing (check Network tab)

**Solution**:
```typescript
// In src/demos/meeting-highlights/metadata.ts
export const meetingHighlightsMetadata: DemoMetadata = {
  // ... other fields
  useExternalNarration: true  // Ensure this is present
};
```

---

### NarratedController: Edit Modal Not Opening

**Symptoms**: Edit button visible but modal doesn't open

**Debug Steps**:
1. Check browser console for errors
2. Verify manual mode is active (editing only works in manual mode)
3. Check if `showEditModal` state updates

**Common Causes**:
- Not in manual mode (editing disabled in narrated mode)
- React state not updating
- Modal component unmounted

**Solution**:
- Switch to Manual mode first
- Check for React errors in console
- Verify NarrationEditModal is imported

---

### NarrationEditModal: Save Button Disabled

**Symptoms**: Can't click Save button

**Common Causes**:
- Text unchanged from original
- Loading state active
- Validation error

**Debug**:
```typescript
// Check modal state
console.log('Text changed:', editedText !== originalText);
console.log('Is loading:', isLoading);
console.log('Is valid:', editedText.trim().length > 0);
```

---

### TTS Scripts: Narration Not Found

**Symptoms**: `generate-tts.ts` reports "No narration found"

**Debug Steps**:
```bash
# Verify narration.json exists
ls public/narration/meeting-highlights/narration.json

# Check if script loads it
tsx scripts/generate-tts.ts --demo meeting-highlights --from-json
```

**Common Causes**:
- Missing narration.json file
- Wrong demo ID in command
- File path incorrect

**Solution**:
```bash
# Re-extract if missing
npm run extract-narration -- --demo meeting-highlights

# Use correct demo ID (matches folder name)
npm run tts:from-json -- --demo meeting-highlights
```

---

## Performance Issues

### Slow Save Operations

**Symptoms**: Save takes >5 seconds

**Causes**:
- Large narration.json file (>1MB)
- Slow disk I/O
- Network latency to API

**Solutions**:
```bash
# Check file size
ls -lh public/narration/meeting-highlights/narration.json

# Optimize narration.json (remove whitespace)
# Edit server/narration-api.cjs:
fs.writeFileSync(filePath, JSON.stringify(narrationData));  # No pretty-print

# Use SSD if available
# Close other disk-intensive applications
```

---

### Slow Narration Loading

**Symptoms**: Demo takes >2 seconds to load

**Causes**:
- Large narration.json file
- Slow network fetch
- Too many slides

**Solutions**:
- Enable browser caching
- Use service worker for offline support
- Consider pagination for large demos

**Monitor**:
```javascript
console.time('narration-load');
await loadNarration(demoId);
console.timeEnd('narration-load');
// Should be <500ms
```

---

### Memory Leaks During Editing

**Symptoms**: Browser slows down after many edits

**Causes**:
- Event listeners not cleaned up
- State not garbage collected
- Audio elements accumulating

**Prevention**:
- Close edit modal between edits
- Refresh page periodically
- Monitor memory in DevTools (Performance tab)

**Solution**:
```bash
# Restart browser
# Clear cache and reload
# Check for memory leaks in React DevTools
```

---

## FAQ

### Q: How do I edit narration?

**A**: Two ways:
1. **Browser UI** - Click Edit button (✏️) in Manual mode
2. **Direct file edit** - Edit `public/narration/{demo-id}/narration.json`

See [User Guide](NARRATION_SYSTEM_GUIDE.md#editing-narration) for details.

---

### Q: How do I regenerate audio after editing?

**A**: Two ways:
1. **Browser** - Click "Save & Regenerate Audio" in edit modal
2. **CLI** - Run `npm run tts:from-json -- --demo {demo-id}`

Requires TTS server running on port 5000.

---

### Q: Why aren't my changes persisting?

**A**: Check:
- Is narration-api server running? (`npm run narration-api`)
- Check browser console for save errors
- Verify file permissions on `public/narration/`
- Try direct file edit as fallback

---

### Q: Can I use the system without the API server?

**A**: **Yes**, but with limitations:
- ✅ Load narration from JSON
- ✅ Direct file editing works
- ❌ Browser-based save won't work
- ❌ Live audio regeneration won't work

**Workaround**: Edit JSON files directly, regenerate audio via CLI.

---

### Q: How do I revert narration changes?

**A**: Use git:
```bash
# Revert to last commit
git checkout public/narration/meeting-highlights/narration.json

# Revert to specific commit
git checkout abc123 public/narration/meeting-highlights/narration.json

# View history
git log --follow public/narration/meeting-highlights/narration.json
```

---

### Q: What if I accidentally delete narration.json?

**A**: Recover from React components:
```bash
# Re-extract from inline narration (if available)
npm run extract-narration -- --demo meeting-highlights

# Or restore from git
git checkout public/narration/meeting-highlights/narration.json

# Or restore from backup
cp backups/narration-backup-*.json public/narration/meeting-highlights/narration.json
```

---

### Q: How do I migrate a new demo to external narration?

**A**: Follow these steps:
```bash
# 1. Extract narration from React components
npm run extract-narration -- --demo new-demo

# 2. Enable external narration in metadata
# Edit src/demos/new-demo/metadata.ts:
# Add: useExternalNarration: true

# 3. Generate TTS audio from JSON
npm run tts:from-json -- --demo new-demo

# 4. Test in browser
npm run dev
```

See [Migration Guide](NARRATION_EXTERNALIZATION_PLAN.md#migration-strategy).

---

### Q: Can multiple people edit narration simultaneously?

**A**: **Not recommended**. Use git workflow:
1. Person A creates branch and edits
2. Person A commits and pushes
3. Person B pulls changes
4. Person B creates new branch for their edits
5. Use pull requests for review

**Conflict Resolution**: If conflicts occur:
```bash
# Accept their changes
git checkout --theirs public/narration/meeting-highlights/narration.json

# Or accept your changes
git checkout --ours public/narration/meeting-highlights/narration.json

# Then regenerate audio
npm run tts:from-json
```

---

### Q: How do I backup narration data?

**A**: Multiple approaches:
```bash
# Git (recommended)
git commit -am "Backup narration"
git push

# Manual backup
cp -r public/narration/ backups/narration-$(date +%Y%m%d)/

# Export from browser
# Click "Export Narration" button in UI

# Automated backup script
# Add to crontab or Task Scheduler
```

---

### Q: What's the difference between narration cache and TTS cache?

**A**:
- **Narration Cache** (`narration-cache.json`) - Tracks narration text changes
- **TTS Cache** (`.tts-narration-cache.json`) - Tracks audio file generation

**Both caches** work together to detect when audio needs regeneration.

---

### Q: Why does check-narration show changes when I didn't edit anything?

**A**: Possible causes:
- Git line ending changes (CRLF vs LF)
- Whitespace differences
- File encoding changes
- Timestamp updates

**Solution**:
```bash
# Regenerate cache to match current state
npm run extract-narration -- --demo meeting-highlights

# This updates hashes to current content
```

---

### Q: Can I customize the narration JSON format?

**A**: **Not recommended** - breaking the schema will break the system.

**If needed**:
1. Update TypeScript interfaces in `src/utils/narrationLoader.ts`
2. Update extraction script `scripts/extract-narration.ts`
3. Update all consumers of narration data
4. Update documentation

---

## Getting More Help

### Resources

- **[User Guide](NARRATION_SYSTEM_GUIDE.md)** - Complete usage documentation
- **[API Reference](NARRATION_API_REFERENCE.md)** - Backend API details
- **[Implementation Plan](NARRATION_EXTERNALIZATION_PLAN.md)** - Architecture details
- **[Test Results](PHASE_8_TEST_RESULTS.md)** - Test coverage and validation

### Debug Logging

**Enable verbose logging**:
```typescript
// In browser console
localStorage.setItem('debug', 'narration:*');

// Reload page to see debug logs
```

### Report Issues

If you encounter issues not covered here:

1. Check browser console for errors
2. Check narration-api terminal for errors
3. Collect error messages and steps to reproduce
4. Document environment (OS, Node version, browser)
5. Create detailed issue report

---

**Document Version**: 1.0  
**Last Updated**: January 21, 2025  
**Maintained By**: React COGS Demo Team
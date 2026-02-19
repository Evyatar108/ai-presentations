# Troubleshooting Guide

## TTS Generation Issues

### Server Not Responding

**Symptoms**: `ECONNREFUSED`, timeout errors, or generation hangs

**Solutions**:
1. Verify TTS server is running:
   ```bash
   cd tts
   python server.py --voice-sample path/to/voice.wav
   ```
2. Check server health:
   ```bash
   curl http://localhost:5000/health
   ```
3. Verify correct port (default: 5000)
4. Check firewall settings

### Cache Conflicts

**Symptoms**: Audio doesn't match updated narration text

**Solutions**:
1. Delete cache and regenerate:
   ```bash
   rm .tts-narration-cache.json
   npm run tts:generate
   ```
2. Force regeneration:
   ```bash
   npm run tts:generate -- --force
   ```

### Missing Audio Files

**Symptoms**: Console warnings "Audio file not found", silence fallback

**Solutions**:
1. Check directory structure:
   ```bash
   ls -la public/audio/{demo-id}/
   ```
2. Regenerate specific demo:
   ```bash
   npm run tts:generate -- --demo {demo-id}
   ```
3. Verify narrationText is set in slide segments

### Batch Generation Hangs

**Symptoms**: Script stops responding during generation

**Solutions**:
1. Reduce batch size:
   ```bash
   BATCH_SIZE=5 npm run tts:generate
   ```
2. Check TTS server logs for errors
3. Restart TTS server
4. Generate single demo at a time

## Demo Issues

### Demo Not Appearing in Welcome Screen

**Symptoms**: Demo doesn't show up in selection screen

**Checklist**:
1. Verify demo folder has both `metadata.ts` and `index.ts` (auto-discovered by `registry.ts`)
2. Check `metadata.ts` exports `const metadata` with a valid `id` field
3. Ensure `slides/SlidesRegistry.ts` exports `allSlides`
4. Verify thumbnail image exists at specified path
5. Check browser console for import errors

### Demo Fails to Load

**Symptoms**: Error when selecting demo, blank screen

**Solutions**:
1. Check browser console for errors
2. Verify `getSlides()` function in demo `index.ts`
3. Ensure all slide imports in `SlidesRegistry.ts` are valid
4. Check for TypeScript compilation errors

### Slides Not Rendering

**Symptoms**: Blank screen, component errors

**Solutions**:
1. Verify slide component returns valid JSX
2. Check segment prop is being used correctly
3. Ensure all imports are valid
4. Check for React errors in console

## Build Issues

### TypeScript Errors in Scripts

**Symptoms**: Red underlines for `process`, `Buffer`, `fs` in script files

**Status**: Expected behavior - these are Node.js types used in build scripts

**Action**: Ignore these errors - they resolve during compilation

### Build Fails

**Symptoms**: `npm run build` fails with errors

**Solutions**:
1. Run type check first:
   ```bash
   npm run type-check
   ```
2. Clear build cache:
   ```bash
   rm -rf dist node_modules/.vite
   npm run build
   ```
3. Reinstall dependencies:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

## Development Server Issues

### Dev Server Won't Start

**Symptoms**: Port already in use, startup errors

**Solutions**:
1. Kill process on port 5173:
   ```bash
   # Linux/Mac
   lsof -ti:5173 | xargs kill -9
   
   # Windows
   netstat -ano | findstr :5173
   taskkill /PID <PID> /F
   ```
2. Use different port:
   ```bash
   npm run dev -- --port 3000
   ```
3. Skip cache check if TTS server is unavailable:
   ```bash
   npm run dev:skip-cache
   ```

### Hot Reload Not Working

**Symptoms**: Changes don't reflect without manual refresh

**Solutions**:
1. Check file watcher limits (Linux):
   ```bash
   echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
   sudo sysctl -p
   ```
2. Restart dev server
3. Clear browser cache

## Playback Issues

### Audio Not Playing

**Symptoms**: Slides advance but no audio

**Solutions**:
1. Check browser audio permissions
2. Verify audio files exist in `public/audio/`
3. Check browser console for audio loading errors
4. Ensure correct presentation mode (not "Manual Silent")
5. Test with different browser

### Audio Overlapping

**Symptoms**: Multiple audio segments play simultaneously

**Solutions**:
1. Update to latest version (issue fixed in Manual+Audio mode)
2. Restart presentation
3. Clear browser cache

### Video Not Playing

**Symptoms**: Video component shows but doesn't play

**Solutions**:
1. Verify video file exists in `public/videos/`
2. Check video format (MP4 recommended)
3. Ensure `playing` prop is set correctly based on segment
4. Check browser console for video errors
5. Try different video codec (H.264 has best compatibility)

### Slides Advancing Too Fast

**Symptoms**: Slides skip before audio completes in narrated mode

**Solutions**:
1. Check audio durations match expectations:
   ```bash
   npm run tts:duration -- --demo {demo-id}
   ```
2. Verify segment audio paths are correct
3. Check for missing audio files (uses silence fallback)

## Performance Issues

### Slow Initial Load

**Symptoms**: Long wait time before demo selection appears

**Solutions**:
1. Verify lazy loading is working (check Network tab)
2. Build for production and test:
   ```bash
   npm run build
   npm run preview
   ```
3. Check bundle size - demos should load on-demand

### Laggy Animations

**Symptoms**: Choppy transitions, dropped frames

**Solutions**:
1. Check for reduced motion preference (disables animations)
2. Reduce animation complexity in slides
3. Test in production mode (dev mode has overhead)
4. Close other browser tabs/applications

## Asset Issues

### Images Not Loading

**Symptoms**: Broken image icons, missing thumbnails

**Solutions**:
1. Verify image paths start with `/images/`
2. Check image files exist in `public/images/{demo-id}/`
3. Verify image format (JPEG, PNG, WebP supported)
4. Check file permissions

### Large File Sizes

**Symptoms**: Slow loading, large bundle size

**Solutions**:
1. Optimize images:
   ```bash
   # Example with ImageMagick
   convert input.png -quality 85 -resize 1920x1080 output.jpg
   ```
2. Compress videos:
   ```bash
   # Example with ffmpeg
   ffmpeg -i input.mp4 -vcodec h264 -acodec aac output.mp4
   ```
3. Use appropriate formats (WebP for images, H.264 for videos)

## Getting Help

If issues persist:

1. Check GitHub issues for similar problems
2. Enable verbose logging in browser console
3. Collect error messages and stack traces
4. Note browser version and operating system
5. Describe steps to reproduce the issue

## Common Error Messages

### "Cannot find module"

**Cause**: Import path is incorrect

**Fix**: Verify relative paths, ensure file exists

### "Unexpected token"

**Cause**: Syntax error in JSX/TSX

**Fix**: Check for unclosed tags, missing commas

### "Maximum update depth exceeded"

**Cause**: Infinite render loop

**Fix**: Check useEffect dependencies, avoid state updates in render

### "Failed to fetch"

**Cause**: Network request failed (usually TTS server)

**Fix**: Verify TTS server is running and accessible
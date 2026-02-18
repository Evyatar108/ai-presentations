import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { SlideComponentWithMetadata } from '../src/slides/SlideMetadata';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
interface ExtractionConfig {
  demosDir: string;
  outputDir: string;
  demoFilter?: string;
}

// Narration JSON structure
interface NarrationSegment {
  id: string;
  narrationText: string;
  visualDescription?: string;
  notes?: string;
}

interface NarrationSlide {
  chapter: number;
  slide: number;
  title: string;
  segments: NarrationSegment[];
}

interface NarrationJSON {
  demoId: string;
  version: string;
  lastModified: string;
  slides: NarrationSlide[];
}

// Cache structure
interface NarrationCacheEntry {
  hash: string;
  lastChecked: string;
}

interface NarrationCache {
  version: string;
  generatedAt: string;
  segments: {
    [key: string]: NarrationCacheEntry;
  };
}

// Get all demo IDs by scanning the demos directory
async function getAllDemoIds(demosDir: string): Promise<string[]> {
  const entries = fs.readdirSync(demosDir, { withFileTypes: true });
  
  return entries
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .filter(name => {
      // Verify it has an index.ts file
      const indexPath = path.join(demosDir, name, 'index.ts');
      return fs.existsSync(indexPath);
    });
}

// Load slides for a specific demo
async function loadDemoSlides(demoId: string, demosDir: string): Promise<SlideComponentWithMetadata[]> {
  try {
    const slidesRegistryPath = `../src/demos/${demoId}/slides/SlidesRegistry.js`;
    const module = await import(slidesRegistryPath);
    return module.allSlides || [];
  } catch (error: any) {
    console.warn(`⚠️  Could not load slides for demo '${demoId}': ${error.message}`);
    return [];
  }
}

// Generate SHA-256 hash for text
function generateHash(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex');
}

// Extract narration from slides
async function extractNarration(demoId: string, demosDir: string): Promise<{
  narration: NarrationJSON;
  cache: NarrationCache;
}> {
  console.log(`\n📖 Extracting narration from demo: ${demoId}`);
  
  const allSlides = await loadDemoSlides(demoId, demosDir);
  
  if (allSlides.length === 0) {
    throw new Error(`No slides found for demo '${demoId}'`);
  }
  
  console.log(`   Found ${allSlides.length} slides\n`);
  
  const slides: NarrationSlide[] = [];
  const cacheSegments: { [key: string]: NarrationCacheEntry } = {};
  const timestamp = new Date().toISOString();
  
  let totalSegments = 0;
  let segmentsWithNarration = 0;
  
  for (const slideComponent of allSlides) {
    const { chapter, slide, title, audioSegments } = slideComponent.metadata;
    
    if (!audioSegments || audioSegments.length === 0) {
      console.log(`   ⚠️  Ch${chapter}/S${slide} (${title}): No audio segments, skipping...`);
      continue;
    }
    
    const narrationSlide: NarrationSlide = {
      chapter,
      slide,
      title,
      segments: []
    };
    
    for (const segment of audioSegments) {
      totalSegments++;
      
      if (!segment.narrationText) {
        console.log(`   ⚠️  Ch${chapter}/S${slide} Segment "${segment.id}": No narration text`);
        continue;
      }
      
      segmentsWithNarration++;
      
      // Create narration segment
      const narrationSegment: NarrationSegment = {
        id: segment.id,
        narrationText: segment.narrationText,
        visualDescription: segment.visualDescription || '',
        notes: ''
      };
      
      narrationSlide.segments.push(narrationSegment);
      
      // Generate cache entry
      const cacheKey = `ch${chapter}:s${slide}:${segment.id}`;
      const hash = generateHash(segment.narrationText);
      
      cacheSegments[cacheKey] = {
        hash,
        lastChecked: timestamp
      };
      
      console.log(`   ✅ Ch${chapter}/S${slide} "${segment.id}": Extracted (${segment.narrationText.length} chars)`);
    }
    
    if (narrationSlide.segments.length > 0) {
      slides.push(narrationSlide);
    }
  }
  
  console.log(`\n   📊 Summary:`);
  console.log(`      Total segments: ${totalSegments}`);
  console.log(`      With narration: ${segmentsWithNarration}`);
  console.log(`      Slides extracted: ${slides.length}`);
  
  const narration: NarrationJSON = {
    demoId,
    version: '1.0',
    lastModified: timestamp,
    slides
  };
  
  const cache: NarrationCache = {
    version: '1.0',
    generatedAt: timestamp,
    segments: cacheSegments
  };
  
  return { narration, cache };
}

// Save JSON file
function saveJSON(filepath: string, data: any): void {
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
}

// Main function
async function main() {
  console.log('🎙️  Narration Extraction Script\n');
  console.log('═'.repeat(70));
  
  const args = process.argv.slice(2);
  const demoIndex = args.indexOf('--demo');
  const demoFilter = demoIndex !== -1 && args[demoIndex + 1] ? args[demoIndex + 1] : undefined;
  
  const config: ExtractionConfig = {
    demosDir: path.join(__dirname, '../src/demos'),
    outputDir: path.join(__dirname, '../public/narration'),
    demoFilter
  };
  
  // Get demos to process
  const allDemoIds = await getAllDemoIds(config.demosDir);
  const demosToProcess = config.demoFilter
    ? allDemoIds.filter(id => id === config.demoFilter)
    : allDemoIds;
  
  if (demosToProcess.length === 0) {
    if (config.demoFilter) {
      console.error(`❌ Demo '${config.demoFilter}' not found.`);
      console.log(`\nAvailable demos: ${allDemoIds.join(', ')}\n`);
    } else {
      console.error('❌ No demos found in src/demos/\n');
    }
    process.exit(1);
  }
  
  console.log(`📦 Processing ${demosToProcess.length} demo(s): ${demosToProcess.join(', ')}\n`);
  console.log('═'.repeat(70));
  
  let totalExtracted = 0;
  
  for (const demoId of demosToProcess) {
    try {
      const { narration, cache } = await extractNarration(demoId, config.demosDir);
      
      // Save narration.json
      const narrationPath = path.join(config.outputDir, demoId, 'narration.json');
      saveJSON(narrationPath, narration);
      console.log(`\n   💾 Saved: ${path.relative(process.cwd(), narrationPath)}`);
      
      // Save narration-cache.json
      const cachePath = path.join(config.outputDir, demoId, 'narration-cache.json');
      saveJSON(cachePath, cache);
      console.log(`   💾 Saved: ${path.relative(process.cwd(), cachePath)}`);
      
      totalExtracted += narration.slides.length;
      
    } catch (error: any) {
      console.error(`\n❌ Error processing demo '${demoId}': ${error.message}`);
      process.exit(1);
    }
  }
  
  console.log('\n' + '═'.repeat(70));
  console.log('📊 Extraction Complete\n');
  console.log(`   Demos processed: ${demosToProcess.length}`);
  console.log(`   Total slides extracted: ${totalExtracted}`);
  console.log('\n✅ Narration successfully extracted to JSON files');
  console.log('═'.repeat(70) + '\n');
}

// Execute
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
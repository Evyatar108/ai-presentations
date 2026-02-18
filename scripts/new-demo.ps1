# new-demo.ps1 - Create a new demo with standardized structure
# Usage: .\scripts\new-demo.ps1 -DemoId "my-demo-name" [-DemoTitle "My Demo Title"]

param(
    [Parameter(Mandatory=$true)]
    [string]$DemoId,
    
    [Parameter(Mandatory=$false)]
    [string]$DemoTitle = ""
)

# Validate demo ID format (lowercase with hyphens only)
if ($DemoId -notmatch '^[a-z0-9]+(-[a-z0-9]+)*$') {
    Write-Host "Error: Demo ID must be lowercase with hyphens only (e.g., 'my-demo-name')" -ForegroundColor Red
    exit 1
}

# Use demo ID as title if not provided (capitalize words)
if ([string]::IsNullOrEmpty($DemoTitle)) {
    $DemoTitle = ($DemoId -split '-' | ForEach-Object { $_.Substring(0,1).ToUpper() + $_.Substring(1) }) -join ' '
}

Write-Host "`n=== Creating Demo: $DemoId ===" -ForegroundColor Cyan
Write-Host "Title: $DemoTitle`n"

$createdFiles = @()
$createdDirs = @()

# Base paths
$docsPath = "docs/demos/$DemoId"
$srcPath = "presentation-app/src/demos/$DemoId"
$publicAudioPath = "presentation-app/public/audio/$DemoId"
$publicImagesPath = "presentation-app/public/images/$DemoId"
$publicVideosPath = "presentation-app/public/videos/$DemoId"

# Create directories
Write-Host "Creating directories..." -ForegroundColor Yellow

$directories = @(
    $docsPath,
    "$docsPath/context",
    $srcPath,
    "$srcPath/slides",
    "$srcPath/slides/chapters",
    "$publicAudioPath/c0",
    $publicImagesPath,
    $publicVideosPath
)

foreach ($dir in $directories) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        $createdDirs += $dir
        Write-Host "  ✓ Created: $dir" -ForegroundColor Green
    } else {
        Write-Host "  → Exists: $dir" -ForegroundColor Gray
    }
}

# Create documentation main file
Write-Host "`nCreating documentation files..." -ForegroundColor Yellow

$mainDocContent = @"
# $DemoTitle

## Overview

$DemoTitle is a presentation demo showcasing [describe what this demo presents].

## Demo Structure

**Total Slides**: X slides across Y chapters
**Duration**: ~X:XX minutes

### Chapter Breakdown

#### Chapter 0: Introduction (1 slide)
- **Ch0_S1_Intro** - Opening slide

## Target Audience

This presentation is designed for:
- [Target audience description]

## Assets

### Videos
Located in ``public/videos/$DemoId/``:
- Add video files here

### Images
Located in ``public/images/$DemoId/``:
- **${DemoId}-thumbnail.jpeg** - Demo thumbnail (16:9 ratio recommended)
- Add other images here

### Audio
Located in ``public/audio/$DemoId/c{0-9}/``:
- Generated via TTS from narration text
- WAV format, 24kHz mono

## Notable Implementation Details

### Technical Stack
- **React** + **TypeScript** for type safety
- **Framer Motion** for animations
- **Accessibility features**: reduced motion support

### File Structure
- Located in [``src/demos/$DemoId/slides/chapters/``](../../presentation-app/src/demos/$DemoId/slides/chapters/)
- Registered in [``SlidesRegistry.ts``](../../presentation-app/src/demos/$DemoId/slides/SlidesRegistry.ts)

## Related Documentation

- **Context Materials**: [``context/``](context/) directory
- **Technical Implementation**: [``src/demos/$DemoId/README.md``](../../presentation-app/src/demos/$DemoId/README.md)

## Demo-Specific Commands

``````bash
# Generate TTS audio for this demo only
npm run tts:generate -- --demo $DemoId

# Calculate duration
npm run tts:duration -- --demo $DemoId
``````
"@

$mainDocPath = "$docsPath/$DemoId.md"
$mainDocContent | Out-File -FilePath $mainDocPath -Encoding UTF8
$createdFiles += $mainDocPath
Write-Host "  ✓ Created: $mainDocPath" -ForegroundColor Green

# Create context README
$contextReadmeContent = @"
# $DemoTitle - Context Materials

## Purpose

This directory contains background materials needed to understand and create the demo content.

## Typical Context Files

For a real demo, include:

### 1. Product/Feature Overview
**File**: ``product-overview.md``
- What the product/feature is
- Key capabilities and benefits

### 2. Technical Architecture  
**File**: ``architecture.md``
- System components and services
- Data flow diagrams

### 3. Team Collaboration
**File**: ``team-collaboration.md``
- Teams involved
- Roles and responsibilities

### 4. Version-Specific Implementation
**Directory**: ``v1/``, ``v2/``, etc.
- Implementation code samples
- Schema definitions

## Example Structure

``````
context/
├── product-overview.md
├── architecture.md
├── team-collaboration.md
└── v1/
    └── implementation-details.py
``````

## File Naming Conventions

Use descriptive, hyphenated lowercase names:
- ✅ ``product-overview.md``
- ✅ ``team-collaboration.md``
- ❌ ``Product Overview.md`` (spaces)

## Related Documentation

- **[Demo Documentation Structure](../../DEMO_DOCUMENTATION_STRUCTURE.md)** - Overall documentation guidelines
"@

$contextReadmePath = "$docsPath/context/README.md"
$contextReadmeContent | Out-File -FilePath $contextReadmePath -Encoding UTF8
$createdFiles += $contextReadmePath
Write-Host "  ✓ Created: $contextReadmePath" -ForegroundColor Green

# Create source files
Write-Host "`nCreating source files..." -ForegroundColor Yellow

# metadata.ts
$metadataContent = @"
import type { DemoMetadata } from '@framework/demos/types';

export const metadata: DemoMetadata = {
  id: '$DemoId',
  title: '$DemoTitle',
  description: 'Brief description of what this demo presents',
  thumbnail: '/images/$DemoId/${DemoId}-thumbnail.jpeg',
  tags: ['category1', 'category2'],
  // duration: 180  // Optional: duration in seconds (audio only)
};
"@

$metadataPath = "$srcPath/metadata.ts"
$metadataContent | Out-File -FilePath $metadataPath -Encoding UTF8
$createdFiles += $metadataPath
Write-Host "  ✓ Created: $metadataPath" -ForegroundColor Green

# index.ts
$indexContent = @"
import type { DemoConfig } from '@framework/demos/types';
import { metadata } from './metadata';

const demoConfig: DemoConfig = {
  id: '$DemoId',
  metadata,
  getSlides: async () => {
    const { allSlides } = await import('./slides/SlidesRegistry');
    return allSlides;
  }
};

export default demoConfig;
"@

$indexPath = "$srcPath/index.ts"
$indexContent | Out-File -FilePath $indexPath -Encoding UTF8
$createdFiles += $indexPath
Write-Host "  ✓ Created: $indexPath" -ForegroundColor Green

# Chapter0.tsx
$chapter0Content = @"
import { SlideComponentWithMetadata } from '@framework/slides/SlideMetadata';

export const Ch0_S1_Intro: SlideComponentWithMetadata = () => (
  <div style={{
    width: '100%',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    fontFamily: 'Inter, system-ui, sans-serif'
  }}>
    <h1 style={{ fontSize: '4rem', fontWeight: 'bold', margin: 0 }}>
      $DemoTitle
    </h1>
    <p style={{ fontSize: '1.5rem', marginTop: '1rem', opacity: 0.9 }}>
      Your presentation subtitle here
    </p>
  </div>
);

Ch0_S1_Intro.metadata = {
  chapter: 0,
  slide: 1,
  title: '$DemoTitle',
  audioSegments: [
    {
      id: 'intro',
      audioFilePath: '/audio/$DemoId/c0/s1_segment_01_intro.wav'
    }
  ]
};
"@

$chapter0Path = "$srcPath/slides/chapters/Chapter0.tsx"
$chapter0Content | Out-File -FilePath $chapter0Path -Encoding UTF8
$createdFiles += $chapter0Path
Write-Host "  ✓ Created: $chapter0Path" -ForegroundColor Green

# SlidesRegistry.ts
$slidesRegistryContent = @"
import { SlideComponentWithMetadata } from '@framework/slides/SlideMetadata';
import { Ch0_S1_Intro } from './chapters/Chapter0';

export const allSlides: SlideComponentWithMetadata[] = [
  Ch0_S1_Intro,
  // Add more slides here
];
"@

$slidesRegistryPath = "$srcPath/slides/SlidesRegistry.ts"
$slidesRegistryContent | Out-File -FilePath $slidesRegistryPath -Encoding UTF8
$createdFiles += $slidesRegistryPath
Write-Host "  ✓ Created: $slidesRegistryPath" -ForegroundColor Green

# README.md (technical)
$techReadmeContent = @"
# $DemoTitle

**Demo ID**: ``$DemoId``  
**Duration**: ~X minutes  
**Slides**: X slides across Y chapters

## Overview

[Brief technical description of the demo]

## Content Structure

### Chapter 0: Introduction (1 slide)
- **Ch0_S1_Intro** - Opening slide

## Technical Implementation

### Slide Organization
- Located in [``slides/chapters/``](slides/chapters/)
- Registered in [``slides/SlidesRegistry.ts``](slides/SlidesRegistry.ts)

### Audio Files
- Location: ``public/audio/$DemoId/c{0-9}/``
- Format: WAV (24kHz mono)
- Generated via TTS system

### Assets
- Images: ``public/images/$DemoId/``
- Videos: ``public/videos/$DemoId/``

## Development

``````bash
# Run development server
npm run dev

# Generate TTS audio
npm run tts:generate -- --demo $DemoId

# Calculate duration  
npm run tts:duration -- --demo $DemoId
``````

## Related Documentation

- **Demo Specification**: [``docs/demos/$DemoId/$DemoId.md``](../../../docs/demos/$DemoId/$DemoId.md)
- **Context Materials**: [``docs/demos/$DemoId/context/``](../../../docs/demos/$DemoId/context/)
"@

$techReadmePath = "$srcPath/README.md"
$techReadmeContent | Out-File -FilePath $techReadmePath -Encoding UTF8
$createdFiles += $techReadmePath
Write-Host "  ✓ Created: $techReadmePath" -ForegroundColor Green

# Summary
Write-Host "`n=== Summary ===" -ForegroundColor Cyan
Write-Host "`nCreated $($createdDirs.Count) directories:" -ForegroundColor Yellow
foreach ($dir in $createdDirs) {
    Write-Host "  • $dir" -ForegroundColor White
}

Write-Host "`nCreated $($createdFiles.Count) files:" -ForegroundColor Yellow
foreach ($file in $createdFiles) {
    Write-Host "  • $file" -ForegroundColor White
}

Write-Host "`n=== Next Steps ===" -ForegroundColor Cyan
Write-Host @"

1. Register the demo in registry.ts:
   • Open: presentation-app/src/demos/registry.ts
   • Add import: import ${DemoId}Demo from './$DemoId';
   • Add import: import { metadata as ${DemoId}Metadata } from './$DemoId/metadata';
   • Add registration:
     DemoRegistry.registerDemo({
       id: '${DemoId}',
       metadata: ${DemoId}Metadata,
       loadConfig: async () => ${DemoId}Demo
     });

2. Add demo thumbnail:
   • Create: $publicImagesPath/${DemoId}-thumbnail.jpeg
   • Recommended size: 16:9 ratio

3. Update documentation:
   • Edit: $docsPath/$DemoId.md
   • Add context files in: $docsPath/context/

4. Create slides:
   • Add chapters in: $srcPath/slides/chapters/
   • Update: $srcPath/slides/SlidesRegistry.ts

5. Generate TTS audio:
   cd presentation-app
   npm run tts:generate -- --demo $DemoId

6. Test the demo:
   npm run dev

"@ -ForegroundColor White

Write-Host "Demo '$DemoId' created successfully! 🎉`n" -ForegroundColor Green
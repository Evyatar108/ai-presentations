# Meeting Highlights - Team Collaboration

## Overview

Meeting Highlights is a **cross-team collaboration** bringing together multiple Microsoft teams to deliver an AI-powered feature that creates engaging video summaries of meetings.

## Teams Involved

### Core Teams

#### ODSP (OneDrive and SharePoint)
- **Role**: Storage orchestration and triggering
- Initiates highlights generation when recordings are created
- Stores all highlights data alongside meeting recordings

#### MSAI-Hive (TmrEnrichment Service)
- **Role**: AI-powered highlights generation
- Processes meeting transcripts using LLM technology
- Generates highlight timestamps and narration content

#### Clipchamp
- **Role**: Video player experience
- Owns the highlights player component
- Delivers the visual playback experience to users

#### Loop
- **Role**: Component integration
- Enables seamless embedding of the Clipchamp player
- Bridges the player with BizChat and Teams interfaces

#### BizChat
- **Role**: Primary user interface
- Provides natural language access to highlights
- Orchestrates the end-to-end user experience

#### Teams
- **Role**: Alternative user interface
- Delivers highlights within the Teams ecosystem
- Shares the same player technology via Loop

## How Teams Collaborate

### Generation Phase
1. **ODSP** detects new recording → triggers **MSAI-Hive**
2. **MSAI-Hive** processes content → returns to **ODSP** for storage

### User Access Phase
1. User asks **BizChat** or **Teams** for meeting highlights
2. **Loop** loads the **Clipchamp** player component
3. Player fetches data from **ODSP** and plays the highlights

## Why This Matters

This project showcases **true cross-org collaboration**:
- 6+ teams working together
- Unified user experience across multiple surfaces
- Shared components and APIs
- Combined expertise in AI, storage, media, and UX

The COGS reduction work made this collaboration sustainable by optimizing the AI processing pipeline, enabling scale within approved capacity constraints.

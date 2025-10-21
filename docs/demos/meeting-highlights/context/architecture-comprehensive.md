# Meeting Highlights Architecture - Comprehensive Component Reference

## Component Overview

This document provides a detailed breakdown of all components involved in the Meeting Highlights pipeline, including their roles as producers/consumers, ownership, and contacts.

## Core Components

### MeTA (Meeting Transcript and Audio)
- **Type**: Core
- **ICM Team**: OMG \ Extension and OnePlayer
- **DRI/Contacts**: Zhanyu, shawnxia
- **Role**: 
  - **Producer**: Triggers highlights generation and stores results in ODSP
  - **Consumer**: 
    - Manifest generation in 1P init
    - Generation of partial segments
    - Generation of playback for highlight audio

### TMR Processor (Transcript and Meeting Recording)
- **Type**: Core
- **ICM Team**: MeetingCatchUp \ HighlightsAndTranscriptSearch
- **Parent ICM Team**: MeetingCatchup\Triage (for overall Substrate or service-based issues)
- **DRI/Contacts**: Amcarmel, dasagi
- **Role**: 
  - **Producer**: Generates highlights metadata and playback per MeTA's request

### BizChat Client
- **Type**: Core
- **ICM Team**: BizChatExperiences (BCX) \ Response and Conversation Experiences (RCX) DRI
- **DRI/Contacts**: Aryanraj, aagagran, bizchatentitiesbug
- **Role**: 
  - **Consumer**: Initiates 1P client (on top of a Loop component) with highlights mode, based on 3SR API call and Sydney's response

### 1P Client (First Party Client)
- **Type**: Core
- **ICM Team**: ClimpchampConsumptionAndDiscoveryWebApps\ PlayerPage
- **DRI/Contacts**: Jesuso, hahao, machury
- **Role**: 
  - **Consumer**: Fetches init metadata from ODSP SQL BE and initializes 1P client

## Partner Components

### Loop
- **Type**: Partner
- **ICM Team**: Loop Experiences\ Loop Ecosystem
- **DRI/Contacts**: Nimgup, vladris
- **Role**: 
  - **Consumer**: Hosts iFrame and 1P client on top of BizChat

### Sydney
- **Type**: Partner
- **ICM Team**: Enterprise Sydney\ BizChatDRI
- **DRI/Contacts**: turingSydneydevs
- **Role**: 
  - **Consumer**: BizChat backend service. When the meeting hero card is returned, the client starts the highlights flow

### 3SR MCU (Meeting Catchup)
- **Type**: Partner
- **ICM Team**: MeetingCatchUp \ 3SR
- **DRI/Contacts**: mugonyaga
- **Role**: 
  - **Consumer**: Called by BizChat to check if highlights exist and to fetch recording URL, as prerequisites for 1P init

### ODSP (OneDrive for Business)
- **Type**: Partner
- **ICM Team**: OneDrive and SharePoint \ SRE-LiveSite
- **Reference**: [How do I find who owns what for ODC?](https://aka.ms/odsp-wiki)
- **Role**: 
  - **Producer + Consumer**: Storage of highlights data
    - Init required metadata stored on recording file's SQL table
    - Playback data stored as alt streams of the recording file
    - Data stored at end of producer flow
    - Consumed when 1P is initiated in highlights mode

### VRoom
- **Type**: Partner
- **ICM Team**: DevPlat \ Vroom
- **DRI/Contacts**: askvroom
- **Role**: 
  - **Producer + Consumer**: API layer for ODSP. Used for storing and consuming alt streams and storing highlights metadata

### LLM + Polymer
- **Type**: Partner
- **ICM Template**: [LLM API ICM Template](https://aka.ms/llm-api-icm-template)
- **Support**: [Substrate AI Help](https://aka.ms/substrate-ai-get-help)
- **Role**: 
  - **Producer**: Called by TMR processor with transcript input to generate highlights metadata and content

### ACS (Azure Communication Services)
- **Type**: Partner
- **ICM Team**: Speech services\ Speech SDK
- **DRI/Contacts**: Rhurey, panu.koponen, Brian.Mouncer
- **Role**: 
  - **Producer**: Generates AI narrator audio based on text returned by LLM

### Loki
- **Type**: Partner
- **ICM Team**: Loki \ Loki Service
- **DRI/Contacts**: fastloki
- **Role**: 
  - **Consumer**: Middle tier model D service used by BizChat client for outgoing API calls. For highlights scenario, a 3SR request is made via Loki

## Data Flow Summary

1. **Recording Created** → MeTA triggers TMR Processor
2. **TMR Processor** → Calls LLM + Polymer with transcript
3. **LLM + Polymer** → Returns highlights metadata and content
4. **TMR Processor** → Calls ACS for narrator audio generation
5. **MeTA** → Stores highlights data in ODSP via VRoom
6. **User Request** → BizChat client queries Sydney
7. **Sydney** → Returns meeting hero card
8. **BizChat** → Calls 3SR (via Loki) to check highlights existence
9. **3SR** → Returns recording URL if highlights exist
10. **BizChat** → Initiates 1P client via Loop
11. **1P Client** → Fetches highlights data from ODSP
12. **User** → Views highlights in player

## Component Types

- **Core Components**: Essential services owned and maintained by the core team
- **Partner Components**: Services provided by partner teams that integrate with the highlights pipeline
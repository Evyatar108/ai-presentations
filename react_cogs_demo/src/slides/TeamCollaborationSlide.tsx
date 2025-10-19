import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../accessibility/ReducedMotion';
import { useSegmentedAnimation } from '../contexts/SegmentContext';
import { SlideComponentWithMetadata } from './SlideMetadata';

interface TeamInfo {
  id: string;
  name: string;
  logo: string;
  role: string;
  description: string;
}

const teams: TeamInfo[] = [
  {
    id: 'intro',
    name: 'Cross-Team Collaboration',
    logo: '',
    role: '',
    description: 'Meeting Highlights brings together six Microsoft teams'
  },
  {
    id: 'odsp',
    name: 'ODSP',
    logo: '/images/logos/odsp.png',
    role: 'Storage & Orchestration',
    description: 'Initiates highlights generation and stores all data'
  },
  {
    id: 'msai',
    name: 'MSAI-Hive',
    logo: '/images/logos/msai-hive.png',
    role: 'AI Generation',
    description: 'Processes transcripts using LLM technology'
  },
  {
    id: 'clipchamp',
    name: 'Clipchamp',
    logo: '/images/logos/ClipChamp.png',
    role: 'Video Player',
    description: 'Owns the highlights player component'
  },
  {
    id: 'loop',
    name: 'Loop',
    logo: '/images/logos/Loop.png',
    role: 'Integration Layer',
    description: 'Enables seamless player embedding'
  },
  {
    id: 'bizchat',
    name: 'BizChat',
    logo: '/images/logos/BizChat.png',
    role: 'Primary UI',
    description: 'Provides natural language access'
  },
  {
    id: 'teams',
    name: 'Teams',
    logo: '/images/logos/Teams.png',
    role: 'Alternative UI',
    description: 'Delivers within Teams ecosystem'
  },
  {
    id: 'conclusion',
    name: 'True Collaboration',
    logo: '',
    role: '',
    description: 'Together delivering a seamless user experience'
  }
];

/**
 * Chapter 2 - Team Collaboration
 * Demonstrates multi-segment slide with progressive logo reveals
 */
export const Ch2_TeamCollaboration: SlideComponentWithMetadata = () => {
  const { reduced } = useReducedMotion();
  const { currentSegmentIndex, isSegmentVisible } = useSegmentedAnimation();

  // Helper to determine which teams to show
  const visibleTeams = teams.filter((_, index) => isSegmentVisible(index));
  const currentTeam = teams[currentSegmentIndex];
  const isIntroOrConclusion = currentTeam?.id === 'intro' || currentTeam?.id === 'conclusion';

  return (
    <div
      style={{
        background: '#0f172a',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}
    >
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          color: '#f1f5f9',
          marginBottom: '3rem',
          fontSize: 36,
          textAlign: 'center'
        }}
      >
        Meeting Highlights - Team Collaboration
      </motion.h1>

      {/* Show intro or conclusion message */}
      {isIntroOrConclusion && (
        <motion.div
          key={currentTeam.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: reduced ? 0.3 : 0.6 }}
          style={{
            textAlign: 'center',
            maxWidth: 600,
            marginBottom: '3rem'
          }}
        >
          <p
            style={{
              color: '#e2e8f0',
              fontSize: 24,
              lineHeight: 1.6
            }}
          >
            {currentTeam.description}
          </p>
        </motion.div>
      )}

      {/* Team logos grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '2rem',
          maxWidth: 900,
          width: '100%'
        }}
      >
        <AnimatePresence mode="popLayout">
          {visibleTeams
            .filter(team => team.logo) // Only show teams with logos
            .map((team, visualIndex) => {
              const isCurrentTeam = team.id === currentTeam?.id;
              
              return (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{
                    opacity: 1,
                    scale: isCurrentTeam ? 1.05 : 1,
                    y: 0
                  }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{
                    duration: reduced ? 0.3 : 0.6,
                    type: 'spring',
                    stiffness: 100
                  }}
                  style={{
                    background: isCurrentTeam
                      ? 'linear-gradient(135deg, rgba(0, 183, 195, 0.2), rgba(0, 120, 212, 0.2))'
                      : '#1e293b',
                    borderRadius: 16,
                    padding: '2rem',
                    border: isCurrentTeam ? '2px solid #00B7C3' : '1px solid #334155',
                    boxShadow: isCurrentTeam && !reduced
                      ? '0 0 30px rgba(0, 183, 195, 0.4)'
                      : '0 4px 12px rgba(0, 0, 0, 0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    position: 'relative'
                  }}
                >
                  {/* Logo */}
                  <motion.img
                    src={team.logo}
                    alt={team.name}
                    style={{
                      width: 80,
                      height: 80,
                      objectFit: 'contain',
                      marginBottom: '1rem'
                    }}
                    animate={
                      isCurrentTeam && !reduced
                        ? {
                            scale: [1, 1.1, 1],
                            transition: { duration: 2, repeat: Infinity }
                          }
                        : {}
                    }
                  />

                  {/* Team name */}
                  <h3
                    style={{
                      color: '#f1f5f9',
                      fontSize: 20,
                      fontWeight: 600,
                      margin: '0.5rem 0'
                    }}
                  >
                    {team.name}
                  </h3>

                  {/* Role */}
                  <p
                    style={{
                      color: '#00B7C3',
                      fontSize: 14,
                      fontWeight: 500,
                      margin: '0.25rem 0 0.75rem'
                    }}
                  >
                    {team.role}
                  </p>

                  {/* Description - only show for current team */}
                  <AnimatePresence>
                    {isCurrentTeam && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: reduced ? 0.2 : 0.4 }}
                        style={{
                          color: '#94a3b8',
                          fontSize: 13,
                          lineHeight: 1.5,
                          margin: 0
                        }}
                      >
                        {team.description}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  {/* Highlight indicator */}
                  {isCurrentTeam && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                      style={{
                        position: 'absolute',
                        top: -10,
                        right: -10,
                        width: 30,
                        height: 30,
                        borderRadius: '50%',
                        background: '#10b981',
                        border: '3px solid #0f172a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 16,
                        color: '#fff'
                      }}
                    >
                      ✓
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
        </AnimatePresence>
      </div>

      {/* Segment progress indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{
          marginTop: '3rem',
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'center'
        }}
      >
        {teams.map((team, index) => (
          <div
            key={team.id}
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: isSegmentVisible(index) ? '#00B7C3' : '#334155',
              border: index === currentSegmentIndex ? '2px solid #f1f5f9' : 'none',
              transition: 'all 0.3s ease'
            }}
          />
        ))}
      </motion.div>
    </div>
  );
};

Ch2_TeamCollaboration.metadata = {
  chapter: 2,
  slide: 1,
  title: 'Team Collaboration',
  srtFilePath: 'highlights_demo/chapters/c2/s1_team_collaboration.srt',
  audioSegments: [
    { id: 'intro', audioFilePath: '/audio/00-Silence.mp3' },
    { id: 'odsp', audioFilePath: '/audio/00-Silence.mp3' },
    { id: 'msai', audioFilePath: '/audio/00-Silence.mp3' },
    { id: 'clipchamp', audioFilePath: '/audio/00-Silence.mp3' },
    { id: 'loop', audioFilePath: '/audio/00-Silence.mp3' },
    { id: 'bizchat', audioFilePath: '/audio/00-Silence.mp3' },
    { id: 'teams', audioFilePath: '/audio/00-Silence.mp3' },
    { id: 'conclusion', audioFilePath: '/audio/00-Silence.mp3' }
  ]
};
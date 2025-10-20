import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DemoRegistry } from '../demos/DemoRegistry';
import type { DemoMetadata } from '../demos/types';

interface WelcomeScreenProps {
  onSelectDemo: (demoId: string) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSelectDemo }) => {
  const [demos, setDemos] = useState<DemoMetadata[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    // Load all demo metadata
    const allDemos = DemoRegistry.getAllMetadata();
    setDemos(allDemos);
  }, []);

  if (demos.length === 0) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        fontFamily: 'Inter, system-ui, sans-serif',
        color: '#f1f5f9'
      }}>
        <p>Loading demos...</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      padding: '3rem 2rem',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          textAlign: 'center',
          marginBottom: '3rem'
        }}
      >
        <h1 style={{
          fontSize: 48,
          fontWeight: 700,
          color: '#f1f5f9',
          marginBottom: '1rem',
          background: 'linear-gradient(135deg, #00B7C3, #0078D4)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Demo Presentations
        </h1>
        <p style={{
          fontSize: 18,
          color: '#94a3b8',
          maxWidth: 600,
          margin: '0 auto'
        }}>
          Select a presentation to view
        </p>
      </motion.div>

      {/* Demo Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '2rem',
        maxWidth: 1200,
        margin: '0 auto'
      }}>
        {demos.map((demo, index) => (
          <motion.div
            key={demo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onHoverStart={() => setHoveredId(demo.id)}
            onHoverEnd={() => setHoveredId(null)}
            onClick={() => onSelectDemo(demo.id)}
            style={{
              background: hoveredId === demo.id 
                ? 'linear-gradient(135deg, rgba(0, 183, 195, 0.15), rgba(0, 120, 212, 0.15))'
                : 'rgba(30, 41, 59, 0.6)',
              borderRadius: 16,
              overflow: 'hidden',
              cursor: 'pointer',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              transform: hoveredId === demo.id ? 'scale(1.02)' : 'scale(1)',
              boxShadow: hoveredId === demo.id 
                ? '0 20px 40px rgba(0, 183, 195, 0.3)'
                : '0 4px 12px rgba(0, 0, 0, 0.3)',
              transition: 'all 0.3s ease'
            }}
          >
            {/* Thumbnail */}
            {demo.thumbnail && (
              <div style={{
                width: '100%',
                height: 200,
                background: `url(${demo.thumbnail}) center/cover`,
                borderBottom: '1px solid rgba(148, 163, 184, 0.2)'
              }} />
            )}

            {/* Content */}
            <div style={{ padding: '1.5rem' }}>
              <h2 style={{
                fontSize: 24,
                fontWeight: 600,
                color: '#f1f5f9',
                marginBottom: '0.75rem'
              }}>
                {demo.title}
              </h2>

              {demo.description && (
                <p style={{
                  fontSize: 14,
                  color: '#94a3b8',
                  lineHeight: 1.6,
                  marginBottom: '1rem'
                }}>
                  {demo.description}
                </p>
              )}

              {/* Tags */}
              {demo.tags && demo.tags.length > 0 && (
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  marginTop: '1rem'
                }}>
                  {demo.tags.map(tag => (
                    <span
                      key={tag}
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: '#00B7C3',
                        background: 'rgba(0, 183, 195, 0.1)',
                        padding: '0.25rem 0.75rem',
                        borderRadius: 12,
                        border: '1px solid rgba(0, 183, 195, 0.3)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Play Button */}
              <div style={{
                marginTop: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: hoveredId === demo.id ? '#00B7C3' : '#64748b',
                fontSize: 14,
                fontWeight: 600,
                transition: 'color 0.3s ease'
              }}>
                <span>▶</span>
                <span>Play Presentation</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{
          textAlign: 'center',
          marginTop: '4rem',
          color: '#64748b',
          fontSize: 14
        }}
      >
        <p>Use keyboard navigation once in presentation mode</p>
      </motion.div>
    </div>
  );
};
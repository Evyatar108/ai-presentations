import React from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../../accessibility/ReducedMotion';
import { MetricTile } from '../../components/CoreComponents';
import { SlideComponentWithMetadata } from '../SlideMetadata';
import { SlideContainer, ContentCard } from '../SlideLayouts';
import { typography, gradientBox, circularBadge, layouts } from '../SlideStyles';
import { staggerContainer, tileVariants, arrowVariants, targetVariants, promptVariants, fadeUp } from '../AnimationVariants';
import { ArrowDown, ArrowRight } from '../SlideIcons';

/**
 * Chapter 5: COGS Challenge
 * 6 slides showing the original four-prompt pipeline and its challenges
 */

/**
 * Chapter 5, Slide 1 - Challenge Framing
 * BEFORE metrics → TARGET unified approach
 */
export const Ch5_S1_ChallengeFraming: SlideComponentWithMetadata = () => {
  const { reduced } = useReducedMotion();

  return (
    <SlideContainer maxWidth={900}>
      <motion.div
        variants={staggerContainer(reduced)}
        initial="hidden"
        animate="visible"
      >
        <h1 style={{ ...typography.h1, marginBottom: '2rem' }}>
          Meeting Highlights Cost Optimization
        </h1>
        
        <motion.div style={layouts.flexRow()}>
          <motion.div variants={tileVariants(reduced)}>
            <MetricTile label="LLM Calls" after="4" note="Sequential pipeline" />
          </motion.div>
          <motion.div variants={tileVariants(reduced)}>
            <MetricTile label="Projected GPUs" after="~600" note="High capacity" />
          </motion.div>
          <motion.div variants={tileVariants(reduced)}>
            <MetricTile label="Input Tokens" after="High" note="Verbose format" />
          </motion.div>
        </motion.div>

        <motion.div
          variants={arrowVariants(reduced)}
          style={{ ...layouts.flexRow(), margin: '2rem 0' }}
        >
          <ArrowDown width={60} height={80} />
        </motion.div>

        <motion.div
          variants={targetVariants(reduced)}
          style={{
            ...gradientBox,
            borderRadius: 16,
            boxShadow: reduced ? 'none' : '0 0 40px rgba(0, 183, 195, 0.5)'
          }}
        >
          <h2 style={{ color: '#fff', margin: 0, fontSize: 24 }}>Unified Single Prompt</h2>
          <p style={{ color: '#fff', margin: '0.5rem 0 0', fontSize: 18 }}>
            1 Call • ~200 GPUs • Fewer Tokens
          </p>
        </motion.div>

        <p style={{ ...typography.caption, textAlign: 'center', marginTop: '1.5rem' }}>
          Objective: Reduce COGs without losing highlight quality
        </p>
      </motion.div>
    </SlideContainer>
  );
};

Ch5_S1_ChallengeFraming.metadata = {
  chapter: 5,
  slide: 1,
  title: "Challenge Framing",
  audioSegments: [{
    id: "main",
    audioFilePath: "/audio/c5/s1_segment_01_main.wav",
    narrationText: "Cost efficiency while maintaining quality is critical for scaling meeting highlights globally."
  }]
};

/**
 * Chapter 5, Slide 2 - Four Prompt Chain
 */
export const Ch5_S2_FourPrompts: SlideComponentWithMetadata = () => {
  const { reduced } = useReducedMotion();

  const prompts = [
    { id: 1, label: 'Topic Abstraction' },
    { id: 2, label: 'Extractive Selection' },
    { id: 3, label: 'Quality Ranking' },
    { id: 4, label: 'Narrative Synthesis' }
  ];

  return (
    <SlideContainer maxWidth={1000}>
      <h1 style={typography.h1}>Original Four-Prompt Pipeline</h1>

      <motion.div
        variants={staggerContainer(reduced)}
        initial="hidden"
        animate="visible"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}
      >
        {prompts.map((prompt, idx) => (
          <React.Fragment key={prompt.id}>
            <motion.div
              variants={promptVariants(reduced)}
              style={{
                background: '#1e3a52',
                borderRadius: 12,
                padding: '1.5rem',
                flex: 1,
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}
            >
              <div style={{ color: '#00B7C3', fontSize: 36, fontWeight: 'bold' }}>
                {prompt.id}
              </div>
              <div style={{ color: '#f1f5f9', fontSize: 14, marginTop: '0.5rem' }}>
                {prompt.label}
              </div>
            </motion.div>
            
            {idx < prompts.length - 1 && (
              <motion.div variants={promptVariants(reduced)}>
                <ArrowRight />
              </motion.div>
            )}
          </React.Fragment>
        ))}
      </motion.div>

      <p style={{ ...typography.caption, textAlign: 'center', marginTop: '2rem', fontSize: 16 }}>
        Sequential calls drove high COGs and complexity
      </p>
    </SlideContainer>
  );
};

Ch5_S2_FourPrompts.metadata = {
  chapter: 5,
  slide: 2,
  title: "Four-Prompt Pipeline",
  audioSegments: [{
    id: "main",
    audioFilePath: "/audio/c5/s2_segment_01_main.wav",
    narrationText: "The initial implementation required 4 sequential LLM calls per meeting, creating significant computational costs."
  }]
};

/**
 * Chapter 5, Slide 3 - Topic Abstraction (First Prompt)
 */
export const Ch5_S3_TopicAbstraction: SlideComponentWithMetadata = () => {
  const { reduced } = useReducedMotion();

  return (
    <SlideContainer maxWidth={800}>
      <motion.div variants={fadeUp(reduced)} initial="hidden" animate="visible">
        <div style={layouts.flexRow()}>
          <div style={circularBadge()}>1</div>
          <h1 style={typography.h1}>Prompt 1: Topic Abstraction</h1>
        </div>
      </motion.div>

      <motion.div
        variants={fadeUp(reduced)}
        initial="hidden"
        animate="visible"
        transition={{ delay: reduced ? 0 : 0.2 }}
      >
        <ContentCard>
          <p style={{ ...typography.body, marginTop: 0 }}>
            The first prompt analyzed the transcript to segment it into key topics, identifying one to seven distinct discussion areas within each meeting.
          </p>
          <ul style={{ ...typography.caption, fontSize: 16, lineHeight: 1.8 }}>
            <li>Segments transcript into 1-7 topics</li>
            <li>Generates narration summaries</li>
            <li>Selects video playback anchors</li>
            <li>Categorizes topics by type</li>
            <li>Assesses interest levels</li>
          </ul>
        </ContentCard>
      </motion.div>
    </SlideContainer>
  );
};

Ch5_S3_TopicAbstraction.metadata = {
  chapter: 5,
  slide: 3,
  title: "Prompt 1: Topic Abstraction",
  audioSegments: [{ id: "main", audioFilePath: "/audio/c5/s3_segment_01_main.wav" }]
};

/**
 * Chapter 5, Slide 4 - Extractive Selection (Second Prompt)
 */
export const Ch5_S4_ExtractiveSelection: SlideComponentWithMetadata = () => {
  const { reduced } = useReducedMotion();

  return (
    <SlideContainer maxWidth={800}>
      <motion.div variants={fadeUp(reduced)} initial="hidden" animate="visible">
        <div style={layouts.flexRow()}>
          <div style={circularBadge()}>2</div>
          <h1 style={typography.h1}>Prompt 2: Extractive Selection</h1>
        </div>
      </motion.div>
      
      <motion.div
        variants={fadeUp(reduced)}
        initial="hidden"
        animate="visible"
        transition={{ delay: reduced ? 0 : 0.2 }}
      >
        <ContentCard>
          <p style={{ ...typography.body, marginTop: 0 }}>
            The second prompt extracted engaging verbatim moments from the meeting, selecting up to ten self-contained utterance blocks that captured important feedback, exciting news, or demonstration segments.
          </p>
          <ul style={{ ...typography.caption, fontSize: 16, lineHeight: 1.8 }}>
            <li>Identifies engaging verbatim moments</li>
            <li>Selects up to 10 self-contained blocks</li>
            <li>Filters by content type (feedback/news/demo)</li>
            <li>Ensures coherent boundaries</li>
          </ul>
        </ContentCard>
      </motion.div>
    </SlideContainer>
  );
};

Ch5_S4_ExtractiveSelection.metadata = {
  chapter: 5,
  slide: 4,
  title: "Prompt 2: Extractive Selection",
  audioSegments: [{ id: "main", audioFilePath: "/audio/c5/s4_segment_01_main.wav" }]
};

/**
 * Chapter 5, Slide 5 - Quality Ranking (Third Prompt)
 */
export const Ch5_S5_QualityRanking: SlideComponentWithMetadata = () => {
  const { reduced } = useReducedMotion();

  return (
    <SlideContainer maxWidth={800}>
      <motion.div variants={fadeUp(reduced)} initial="hidden" animate="visible">
        <div style={layouts.flexRow()}>
          <div style={circularBadge()}>3</div>
          <h1 style={typography.h1}>Prompt 3: Quality Ranking</h1>
        </div>
      </motion.div>
      
      <motion.div
        variants={fadeUp(reduced)}
        initial="hidden"
        animate="visible"
        transition={{ delay: reduced ? 0 : 0.2 }}
      >
        <ContentCard>
          <p style={{ ...typography.body, marginTop: 0 }}>
            The third prompt ranked these extracted moments by quality, assessing clarity, intelligibility, self-containment, and overall interest level.
          </p>
          <ul style={{ ...typography.caption, fontSize: 16, lineHeight: 1.8 }}>
            <li>Assesses clarity and intelligibility</li>
            <li>Evaluates self-containment</li>
            <li>Scores interest level (0-100)</li>
            <li>Provides overall quality ranking</li>
          </ul>
        </ContentCard>
      </motion.div>
    </SlideContainer>
  );
};

Ch5_S5_QualityRanking.metadata = {
  chapter: 5,
  slide: 5,
  title: "Prompt 3: Quality Ranking",
  audioSegments: [{ id: "main", audioFilePath: "/audio/c5/s5_segment_01_main.wav" }]
};

/**
 * Chapter 5, Slide 6 - Narrative Synthesis (Fourth Prompt)
 */
export const Ch5_S6_NarrativeSynthesis: SlideComponentWithMetadata = () => {
  const { reduced } = useReducedMotion();

  return (
    <SlideContainer maxWidth={800}>
      <motion.div variants={fadeUp(reduced)} initial="hidden" animate="visible">
        <div style={layouts.flexRow()}>
          <div style={circularBadge()}>4</div>
          <h1 style={typography.h1}>Prompt 4: Narrative Synthesis</h1>
        </div>
      </motion.div>
      
      <motion.div
        variants={fadeUp(reduced)}
        initial="hidden"
        animate="visible"
        transition={{ delay: reduced ? 0 : 0.2 }}
      >
        <ContentCard>
          <p style={{ ...typography.body, marginTop: 0 }}>
            The fourth prompt synthesized everything into a cohesive narrative, rephrasing summaries and creating smooth transitions between abstractive and extractive sections.
          </p>
          <ul style={{ ...typography.caption, fontSize: 16, lineHeight: 1.8 }}>
            <li>Rephrases narrations for story flow</li>
            <li>Creates transition sentences</li>
            <li>Unifies abstractive + extractive sections</li>
            <li>Ensures gender-neutral language</li>
          </ul>
        </ContentCard>
      </motion.div>
    </SlideContainer>
  );
};

Ch5_S6_NarrativeSynthesis.metadata = {
  chapter: 5,
  slide: 6,
  title: "Prompt 4: Narrative Synthesis",
  audioSegments: [{ id: "main", audioFilePath: "/audio/c5/s6_segment_01_main.wav" }]
};
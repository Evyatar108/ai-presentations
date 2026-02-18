import { SlideComponentWithMetadata } from '../../../../framework/slides/SlideMetadata';

/**
 * Example Demo 1 - Chapter 0: Placeholder Slides
 * Simple slides demonstrating the multi-demo architecture
 */

// Slide 1: Title Slide
export const Ex1_S1_Title: SlideComponentWithMetadata = () => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <h1 style={{ fontSize: '4rem', marginBottom: '1rem' }}>Example Demo 1</h1>
      <p style={{ fontSize: '2rem', opacity: 0.9 }}>A Placeholder Demonstration</p>
    </div>
  );
};

Ex1_S1_Title.metadata = {
  chapter: 0,
  slide: 1,
  title: 'Title Slide',
  audioSegments: [
    {
      id: 'title',
      audioFilePath: '/audio/example-demo-1/c0/s1_segment_01_title.wav'
    }
  ]
};

// Slide 2: Content Slide 1
export const Ex1_S2_Content1: SlideComponentWithMetadata = () => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh',
      padding: '80px',
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      color: 'white',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <h2 style={{ fontSize: '3rem', marginBottom: '2rem' }}>Key Features</h2>
      <ul style={{ fontSize: '2rem', lineHeight: '2.5', listStyle: 'none', paddingLeft: 0 }}>
        <li>✓ Multi-demo architecture support</li>
        <li>✓ Lazy loading for optimal performance</li>
        <li>✓ Demo-specific asset organization</li>
        <li>✓ Centralized demo registry</li>
      </ul>
    </div>
  );
};

Ex1_S2_Content1.metadata = {
  chapter: 0,
  slide: 2,
  title: 'Key Features',
  audioSegments: [
    {
      id: 'features',
      audioFilePath: '/audio/example-demo-1/c0/s2_segment_01_features.wav'
    }
  ]
};

// Slide 3: Conclusion
export const Ex1_S3_Conclusion: SlideComponentWithMetadata = () => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      padding: '80px',
      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      color: 'white',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <h2 style={{ fontSize: '3rem', marginBottom: '2rem' }}>Conclusion</h2>
      <p style={{ fontSize: '1.8rem', maxWidth: '800px', textAlign: 'center', lineHeight: '1.6' }}>
        This placeholder demo demonstrates how easy it is to add new presentations
        to the system while maintaining a clean, organized structure.
      </p>
    </div>
  );
};

Ex1_S3_Conclusion.metadata = {
  chapter: 0,
  slide: 3,
  title: 'Conclusion',
  audioSegments: [
    {
      id: 'conclusion',
      audioFilePath: '/audio/example-demo-1/c0/s3_segment_01_conclusion.wav'
    }
  ]
};
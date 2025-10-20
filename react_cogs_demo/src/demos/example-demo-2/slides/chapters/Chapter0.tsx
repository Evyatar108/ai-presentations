import { SlideComponentWithMetadata } from '../../../../slides/SlideMetadata';

/**
 * Example Demo 2 - Chapter 0: Placeholder Slides
 * Alternative styling to showcase variety in the multi-demo system
 */

// Slide 1: Title Slide (Dark theme)
export const Ex2_S1_Title: SlideComponentWithMetadata = () => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      background: '#0f172a',
      color: 'white',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{
        padding: '3rem',
        borderRadius: '20px',
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        border: '2px solid #00B7C3',
        boxShadow: '0 0 40px rgba(0, 183, 195, 0.3)'
      }}>
        <h1 style={{ fontSize: '4rem', marginBottom: '1rem', color: '#00B7C3' }}>Example Demo 2</h1>
        <p style={{ fontSize: '2rem', opacity: 0.8, textAlign: 'center' }}>Alternative Styling Demo</p>
      </div>
    </div>
  );
};

Ex2_S1_Title.metadata = {
  chapter: 0,
  slide: 1,
  title: 'Title Slide',
  audioSegments: [
    {
      id: 'title',
      audioFilePath: '/audio/example-demo-2/c0/s1_segment_01_title.wav'
    }
  ]
};

// Slide 2: Benefits (Card layout)
export const Ex2_S2_Benefits: SlideComponentWithMetadata = () => {
  const cards = [
    { title: 'Flexible', icon: '🎨', desc: 'Customize each demo independently' },
    { title: 'Scalable', icon: '📈', desc: 'Add unlimited demos' },
    { title: 'Organized', icon: '📁', desc: 'Clear file structure' }
  ];

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh',
      padding: '80px',
      background: '#0f172a',
      color: 'white',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <h2 style={{ fontSize: '3rem', marginBottom: '3rem', textAlign: 'center' }}>System Benefits</h2>
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '2rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {cards.map((card, i) => (
          <div key={i} style={{
            background: '#1e293b',
            padding: '2rem',
            borderRadius: '12px',
            textAlign: 'center',
            border: '1px solid #334155'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{card.icon}</div>
            <h3 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', color: '#00B7C3' }}>{card.title}</h3>
            <p style={{ fontSize: '1.2rem', opacity: 0.8 }}>{card.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

Ex2_S2_Benefits.metadata = {
  chapter: 0,
  slide: 2,
  title: 'System Benefits',
  audioSegments: [
    {
      id: 'benefits',
      audioFilePath: '/audio/example-demo-2/c0/s2_segment_01_benefits.wav'
    }
  ]
};

// Slide 3: Thank You
export const Ex2_S3_ThankYou: SlideComponentWithMetadata = () => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      color: 'white',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <h2 style={{ fontSize: '4rem', marginBottom: '2rem', color: '#00B7C3' }}>Thank You!</h2>
      <p style={{ fontSize: '2rem', opacity: 0.8, textAlign: 'center', maxWidth: '700px' }}>
        This concludes Example Demo 2
      </p>
      <div style={{
        marginTop: '3rem',
        fontSize: '1.5rem',
        opacity: 0.6
      }}>
        Ready to create your own demo?
      </div>
    </div>
  );
};

Ex2_S3_ThankYou.metadata = {
  chapter: 0,
  slide: 3,
  title: 'Thank You',
  audioSegments: [
    {
      id: 'thanks',
      audioFilePath: '/audio/example-demo-2/c0/s3_segment_01_thanks.wav'
    }
  ]
};
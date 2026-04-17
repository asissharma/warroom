import React from 'react';

export default function SyllabusSkeleton() {
  return (
    <div className="animate-fade-slide" style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '20px 0' }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <div 
          key={i} 
          style={{ 
            height: 72, 
            background: '#F4F4F5', 
            borderRadius: 12, 
            animation: 'pulse 1.5s infinite ease-in-out',
            opacity: 1 - (i * 0.15) // fade out the lower ones
          }} 
        />
      ))}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0% { background: #F4F4F5; }
          50% { background: #EBEBEB; }
          100% { background: #F4F4F5; }
        }
      `}} />
    </div>
  );
}

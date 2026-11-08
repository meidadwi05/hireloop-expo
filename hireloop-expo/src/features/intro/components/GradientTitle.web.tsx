import React from 'react';

type GradientTitleProps = {
  children: string;
  fontSize: number;
  lineHeight: number;
};

export function GradientTitle({children, fontSize, lineHeight}: GradientTitleProps) {
  return (
    <span
      data-testid="gradient-intro-title"
      style={{
        backgroundClip: 'text',
        backgroundImage: 'linear-gradient(90deg, #0051FD 0%, #00DAFD 100%)',
        color: '#0051FD',
        display: 'block',
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize,
        lineHeight: `${lineHeight}px`,
        textAlign: 'left',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        whiteSpace: 'pre-line',
        width: '100%',
      }}
    >
      {children}
    </span>
  );
}

import React from 'react';

export function GradientWelcomeText() {
  return (
    <span
      data-testid="login-welcome-gradient"
      style={{
        backgroundClip: 'text',
        backgroundImage: 'linear-gradient(90deg, #0051FD 0%, #00DAFD 100%)',
        color: '#0051FD',
        display: 'inline-block',
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 22,
        letterSpacing: -0.5,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}
    >
      Selamat Datang!
    </span>
  );
}

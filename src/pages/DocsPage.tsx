import React, { useEffect } from 'react';

export default function DocsPage() {
  useEffect(() => {
    window.location.replace('/developer-docs.html');
  }, []);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '12px' }}>
      Laddar dokumentation…
    </div>
  );
}

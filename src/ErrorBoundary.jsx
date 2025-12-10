import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Optional: log to console
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          background: '#1a1a2e',
          color: '#fff',
          padding: 24,
          borderRadius: 12,
        }}>
          <h2 style={{ color: '#ff6b6b' }}>Something went wrong.</h2>
          <p style={{ color: '#b8b8d0' }}>Please refresh the page. If the issue persists, let us know the error message.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

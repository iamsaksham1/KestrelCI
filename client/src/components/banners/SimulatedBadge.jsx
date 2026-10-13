import React from 'react';
import SourceTag from './SourceTag.jsx';

export function SimulatedBadge({ className = '', source = 'simulated' }) {
  return <SourceTag source={source} className={className} />;
}

export default SimulatedBadge;

// src/components/Dashboard.tsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FreeDashboard } from './FreeDashboard';
import { PlusDashboard } from './PlusDashboard';

export function Dashboard() {
  const { isSubscribed } = useAuth();
  
  return isSubscribed ? <PlusDashboard /> : <FreeDashboard />;
}
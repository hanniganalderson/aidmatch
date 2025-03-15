// src/components/Dashboard.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { FreeDashboard } from './FreeDashboard';
import { PlusDashboard } from './PlusDashboard'; // Import PlusDashboard instead of PremiumDashboard

export function Dashboard() {
  const { user } = useAuth();
  const { isSubscribed } = useSubscription();
  const navigate = useNavigate();
  
  // Redirect to sign in if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/signin');
    }
  }, [user, navigate]);
  
  if (!user) {
    return null; // Or a loading spinner
  }
  
  // Render the appropriate dashboard based on subscription status
  return isSubscribed ? <PlusDashboard /> : <FreeDashboard />;
}

export default Dashboard;
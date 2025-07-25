import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';

// Import components
import ForeclosureQuestionnaire from './components/ForeclosureQuestionnaire';

// Placeholder components for routes we'll implement later
const Login = () => <div>Login Page</div>;
const AdminDashboard = () => <div>Admin Dashboard</div>;
const ResponseDetails = () => <div>Response Details</div>;
const NotFound = () => <div>404 - Page Not Found</div>;

// Auth context type
type AuthContextType = {
  session: any;
  user: any;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

function App() {
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Auth functions
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  // Auth functions and state are used directly in the component
  // No need for a separate context value variable

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<ForeclosureQuestionnaire />} />
        <Route path="/login" element={<Login />} />
        
        {/* Protected admin routes */}
        <Route 
          path="/admin/dashboard" 
          element={user ? <AdminDashboard /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/admin/dashboard/response/:id" 
          element={user ? <ResponseDetails /> : <Navigate to="/login" />} 
        />
        
        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
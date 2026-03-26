import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import DailyBrief from './pages/DailyBrief';
import Timeline from './pages/Timeline';
import Saved from './pages/Saved';
import NotFound from './pages/NotFound';
import Layout from './components/layout/Layout';
import { ToastContainer } from './components/ui/ToastContainer';
import { KeyboardShortcuts } from './components/ui/KeyboardShortcuts';
import { KeyboardShortcutsModal } from './components/ui/KeyboardShortcutsModal';
import { WelcomeModal } from './components/ui/WelcomeModal';
import ErrorBoundary from './components/ui/ErrorBoundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Global keyboard navigation
function GlobalKeyboardNav() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      // Don't trigger if typing in input/textarea
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      // Navigation shortcuts (G + key)
      if (e.key === 'g' || e.key === 'G') {
        const nextKey = new Promise<string>((resolve) => {
          const handler = (e2: KeyboardEvent) => {
            window.removeEventListener('keydown', handler);
            resolve(e2.key.toLowerCase());
          };
          window.addEventListener('keydown', handler);
          setTimeout(() => {
            window.removeEventListener('keydown', handler);
            resolve('');
          }, 1000);
        });

        nextKey.then((key) => {
          switch (key) {
            case 'h': navigate('/'); break;
            case 'c': navigate('/chat'); break;
            case 'b': navigate('/brief'); break;
            case 't': navigate('/timeline'); break;
            case 's': navigate('/saved'); break;
          }
        });
      }

      // Quick actions
      if (e.key === 'r' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        window.location.reload();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [navigate]);

  return null;
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <GlobalKeyboardNav />
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/brief" element={<DailyBrief />} />
              <Route path="/timeline" element={<Timeline />} />
              <Route path="/saved" element={<Saved />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
          <ToastContainer />
          <KeyboardShortcuts />
          <KeyboardShortcutsModal />
          <WelcomeModal />
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;

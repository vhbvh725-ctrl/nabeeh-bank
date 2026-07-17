import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { useAuthInterceptor } from './hooks/use-auth-interceptor';

import Splash      from './pages/splash';
import Login       from './pages/login';
import Register    from './pages/register';
import DashboardHome from './pages/dashboard/index';
import Transactions  from './pages/dashboard/transactions';
import Cards         from './pages/dashboard/cards';
import AIChat        from './pages/dashboard/ai';
import Profile       from './pages/dashboard/profile';
import Contracts     from './pages/dashboard/contracts';
import Banking       from './pages/dashboard/banking';
import NotFound    from './pages/not-found';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, refetchOnWindowFocus: false },
  },
});

function Router() {
  useAuthInterceptor();
  return (
    <Switch>
      <Route path="/"                      component={Splash}        />
      <Route path="/login"                 component={Login}         />
      <Route path="/register"              component={Register}      />
      <Route path="/dashboard"             component={DashboardHome} />
      <Route path="/dashboard/transactions"component={Transactions}  />
      <Route path="/dashboard/banking"     component={Banking}       />
      <Route path="/dashboard/cards"       component={Cards}         />
      <Route path="/dashboard/ai"          component={AIChat}        />
      <Route path="/dashboard/profile"     component={Profile}       />
      <Route path="/dashboard/contracts"   component={Contracts}     />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster
          theme="dark"
          position="bottom-center"
          toastOptions={{
            style: {
              background: 'rgba(12,11,8,0.97)',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: '16px',
              color: '#fff',
              backdropFilter: 'blur(20px)',
              fontFamily: 'Outfit, sans-serif',
              fontSize: '13px',
              boxShadow: '0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
            },
            classNames: {
              success: 'border-emerald-500/25 !border',
              error:   'border-red-500/25 !border',
              info:    'border-primary/25 !border',
            },
          }}
        />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { useAuthInterceptor } from './hooks/use-auth-interceptor';

import Splash from './pages/splash';
import Login from './pages/login';
import Register from './pages/register';
import DashboardHome from './pages/dashboard/index';
import Transactions from './pages/dashboard/transactions';
import Cards from './pages/dashboard/cards';
import AIChat from './pages/dashboard/ai';
import Profile from './pages/dashboard/profile';
import Contracts from './pages/dashboard/contracts';
import NotFound from './pages/not-found';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  useAuthInterceptor();
  
  return (
    <Switch>
      <Route path="/" component={Splash} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      <Route path="/dashboard" component={DashboardHome} />
      <Route path="/dashboard/transactions" component={Transactions} />
      <Route path="/dashboard/cards" component={Cards} />
      <Route path="/dashboard/ai" component={AIChat} />
      <Route path="/dashboard/profile" component={Profile} />
      <Route path="/dashboard/contracts" component={Contracts} />
      
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
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

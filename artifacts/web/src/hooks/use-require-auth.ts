import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useGetMe } from '@workspace/api-client-react';

export function useRequireAuth() {
  const [, setLocation] = useLocation();
  const { data: user, isError, isLoading } = useGetMe();

  useEffect(() => {
    if (isError) {
      setLocation('/login');
    }
  }, [isError, setLocation]);

  return { user, isLoading, isError };
}

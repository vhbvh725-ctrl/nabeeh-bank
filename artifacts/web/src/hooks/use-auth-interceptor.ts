import { useLayoutEffect } from 'react';
import { setAuthTokenGetter } from '@workspace/api-client-react';

export function useAuthInterceptor() {
  useLayoutEffect(() => {
    setAuthTokenGetter(() => {
      return localStorage.getItem('nabeeh_token');
    });
  }, []);
}

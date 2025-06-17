import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });

  console.log('Auth state:', { user, isLoading, error, isAuthenticated: !!user });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}

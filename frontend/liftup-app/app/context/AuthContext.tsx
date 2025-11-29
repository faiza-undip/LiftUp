import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { useRouter, useSegments } from "expo-router";

import { supabase } from "../lib/supabase";

type Session = Awaited<
  ReturnType<typeof supabase.auth.getSession>
>["data"]["session"];

interface AuthCtx {
  session: Session | null;
  loading: boolean;
}

const AuthContext = createContext<AuthCtx>({ session: null, loading: true });
export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (session?.access_token) {
        await SecureStore.setItemAsync("access_token", session.access_token);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.access_token) {
        await SecureStore.setItemAsync("access_token", session.access_token);
      } else {
        await SecureStore.deleteItemAsync("access_token");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Routing guard
  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!session) {
      // not logged in → force into auth group
      if (!inAuthGroup) router.replace("/(auth)/login");
      return;
    }

    // logged in → decide between onboarding or tabs
    (async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", session.user.id)
        .maybeSingle();

      if (!profile) {
        // no profile yet → force onboarding
        if (segments[0] !== "onboarding") {
          router.replace("/onboarding");
        }
      } else {
        // profile done → main tabs
        if (inAuthGroup || segments[0] === "onboarding") {
          router.replace("/(tabs)");
        }
      }
    })();
  }, [session, loading, segments]);

  return (
    <AuthContext.Provider value={{ session, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

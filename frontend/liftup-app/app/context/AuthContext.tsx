import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { useRouter, useSegments } from "expo-router";
import type { Session } from "@supabase/supabase-js";

import { supabase } from "../lib/supabase";

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
      console.log("Auth state changed:", _event);
      setSession(session);
      if (session?.access_token) {
        await SecureStore.setItemAsync("access_token", session.access_token);
      } else {
        await SecureStore.deleteItemAsync("access_token");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Routing guard - SIMPLIFIED
  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inOnboarding = segments[0] === "onboarding";
    const inTabs = segments[0] === "(tabs)";

    console.log("=== ROUTING GUARD ===");
    console.log("Session exists:", !!session);
    console.log("Current segments:", segments);

    (async () => {
      if (!session) {
        console.log("No session, checking auth group");
        if (!inAuthGroup) {
          console.log("Not in auth group, redirecting to login");
          router.replace("/(auth)/login");
        }
        return;
      }

      // If we're already in onboarding or tabs, don't redirect
      if (inOnboarding || inTabs) {
        console.log("Already in correct location, skipping check");
        return;
      }

      console.log("Checking profile for user:", session.user.id);
      
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", session.user.id)
        .maybeSingle();

      console.log("Profile data:", profile);
      console.log("Profile error:", error);

      if (!profile) {
        console.log("No profile found, redirecting to onboarding");
        router.replace("/onboarding");
      } else {
        console.log("Profile exists, redirecting to tabs");
        router.replace("/(tabs)");
      }
    })();
  }, [session, loading]);

  return (
    <AuthContext.Provider value={{ session, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

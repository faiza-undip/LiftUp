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
    // Restore session on app startup
    const restoreSession = async () => {
      try {
        // First, try to get the stored access token
        const storedToken = await SecureStore.getItemAsync("access_token");

        if (storedToken) {
          console.log("Found stored token, restoring session");
          // Set the session using the stored token
          const { data, error } = await supabase.auth.setSession({
            access_token: storedToken,
            refresh_token:
              (await SecureStore.getItemAsync("refresh_token")) || "",
          });

          if (error) {
            console.error("Error restoring session:", error);
            // Clear invalid tokens
            await SecureStore.deleteItemAsync("access_token");
            await SecureStore.deleteItemAsync("refresh_token");
          } else {
            setSession(data.session);
          }
        } else {
          // No stored token, check if there's an active session
          const {
            data: { session },
          } = await supabase.auth.getSession();
          setSession(session);
        }
      } catch (error) {
        console.error("Error in restoreSession:", error);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("Auth state changed:", _event);
      setSession(session);

      if (session?.access_token && session?.refresh_token) {
        // Store both tokens
        await SecureStore.setItemAsync("access_token", session.access_token);
        await SecureStore.setItemAsync("refresh_token", session.refresh_token);
      } else {
        // Clear tokens on sign out
        await SecureStore.deleteItemAsync("access_token");
        await SecureStore.deleteItemAsync("refresh_token");
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

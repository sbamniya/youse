import {
  QueryClient,
  QueryClientProvider,
  focusManager,
  onlineManager,
} from "@tanstack/react-query";
import * as Network from "expo-network";
import { useEffect } from "react";
import { AppState, AppStateStatus, Platform } from "react-native";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Shared-space changes can happen while the app is backgrounded. Refresh
      // every active query when the app/window receives focus, even if its
      // normal stale time has not elapsed yet.
      refetchOnWindowFocus: "always",
    },
  },
});

// Expo Router renders web routes in Node, where expo-network cannot access
// `window`. TanStack Query installs its own browser listeners on web.
if (Platform.OS !== "web") {
  onlineManager.setEventListener((setOnline) => {
    let initialized = false;

    const eventSubscription = Network.addNetworkStateListener((state) => {
      initialized = true;
      setOnline(!!state.isConnected);
    });

    Network.getNetworkStateAsync()
      .then((state) => {
        if (!initialized) {
          setOnline(!!state.isConnected);
        }
      })
      .catch(() => {
        // getNetworkStateAsync can reject on some platforms/SDK versions
      });

    return eventSubscription.remove;
  });
}

function onAppStateChange(status: AppStateStatus) {
  if (Platform.OS !== "web") {
    focusManager.setFocused(status === "active");
  }
}
const QueryProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  useEffect(() => {
    onAppStateChange(AppState.currentState);
    const subscription = AppState.addEventListener("change", onAppStateChange);

    return () => subscription.remove();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export default QueryProvider;

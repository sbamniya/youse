import {
    QueryClient,
    QueryClientProvider,
    focusManager,
    onlineManager,
} from "@tanstack/react-query";
import * as Network from "expo-network";
import { useEffect } from "react";
import { AppState, AppStateStatus, Platform } from "react-native";

const queryClient = new QueryClient();

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

function onAppStateChange(status: AppStateStatus) {
  if (Platform.OS !== "web") {
    focusManager.setFocused(status === "active");
  }
}
const QueryProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  useEffect(() => {
    const subscription = AppState.addEventListener("change", onAppStateChange);

    return () => subscription.remove();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export default QueryProvider;

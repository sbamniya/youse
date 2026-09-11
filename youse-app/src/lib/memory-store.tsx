import { createContext, type ReactNode, useContext, useMemo, useState } from "react";

import { memories as seedMemories, type Memory } from "@/lib/memories";

type MemoryStore = {
  memories: Memory[];
  addPhoto: (memoryId: string, imageUri: string, caption?: string) => void;
};

const MemoryStoreContext = createContext<MemoryStore | null>(null);

function MemoryProvider({ children }: { children: ReactNode }) {
  const [memories, setMemories] = useState(seedMemories);
  const value = useMemo<MemoryStore>(
    () => ({
      memories,
      addPhoto: (memoryId, imageUri, caption) => {
        setMemories((current) =>
          current.map((memory) =>
            memory.id === memoryId
              ? {
                  ...memory,
                  photos: [
                    ...memory.photos,
                    {
                      id: `photo-${Date.now()}`,
                      image: { uri: imageUri },
                      caption: caption?.trim() || undefined,
                    },
                  ],
                }
              : memory,
          ),
        );
      },
    }),
    [memories],
  );
  return <MemoryStoreContext.Provider value={value}>{children}</MemoryStoreContext.Provider>;
}

function useMemories() {
  const store = useContext(MemoryStoreContext);
  if (!store) throw new Error("useMemories must be used within MemoryProvider");
  return store;
}

export { MemoryProvider, useMemories };

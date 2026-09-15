import type { ReactNode } from "react";

type PlatformChoiceGateProps = {
  children: ReactNode;
};

function PlatformChoiceGate({ children }: PlatformChoiceGateProps) {
  return children;
}

export { PlatformChoiceGate };

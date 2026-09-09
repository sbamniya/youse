import * as React from "react";
import { Text as NativeText } from "react-native";

import { cn } from "@/lib/utils";

const TextClassContext = React.createContext<string | undefined>(undefined);

function Text({ className, ...props }: React.ComponentProps<typeof NativeText>) {
  const parentClassName = React.useContext(TextClassContext);

  return (
    <NativeText
      className={cn("text-foreground text-base", parentClassName, className)}
      {...props}
    />
  );
}

export { Text, TextClassContext };

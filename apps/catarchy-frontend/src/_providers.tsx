import {
  EnvProvider,
  FirebaseProvider,
  KeyboardProvider,
  TanstackQueryProvider,
} from "./features/common";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <EnvProvider>
      <FirebaseProvider>
        <TanstackQueryProvider>
          <KeyboardProvider>{children}</KeyboardProvider>
        </TanstackQueryProvider>
      </FirebaseProvider>
    </EnvProvider>
  );
}

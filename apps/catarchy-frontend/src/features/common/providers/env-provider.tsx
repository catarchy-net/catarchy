import { envResult } from "../lib/env";

export function EnvProvider({ children }: { children: React.ReactNode }) {
  if (!envResult.success) {
    console.error("Environment variable validation failed:", envResult.errors);
    return (
      <div>
        <p>Invalid environment variables</p>
      </div>
    );
  }

  return <>{children}</>;
}

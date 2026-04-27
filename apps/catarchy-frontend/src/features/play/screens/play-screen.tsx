import { LogoText, Scaffold } from "@/features/common";
import { useMe } from "@/features/user/services/useMe";
import { Interface } from "../components/interface";

export function PlayScreen() {
  const { data } = useMe();
  return (
    <Scaffold className="bg-gradient-pattern-cat">
      <Scaffold.Header title={<LogoText />} className="border-none" />
      <Scaffold.Body className="justify-center-safe">
        <div className="p-4 flex flex-col gap-4">
          <div className="flex justify-center">
            <Interface />
          </div>
        </div>
      </Scaffold.Body>
    </Scaffold>
  );
}

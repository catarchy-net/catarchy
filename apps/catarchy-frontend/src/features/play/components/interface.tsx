import { Text, useToast } from "@/features/common";
import { Room } from "./room";

export function Interface() {
  const toast = useToast();
  return (
    <div className="border w-[288px] h-59 bg-white">
      <div className="border-b h-9 flex justify-between">
        <div className="flex items-center">
          <div className="size-9 flex justify-center items-center border-r">
            😊
          </div>
          {/* <div className="px-2 h-9 border-r flex justify-center items-center">
            00:00:00
          </div> */}
        </div>
        <button
          onClick={() => toast.push("Settings coming soon!")}
          className="bg-black size-9 text-white flex justify-center items-center hover:bg-white hover:text-black border-l border-b border-black"
        >
          <Text>🔧</Text>
        </button>
      </div>
      <Room />
    </div>
  );
}

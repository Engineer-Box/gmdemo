import { Copy } from "@/components/copy";
import { Text } from "@/components/text";

export const CopyMatchId = ({ matchId }: { matchId: number }) => (
  <div className="flex gap-2 items-center">
    <Text className="text-brand-white">
      Match ID: <span className="font- ml-2"> {matchId}</span>
    </Text>
    <Copy value={matchId.toString()} />
  </div>
);

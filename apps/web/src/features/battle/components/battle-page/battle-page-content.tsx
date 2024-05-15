import { AuthenticatedUser, useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";

import { useEffect, useMemo } from "react";

import { BattlePageHeader } from "./battle-page-header";
import { ErrorPage } from "@/components/error-page";
import { useRouter } from "next/router";
import { MatchMetaSection } from "./match-meta-section";
import { GetBattleResponse, getBattle } from "../../service/get-battle";
import { TeamSelectionTablesSection } from "./team-selection-tables-section";

type BattlePageContentProps = {
  battleId: number;
};
export const BattlePageContent = ({ battleId }: BattlePageContentProps) => {
  const { user, authStatus, signIn } = useAuth();
  const router = useRouter();
  const { data: battle, isError: battleIsError } = useQuery(
    getBattle.queryKey(battleId),
    () => getBattle(battleId),
    {
      retry: false,
      enabled: !!battleId && authStatus === "authenticated",
    }
  );

  if (authStatus === "unauthenticated") {
    signIn();
  }

  useEffect(() => {
    if (battleIsError) {
      router.replace("/500");
    } else if (battle?.data.attributes.is_cancelled) {
      router.replace("/404");
    }
  }, [battleIsError, battle]);

  return (
    <div>
      <BattlePageHeader battle={battle?.data} user={user ?? undefined} />
      <MatchMetaSection battle={battle?.data} />
      <TeamSelectionTablesSection battle={battle?.data} />
    </div>
  );
};

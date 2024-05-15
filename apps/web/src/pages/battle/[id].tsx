import { BattlePageContent } from "@/features/battle/components/battle-page/battle-page-content";
import { useRouter } from "next/router";

export const getServerSideProps = async () => {
  return {
    props: {
      increasedPageWidth: true,
    },
  };
};

export default function BattleIdPage() {
  const router = useRouter();
  const { id } = router.query;
  const battleId =
    typeof id === "string" ? parseInt(id.replace(/\D/g, "")) : null;

  return (
    <div className="relative z-0">
      <BattlePageContent battleId={battleId!} />
    </div>
  );
}

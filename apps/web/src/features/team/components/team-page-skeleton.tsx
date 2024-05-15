import { EditableImagePageSectionSkeleton } from "@/components/editable-image-page-section";
import { TeamMembersTableSkeleton } from "./team-members-table";

export const TeamPageSkeleton = () => {
  return (
    <div>
      <EditableImagePageSectionSkeleton />
      <TeamMembersTableSkeleton />
    </div>
  );
};

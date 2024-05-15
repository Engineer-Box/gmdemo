import { Button } from "@/components/button";
import { TeamMemberEdit } from "../team-member-edit";

type ContentProps = Parameters<typeof TeamMemberEdit>[0];

type FooterProps = {
  onSubmit: () => void;
  setIsFirstStep: React.Dispatch<React.SetStateAction<boolean>>;
};

const Content = (props: ContentProps) => {
  return <TeamMemberEdit {...props} />;
};

const Footer = ({ setIsFirstStep, onSubmit }: FooterProps) => {
  return (
    <>
      <Button
        variant="secondary"
        title="Back"
        onClick={() => {
          setIsFirstStep(true);
        }}
      />
      <Button variant="primary" title="Create" onClick={onSubmit} />
    </>
  );
};

export const InviteTeamModalStep = {
  Content,
  Footer,
};

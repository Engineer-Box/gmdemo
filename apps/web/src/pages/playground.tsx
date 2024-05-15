import { ProfileStatBox } from "@/features/profile/components/profile-page/profile-stat-box";

export const getServerSideProps = async () => {
  return {
    props: {
      hideSidebar: false,
    },
  };
};

import React from "react";

export default function Page() {
  return <div></div>;
}

import { ErrorPage, GeneralErrorPage } from "@/components/error-page";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";
import Link from "next/link";
import { FaCalendarAlt, FaTrophy } from "react-icons/fa";

export default function ComingSoonPage() {
  return (
    <GeneralErrorPage title="Coming Soon!" icon={<FaTrophy />}>
      <Text>
        We&apos;re going to be releasing tournaments soon, stay up to date by
        following us on{" "}
        <Link href="https://twitter.com/gamerlyapp" target="_blank">
          <span className="underline underline-offset-2">Twitter</span>
        </Link>
      </Text>
    </GeneralErrorPage>
  );
}

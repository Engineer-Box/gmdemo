import { ErrorPage } from "@/components/error-page";

export default function Custom429() {
  return <ErrorPage type="rateLimited" />;
}

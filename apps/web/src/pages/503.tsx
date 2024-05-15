import { ErrorPage } from "@/components/error-page";

export default function Custom503() {
  return <ErrorPage type="siteMaintenance" />;
}

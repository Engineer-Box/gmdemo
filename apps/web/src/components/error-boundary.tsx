import { Component, ErrorInfo, ReactNode } from "react";
import { ErrorPage, ErrorPageProps } from "./error-page";
import { StrapiError } from "@/utils/strapi-error";
import Router from "next/router";

// TODO: Remove this as and replace with more useful error boundaries for both the sidebar and page component
interface Props {
  children?: ReactNode;
}

interface State {
  hasError?: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: undefined,
  };

  public static getDerivedStateFromError(error: unknown): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {}

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-screen h-screen bg-brand-navy">
          <div>
            <ErrorPage type="somethingWentWrong" />
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

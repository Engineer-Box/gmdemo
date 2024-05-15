export class StrapiError {
  data: null = null;
  error: {
    status: number;
    name: string;
    message: string;
    details: Record<string, unknown>;
  };

  constructor(
    status: StrapiError["error"]["status"],
    details?: {
      name?: StrapiError["error"]["name"];
      message?: StrapiError["error"]["message"];
      details?: StrapiError["error"]["details"];
    }
  ) {
    this.error = {
      status: status,
      name: details?.name ?? "",
      message: details?.message ?? "",
      details: details?.details ?? {},
    };
  }

  static isStrapiError(error: unknown): error is StrapiError {
    try {
      const e = error as StrapiError;
      const hasData = e.data;
      const hasStatus = e.error?.status !== undefined;
      const hasName = e.error?.name !== undefined;
      const hasMessage = e.error?.message !== undefined;
      const hasDetails = e.error?.details !== undefined;
      return !hasData && hasStatus && hasName && hasMessage && hasDetails;
    } catch (error) {
      return false;
    }
  }
}

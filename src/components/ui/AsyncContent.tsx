import type { ReactNode } from "react";
import type { AsyncData } from "../../hooks/useAsyncData";

interface AsyncContentProps<T> {
  state: AsyncData<T>;
  isEmpty: (data: NonNullable<T>) => boolean;
  emptyMessage: string;
  loadingLabel?: string;
  children: (data: NonNullable<T>) => ReactNode;
}

export function AsyncContent<T>({ state, isEmpty, emptyMessage, loadingLabel = "Loading...", children }: AsyncContentProps<T>) {
  if (state.error) {
    return (
      <div className="state state--error" role="alert">
        <p>{state.error}</p>
        <button type="button" className="btn btn--ghost" onClick={state.reload}>
          Try again
        </button>
      </div>
    );
  }

  if (state.isLoading && state.data === null) {
    return (
      <div className="state state--loading" role="status" aria-live="polite">
        <span className="state__pulse" aria-hidden="true" />
        <p>{loadingLabel}</p>
      </div>
    );
  }

  const data = state.data;
  if (data == null || isEmpty(data)) {
    return <p className="state state--empty">{emptyMessage}</p>;
  }

  return <>{children(data)}</>;
}

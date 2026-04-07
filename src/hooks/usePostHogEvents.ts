// Demo stub — no analytics in the static demo site.
export function usePostHogEvents() {
  return {
    captureEvent: (_eventName: string, _properties?: Record<string, any>) => {},
  };
}

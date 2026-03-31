export function normalizePollOptions(options?: string[]) {
  return (options ?? []).map((option) => option.trim()).filter(Boolean);
}

export function getRejectedErrorMessages(
  results: PromiseSettledResult<unknown>[],
  fallback = 'Unknown error'
) {
  return results
    .filter(
      (result): result is PromiseRejectedResult => result.status === 'rejected'
    )
    .map((result) =>
      result.reason instanceof Error ? result.reason.message : fallback
    );
}

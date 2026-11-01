export function toServiceError(message: string, error: { message: string }): Error {
  console.error(message, error);
  return new Error(message);
}

export function sortByDisplayOrder<T extends { display_order: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.display_order - b.display_order);
}

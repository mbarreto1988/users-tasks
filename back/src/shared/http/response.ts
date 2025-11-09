export function successResponse<T>(data: T | T[]) {
  if (Array.isArray(data)) {
    return {
      count: data.length,
      data
    };
  }

  return {
    count: data ? 1 : 0,
    data
  };
}

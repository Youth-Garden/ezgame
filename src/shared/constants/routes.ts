export enum RouteEnum {
  LOBBY = "/",
  CARO_PLAY = "/play/caro/:code",
}

export function formatUrl(
  route: RouteEnum | string,
  params: Record<string, string | number> = {},
  queryParams: Record<string, string | number | undefined> = {}
): string {
  let url: string = route;

  // Replace route params :key
  Object.entries(params).forEach(([key, value]) => {
    url = url.replace(`:${key}`, encodeURIComponent(String(value)));
  });

  // Append query params ?key=value
  const queryEntries = Object.entries(queryParams).filter(
    ([, value]) => value !== undefined
  );

  if (queryEntries.length > 0) {
    const searchParams = new URLSearchParams();
    queryEntries.forEach(([key, value]) => {
      searchParams.set(key, String(value));
    });
    url += `?${searchParams.toString()}`;
  }

  return url;
}

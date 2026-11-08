import { GameType } from "@/shared/types/room";

/**
 * Centralized Route Enumeration for all frontend pages in EzGame
 */
export enum RouteEnum {
  LOBBY = "/",
  GAME_PLAY = "/play/:game/:code",
  CARO_PLAY = "/play/caro/:code",
  BIDA_PLAY = "/play/bida/:code",
}

/**
 * Centralized API Route Enumeration for backend endpoints
 */
export enum ApiRouteEnum {
  ROOMS = "/api/rooms",
}

/**
 * Dynamic helper to generate the specific Game Play route by GameType
 */
export function getGamePlayRoute(gameType: GameType | string): RouteEnum {
  switch (gameType) {
    case GameType.BIDA:
      return RouteEnum.BIDA_PLAY;
    case GameType.CARO:
    default:
      return RouteEnum.CARO_PLAY;
  }
}

/**
 * Formats a route template by replacing path parameters and appending query strings.
 *
 * @param route The base route pattern from RouteEnum (e.g. RouteEnum.CARO_PLAY)
 * @param params Dynamic path variables to replace (e.g. { code: "6JUZ4J" })
 * @param queryParams Optional query string params (e.g. { lang: "ja" })
 */
export function formatUrl(
  route: RouteEnum | ApiRouteEnum | string,
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

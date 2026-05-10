export function getBackgroundMusicForPathname(pathname: string): string {
  if (pathname === "/battle") {
    return "battle";
  }

  if (pathname === "/devil-deal" || pathname === "/bonus-upgrade") {
    return "shop";
  }

  return "title";
}

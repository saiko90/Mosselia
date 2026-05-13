import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: [
    /*
     * Intercepte toutes les routes sauf :
     * - _next/static, _next/image  (assets Next.js)
     * - api/                        (routes API)
     * - fichiers avec extension     (images, fonts, etc.)
     * - fichiers PWA                (sw.js, workbox-*, manifest.*, ~offline)
     */
    "/((?!api|_next/static|_next/image|_next/webpack-hmr|favicon\\.ico|icons/.*|sw\\.js|workbox-[^/]*\\.js|manifest\\.webmanifest|manifest\\.json|~offline).*)",
  ],
};

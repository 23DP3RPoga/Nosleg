/**
 * Saknes maršruts: globālie `<meta>`, HTML čaula ar provideriem (tēma → valoda → auth).
 * `DocumentLang` atjauno `<html lang>` pēc lietotāja izvēles.
 */
import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/auth";
import { DocumentLang, I18nProvider, useI18n } from "@/i18n";
import { ThemeProvider } from "@/theme";

import appCss from "../styles.css?url";

/** Maršruts neatradās — teksti no i18n, lai atbilstu LV/EN. */
function NotFoundComponent() {
  const { t } = useI18n();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">{t("notfound.title")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t("notfound.desc")}</p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t("notfound.home")}
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Vitalo — Tava veselība, vienuviet" },
      {
        name: "description",
        content:
          "Personīgā veselības centrāle: medicīniskā vēsture, atgādinājumi un vizualizācijas vienuviet.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "Vitalo — Tava veselība, vienuviet" },
      { name: "twitter:title", content: "Vitalo — Tava veselība, vienuviet" },
      { name: "description", content: "Health Hub Connect is a web application for personal health data management and tracking." },
      { property: "og:description", content: "Health Hub Connect is a web application for personal health data management and tracking." },
      { name: "twitter:description", content: "Health Hub Connect is a web application for personal health data management and tracking." },
    ],
    links: [
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&display=swap",
      },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

/** Pilna HTML lapa: provideru secība nosaka kontekstu pieejamību bērnu maršrutos. */
function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <I18nProvider>
            <DocumentLang />
            <AuthProvider>
              {children}
            </AuthProvider>
          </I18nProvider>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}

/** Iekšējās lapas — šeit tikai `<Outlet />`. */
function RootComponent() {
  return <Outlet />;
}

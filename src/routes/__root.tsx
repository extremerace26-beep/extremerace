import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Extreme Race — Você contra seus próprios limites" },
      {
        name: "description",
        content:
          "8 km. 30 obstáculos. 1 missão. A corrida de obstáculos mais extrema do Brasil. Inscreva-se agora.",
      },
      { property: "og:title", content: "Extreme Race — Você contra seus próprios limites" },
      {
        property: "og:description",
        content:
          "8 km. 30 obstáculos. 1 missão. A corrida de obstáculos mais extrema do Brasil.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@400;700;800;900&family=Inter:wght@400;500;600;700;900&family=JetBrains+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
            {children}
            <a
              href="https://wa.me/558699515009"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp 86 9951-5009"
              className="fixed right-6 bottom-6 z-50 w-14 h-14 bg-[#25D366] hover:bg-[#1ebe5a] text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                <path d="M20.52 3.48A11.91 11.91 0 0 0 12.03.5C6.01.5 1.03 5.48 1.03 11.5c0 2.03.53 3.92 1.45 5.6L.5 23.5l6.7-1.75c1.6.88 3.4 1.35 5.33 1.35 6.02 0 11-4.98 11-11 0-3.03-1.18-5.84-3.06-7.6zM12.03 21.5c-1.7 0-3.36-.45-4.8-1.3l-.35-.21-4.02 1.05 1.06-3.9-.23-.39A8.42 8.42 0 0 1 3.03 11.5c0-4.7 3.8-8.5 8-8.5 2.14 0 4.15.83 5.66 2.34a7.98 7.98 0 0 1 2.34 5.66c0 4.7-3.8 8.5-8 8.5z" />
                <path d="M17.02 14.43c-.29-.15-1.72-.85-1.98-.95-.26-.1-.45-.15-.64.15s-.73.95-.9 1.14c-.16.19-.32.21-.61.07-.29-.15-1.22-.45-2.33-1.44-.86-.76-1.44-1.7-1.61-1.99-.17-.29-.02-.45.13-.6.13-.13.29-.33.44-.5.15-.16.2-.27.3-.45.1-.19.05-.35-.02-.5-.07-.15-.63-1.52-.86-2.08-.23-.55-.46-.48-.64-.49l-.55-.01c-.19 0-.5.07-.77.35-.27.28-1.04 1.01-1.04 2.47 0 1.46 1.07 2.87 1.22 3.07.15.19 2.1 3.2 5.09 4.49 2.99 1.29 2.99.86 3.54.81.56-.05 1.72-.7 1.96-1.38.24-.69.24-1.28.17-1.38-.07-.1-.26-.15-.55-.3z" />
              </svg>
            </a>
            <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}

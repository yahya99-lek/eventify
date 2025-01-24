import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Create a route matcher to define public routes
const isPublicRoute = createRouteMatcher([
  '/', // Public homepage
  '/events/:id', // Public events
  '/api/webhook/clerk', // Public Clerk webhook
  '/api/webhook/stripe', // Public Stripe webhook
  '/api/uploadthing', // Public upload endpoint
]);

// Apply clerkMiddleware with the route matcher
export default clerkMiddleware(async (auth, request) => {
  // If the route is not public, protect it with Clerk's authentication
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
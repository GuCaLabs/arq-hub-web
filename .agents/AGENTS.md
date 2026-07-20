# Arq Hub Web - Architectural Rules and Guidelines

## 1. API Fetching
- **MANDATORY**: Always use `fetchApi()` (from `src/lib/api.ts`) instead of the native `fetch()` for backend requests. 
  - `fetchApi()` automatically handles appending the base URL, attaching authentication headers (JWT), and manages token refreshing on 401 Unauthorized errors.
- **EXCEPTION**: Do not use `fetchApi()` for external requests, such as uploading files to S3/R2 via pre-signed URLs (e.g. `const putRes = await fetch(uploadUrl, ...)`). In these specific scenarios, use the native `fetch()`.

## 2. Authentication
- The project uses Firebase for social logins/authentication, but the tokens are exchanged with the backend via `fetchApi("/auth/login")`.
- JWT access and refresh tokens are stored in `localStorage` and managed implicitly by `fetchApi`.

## 3. UI and Styling
- **Styling**: Tailwind CSS is the primary styling solution.
- **Components**: The project leverages Radix UI (`@radix-ui/react-*`) primitives for accessible UI components, combined with `clsx` and `tailwind-merge` for dynamic classes.
- **Icons**: Use `lucide-react` for all iconography.

## 4. Next.js App Router
- Use the Next.js 15/16 App Router architecture (all routes inside `src/app`).
- Default to **Server Components** for faster page loads and SEO, fetching initial data directly unless interactivity requires a Client Component (`"use client"`).
- Make use of ISR (Incremental Static Regeneration) caching features via `next: { revalidate: X }` where appropriate to optimize load times (e.g., public profile pages).

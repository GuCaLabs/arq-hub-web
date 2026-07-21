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

## 5. Design System & UI Patterns (Google Drive Style)
The application follows a unified "Google Drive" Design System to maintain a clean, professional, and consistent experience across all pages.
- **Layout**: Utilize an App Shell approach where possible, standardizing headers and sidebars.
- **Unified Lists**: Use unified table/list views for entities (Folders, Files, Workspaces, Projects) with standard columns (Icon/Name, Meta, Actions).
- **Navigation (Breadcrumbs)**: Deep hierarchies must use breadcrumbs at the top of the content area instead of manual "Back" buttons.
- **Primary Actions**: Use a prominent "+ Novo" (Primary Action) dropdown/button for creations (Upload, New Folder, New Project) rather than scattered inline forms.
- **Visual Tokens (globals.css)**: 
  - ALWAS use the CSS variables defined in globals.css (via Tailwind config). Do not hardcode `gray-50` or `gray-900`.
  - **Colors**: Use `bg-background` for app shells, `bg-card` for panels/cards. Text should be `text-foreground` or `text-muted-foreground`. Actions use `bg-primary`, `bg-secondary`, or `bg-accent`. Borders use `border-border`.
  - **Typography (Text Classes)**: ALWAYS use the defined typography classes for consistent font sizing and weights:
    - `.text-h1` for main page titles.
    - `.text-h2` for section titles.
    - `.text-h3` for small headers or card titles.
    - `.text-body` for standard body text.
    - `.text-muted` for subdued/secondary text.
    - `.text-small` for tiny labels or metadata.
  - **Borders/Radii**: Use the defined radii (`rounded-xl` or the native `--radius-card` tokens) for soft, Google Drive-style corners.
  - **Spacing**: Standardize paddings (e.g., `p-6` for cards, `py-8` for sections, gap of `4` or `8`).
- **Componentization (src/components/ui)**: 
  - **MANDATORY**: Never use raw HTML inputs, buttons, or cards if a Shadcn/Radix component exists in `src/components/ui/`.
  - **Use**: `Button` (for all buttons), `Input` & `Label` (for forms), `Card` (for layout sections), `Badge` (for tags/status), `Tabs` (for internal navigation).
  - **Discard/Cleanup**: Remove inline Tailwind classes (`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg`) and replace them with `<Button variant="default">`. Replace custom cards with `<Card>`. Any repeating complex UI (Data Tables, Breadcrumbs, Action Menus) MUST be extracted into `src/components/ui/` or `src/components/shared/` to maximize reuse.

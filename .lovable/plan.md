## Goal

Make sure each signed-in user only sees and can reach actions appropriate to their role. Admins shouldn't see "Student Portal", students shouldn't see "Admin/Coach", and each dashboard rejects users with the wrong role.

## Role model (already in DB)

- **student** — assigned automatically on signup
- **coach** — granted by admin, linked to a `coaches.user_id`
- **admin** — granted by admin

A user can hold multiple roles. Admin is the highest privilege.

## Header (`src/components/SiteHeader.tsx`)

Replace the single hard-coded `STUDENT_PORTAL` / `SIGN_IN` button with role-aware links:

| Signed-out | Student | Coach | Admin |
|---|---|---|---|
| `SIGN_IN` | `STUDENT_PORTAL` | `COACH` | `ADMIN` |

Rules:
- If the user has multiple roles, show one link per role (e.g. a coach who is also admin sees both `COACH` and `ADMIN`).
- `STUDENT_PORTAL` only appears for users whose ONLY role is student (admins/coaches don't need the student portal in the header).
- While roles are still being checked, render nothing in that slot instead of flashing the wrong link.
- "Book Trial" CTA stays for everyone (it's a public marketing action).

## Hook consolidation (`src/hooks/useIsAdmin.tsx`)

Add a single `useUserRoles()` hook that fetches all roles for the current user in one query and returns `{ roles, isAdmin, isCoach, isStudent, checking }`. Keep `useIsAdmin` / `useIsCoach` as thin wrappers so existing imports keep working. This avoids three sequential round-trips in the header.

## Admin page (`src/routes/_authenticated/admin.tsx`)

Currently shows a 403 panel for non-admins — keep that. Additional changes:
- While `checking`, show the "Checking access…" state (already there).
- After the access check, if the user is also a coach, add a small "Go to coach dashboard →" link in the header area so they can switch contexts without using the URL bar.

## Coach page (`src/routes/_authenticated/coach.tsx`)

- Already 403s non-coaches — keep.
- If the coach is also an admin, add a "Go to admin →" link in the header area, matching the admin page.
- The "your account isn't linked to a coach profile yet" empty state stays.

## Student portal (`src/routes/_authenticated/portal.tsx`)

Currently anyone signed in can reach `/portal`. Tighten it:
- If the user has the `admin` or `coach` role and NOT the `student` role, show a 403-style panel with links to their actual dashboard(s) instead of the student forms.
- Users who hold `student` (even alongside other roles) keep full access — they may genuinely want to manage their own profile.

## Out of scope

- No DB / RLS changes — server-side policies already enforce role checks; this work is purely UI gating to match.
- No changes to public marketing pages or the auth/login flow.
- No new role types.

## Files touched

- `src/hooks/useIsAdmin.tsx` — add `useUserRoles`, keep existing exports
- `src/components/SiteHeader.tsx` — role-aware nav slot
- `src/routes/_authenticated/admin.tsx` — cross-link to coach if applicable
- `src/routes/_authenticated/coach.tsx` — cross-link to admin if applicable
- `src/routes/_authenticated/portal.tsx` — block non-student admins/coaches

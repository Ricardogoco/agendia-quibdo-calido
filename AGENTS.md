<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting published git history.
<!-- LOVABLE:END -->

- Keep AgendIA's routes as thin page entries and its interactive personal workspace in the shared app component, because the phone interface persists across the app's sections.
- Store demo personalization and edits in browser localStorage, because this initial offline-friendly prototype has no connected cloud database.
- Keep notes, savings goals, and PQRS in the existing local workspace state; PQRS must be labelled unsent until a real delivery channel exists.

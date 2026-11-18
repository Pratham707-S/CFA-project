# AI Boundary

AI features never call the database or provider directly from a route.

Expected flow:

```text
Route → Zod input schema → AI orchestrator → versioned prompt → provider
      → Zod output schema → service → repository
```

Each prompt is versioned, tested with representative CFA examples, and kept
separate from provider-specific code. AI failures must return a safe fallback
or a retryable job state; they must not crash the request process.

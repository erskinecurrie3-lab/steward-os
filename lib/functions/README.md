# Steward Care Hub Functions — Implementation Status

Functions ported from legacy steward-care-hub to StewardOS (Next.js/Prisma).

| Function | Status | Location |
|----------|--------|----------|
| `generateFollowUpTasks` | ✅ Implemented | `app/api/tasks/generate/route.ts` |
| `analyzePrayerRequest` | ✅ Implemented | `app/api/prayer-requests/analyze/route.ts` |
| `sendGuestEmailSequence` | ✅ Implemented | `app/api/guests/route.ts` → `enrollInEmailSequence()` |
| `handleVolunteerTaskFallback` | ✅ Implemented | `app/api/tasks/fallback/route.ts` |
| `notifyVolunteerTaskAssigned` | ✅ Implemented | `lib/notifyVolunteerTaskAssigned.ts` (called from `app/api/tasks/[id]/route.ts` PATCH) |
| `createCheckout` | ✅ Exists | `app/api/billing/checkout/route.ts` |
| `createCalendarEventForTask` | ⏳ Pending | Requires Google Calendar connector |
| `syncEventToGoogleCalendar` | ⏳ Pending | Requires Google Calendar connector |
| `executeWorkflow` | ⏳ Pending | Complex workflow engine |
| `integrationWebhook` | ⏳ Pending | `app/api/webhooks/` exists |
| `processWebhookEvent` | ⏳ Pending | Integration-specific |
| `syncIntegrationData` | ⏳ Pending | Integration-specific |

"use client";

/**
 * Adds an "Add to Google Calendar" link for an event.
 * Uses Google Calendar URL format - no OAuth required.
 */

type Event = {
  id: string;
  title?: string;
  name?: string;
  start_date?: string;
  date?: string;
  end_date?: string;
  location?: string;
  description?: string;
};

type Props = { event: Event };

function formatDate(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

export default function GoogleCalendarSync({ event }: Props) {
  const title = (event.title ?? event.name ?? "Event").replace(/&/g, "&amp;");
  const start = event.start_date ?? event.date;
  const end = event.end_date ?? event.start_date ?? event.date;
  const location = (event.location ?? "").replace(/&/g, "&amp;");
  const description = (event.description ?? "").replace(/&/g, "&amp;").replace(/\n/g, "%0A");

  if (!start) return null;

  const startDate = new Date(start);
  const endDate = end ? new Date(end) : new Date(startDate.getTime() + 60 * 60 * 1000);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
  });
  if (location) params.set("location", location);
  if (description) params.set("details", description);

  const url = `https://calendar.google.com/calendar/render?${params.toString()}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-[#C9A84C] font-medium transition-colors"
    >
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
        <path d="M19.5 10.5h-15v9h15v-9zm0-6h-15v4.5h15v-4.5zm-15 0v-1.5c0-.825.675-1.5 1.5-1.5h12c.825 0 1.5.675 1.5 1.5v1.5h-15z" />
      </svg>
      Add to Google Calendar
    </a>
  );
}

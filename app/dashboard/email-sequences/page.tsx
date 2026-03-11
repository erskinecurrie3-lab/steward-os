"use client";

import { useState, useEffect } from "react";
import { Plus, Zap, Check, Loader2 } from "lucide-react";
import SequenceStepEditor from "@/components/sequences/SequenceStepEditor";
import SequenceCard from "@/components/sequences/SequenceCard";

const PRESET_STAGES = [
  { day: 1, label: "Day 1 – Welcome", subject: "So glad you joined us this Sunday!", body: "Hi {first_name},\n\nWe just wanted to say how grateful we are that you joined us this past Sunday. It means so much to have you with us.\n\nWe'd love to connect with you more — if you have any questions or just want to chat, please don't hesitate to reach out.\n\nBlessings,\nThe Pastoral Team" },
  { day: 3, label: "Day 3 – Personal Note", subject: "A note from our pastor", body: "Hi {first_name},\n\nI just wanted to personally reach out and let you know how much your visit meant to our community. We pray you felt welcomed and at home.\n\nWe have some wonderful opportunities to connect further — from small groups to community events. I'd love to tell you more when you're ready.\n\nIn His service,\nPastor" },
  { day: 7, label: "Day 7 – Connect", subject: "Have you considered joining a small group?", body: "Hi {first_name},\n\nA week has passed since your first visit, and we've been thinking about you! One of the best ways to find community here is through one of our small groups.\n\nWould you be open to hearing more? Just reply to this email and we'll find the right fit for you.\n\nGrace and Peace,\nThe Team" },
  { day: 14, label: "Day 14 – Check-In", subject: "We'd love to see you again", body: "Hi {first_name},\n\nWe noticed it's been a couple of weeks since your first visit — we just wanted to check in and let you know our doors are always open.\n\nThis Sunday we have [SERVICE DETAILS]. We'd love to have you back.\n\nWarm regards,\nThe Pastoral Team" },
  { day: 30, label: "Day 30 – Belonging", subject: "You belong here — next steps", body: "Hi {first_name},\n\nA month ago you walked through our doors for the first time. We hope you've had a chance to experience our community.\n\nWe'd love to invite you to our Next Steps class — a relaxed, no-pressure gathering where you can learn more about our church and find your place in it.\n\nBlessings,\nThe Pastoral Team" },
];

const PRESET_PACKS = [
  {
    id: "essential_5",
    name: "Essential 5-Touch Welcome",
    description: "The classic new visitor follow-up — a simple, proven 5-email series over 30 days. Perfect for any church.",
    badge: "Most Popular",
    badgeColor: "bg-[#C9A84C]/10 text-[#A07830] border-[#C9A84C]/30",
    icon: "⭐",
    steps: [
      { day: 1, name: "Day 1 – Welcome", subject: "So glad you joined us this Sunday!", body: "Hi {first_name},\n\nWhat a joy it was to have you join us this past Sunday! We're so grateful you chose to spend part of your day with us.\n\nWe'd love to get to know you — if you have any questions, feel free to reply to this email anytime.\n\nBlessings,\nThe Pastoral Team" },
      { day: 3, name: "Day 3 – Pastor's Note", subject: "A personal note from our pastor", body: "Hi {first_name},\n\nI just wanted to take a moment to personally welcome you. Your visit meant so much to our community, and I pray you felt warmth and belonging from the moment you walked in.\n\nIf you'd ever like to chat — about faith, about our church, or anything else — my door is always open.\n\nIn His service,\nPastor [Name]" },
      { day: 7, name: "Day 7 – Connect", subject: "Have you thought about joining a small group?", body: "Hi {first_name},\n\nIt's been a week since your first visit, and we've been thinking about you! Community is at the heart of what we do, and one of the best ways to find it here is through a small group.\n\nWe have groups for every interest and schedule. Would you like me to help you find one that fits? Just reply and let me know.\n\nGrace and peace,\nThe Team" },
      { day: 14, name: "Day 14 – Check-In", subject: "We'd love to see you again", body: "Hi {first_name},\n\nIt's been a couple of weeks and we just wanted to check in. Our doors are always open, and this Sunday would be a great time to visit again.\n\nWe have [SERVICE TOPIC] this week — we think you'd enjoy it. No pressure — just know you're always welcome.\n\nWarm regards,\nThe Pastoral Team" },
      { day: 30, name: "Day 30 – Next Steps", subject: "You belong here — your next step", body: "Hi {first_name},\n\nA whole month has passed since you first walked through our doors. We hope you've had a chance to experience our community and feel the warmth of this family.\n\nIf you're ready to take a next step, we'd love to invite you to our Next Steps class — a relaxed, no-pressure gathering where you can learn more and ask any questions you have.\n\nBlessings,\nThe Pastoral Team" },
    ],
  },
  {
    id: "deep_care_7",
    name: "Deep Care 7-Touch Journey",
    description: "A thorough 90-day sequence with 7 thoughtful touchpoints — ideal for churches that want high-touch pastoral follow-up.",
    badge: "High Touch",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    icon: "💜",
    steps: [
      { day: 0, name: "Day 0 – Instant Welcome", subject: "Welcome — we're so glad you're here!", body: "Hi {first_name},\n\nThank you for joining us today! We wanted to send a quick note to say how glad we are you came. You're not just a visitor — you're family.\n\nBlessings,\nThe Pastoral Team" },
      { day: 2, name: "Day 2 – Volunteer Call", subject: "Someone from our team is thinking of you", body: "Hi {first_name},\n\nOne of our care team members mentioned your name this week. We just wanted you to know you haven't gone unnoticed — you matter to us. Is there anything we can pray for you about?\n\nWith care,\n[Care Team Member]" },
      { day: 5, name: "Day 5 – Community Invite", subject: "Find your people here", body: "Hi {first_name},\n\nOne of the richest parts of church life is the relationships you find in it. We have small groups, ministry teams, and community events where real friendships are formed.\n\nCould we help you find your people? Just reply and tell us a little about yourself — your interests, schedule, or what you're looking for.\n\nGrace,\nThe Team" },
      { day: 10, name: "Day 10 – Faith Resource", subject: "A resource we thought you'd love", body: "Hi {first_name},\n\nWe put together a short guide called 'Finding Your Home Here' — it covers our church's story, beliefs, and the best ways to get connected. We thought you might find it helpful.\n\nYou can pick one up at the info table on Sunday, or just reply and we'll send you a digital copy!\n\nBlessings,\nThe Pastoral Team" },
      { day: 21, name: "Day 21 – Personal Outreach", subject: "Checking in — how are you doing?", body: "Hi {first_name},\n\nThree weeks have passed since your first visit, and I just wanted to personally check in. How are you feeling about [Church]? Is there anything we can do better?\n\nWe genuinely care about your experience and want to make sure you feel at home.\n\nWarm regards,\nPastor [Name]" },
      { day: 45, name: "Day 45 – Deeper Step", subject: "Ready to go deeper?", body: "Hi {first_name},\n\nYou've been with us for a while now, and we'd love to help you take a deeper step in your faith and in our community. Our Next Steps class, discipleship groups, and ministry opportunities are open to you.\n\nWould you like to learn more about any of these? Just reply — we'd love to walk alongside you.\n\nBlessings,\nThe Team" },
      { day: 90, name: "Day 90 – Milestone", subject: "Three months — you're part of this family", body: "Hi {first_name},\n\nThree months ago you walked through our doors for the first time. We hope these months have been full of growth, connection, and belonging.\n\nYou are a valued part of our community. We pray God continues to use this church as a place of encouragement and purpose in your life.\n\nWith gratitude,\nThe Pastoral Team" },
    ],
  },
  {
    id: "busy_family",
    name: "Busy Family Quick-Start",
    description: "A streamlined 3-email sequence for families with kids — warm, practical, and gets straight to the point.",
    badge: "Family",
    badgeColor: "bg-orange-50 text-orange-700 border-orange-200",
    icon: "👨‍👩‍👧",
    steps: [
      { day: 1, name: "Day 1 – Family Welcome", subject: "Your whole family is welcome here!", body: "Hi {first_name},\n\nWe're so glad your family joined us! Our kids ministry team loves caring for little ones — and we have community and programs for every age.\n\nWe'd love to connect your family with everything we have to offer. Just reply to this email and we'll personally introduce you to our family ministries team.\n\nBlessings,\nThe Pastoral Team" },
      { day: 7, name: "Day 7 – Kids Ministry", subject: "Your kids have a home here too", body: "Hi {first_name},\n\nWe know parenting is a full-time adventure, and we want to partner with you in raising kids of faith. Our children's ministry has programs every Sunday, plus seasonal events and parent resources.\n\nWould you like us to personally introduce your family to our kids ministry director?\n\nGrace and joy,\nThe Team" },
      { day: 21, name: "Day 21 – Family Events", subject: "Family events coming up — save the dates!", body: "Hi {first_name},\n\nWe have some amazing family events coming up and we'd love to have your family there! From family service days to parent nights out, there's something for everyone.\n\nReply and we'll send you our full family events calendar.\n\nWarm regards,\nThe Pastoral Team" },
    ],
  },
  {
    id: "re_engagement",
    name: "Re-engagement Sequence",
    description: "For guests who haven't returned — a gracious, no-pressure 4-email sequence to gently reconnect.",
    badge: "Win-Back",
    badgeColor: "bg-red-50 text-red-700 border-red-200",
    icon: "🙏",
    steps: [
      { day: 0, name: "Day 0 – We Miss You", subject: "We've been thinking about you", body: "Hi {first_name},\n\nIt's been a while since we've seen you and we just wanted you to know — you haven't been forgotten. No expectations, no pressure. We simply care about you and wanted to say so.\n\nBlessings,\nThe Pastoral Team" },
      { day: 5, name: "Day 5 – Open Door", subject: "Our door is always open", body: "Hi {first_name},\n\nWherever life has taken you, we want you to know our community is here for you whenever you're ready. No judgment, no questions — just an open door and a warm welcome.\n\nIf there's something we could have done better, I genuinely want to hear it. Your experience matters to us.\n\nWith grace,\nPastor [Name]" },
      { day: 14, name: "Day 14 – Special Invite", subject: "Something special is happening this Sunday", body: "Hi {first_name},\n\nWe have something special happening this Sunday — [EVENT OR SERMON SERIES] — and you immediately came to mind. We'd love to have you there if the timing works.\n\nNo pressure at all. Just know you're always welcome.\n\nWarm regards,\nThe Team" },
      { day: 30, name: "Day 30 – Blessing", subject: "Wishing you every blessing", body: "Hi {first_name},\n\nWe want you to know we're praying for you and wishing you every blessing — wherever your journey takes you. Our community will always have a place for you.\n\nWith love and grace,\nThe Pastoral Team" },
    ],
  },
];

type SequenceStep = {
  id?: string;
  name: string;
  trigger_type?: string;
  journey_stage?: string;
  channel: string;
  delay_days: number;
  message_template?: string | null;
  is_active: boolean;
};

export default function EmailSequencesPage() {
  const [sequences, setSequences] = useState<SequenceStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editing, setEditing] = useState<SequenceStep | null>(null);
  const [loadingPack, setLoadingPack] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/follow-up-sequences", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setSequences(Array.isArray(data) ? data : []))
      .catch(() => setSequences([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = (saved: SequenceStep) => {
    setSequences((prev) => {
      const exists = prev.find((s) => s.id === saved.id);
      const updated = exists
        ? prev.map((s) => (s.id === saved.id ? saved : s))
        : [...prev, saved];
      return updated.sort((a, b) => (a.delay_days ?? 0) - (b.delay_days ?? 0));
    });
    setShowBuilder(false);
    setEditing(null);
  };

  const handleDelete = async (id?: string) => {
    if (!id || !confirm("Delete this email step?")) return;
    const res = await fetch(`/api/follow-up-sequences/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) setSequences((prev) => prev.filter((s) => s.id !== id));
  };

  const toggleActive = async (seq: SequenceStep) => {
    const res = await fetch(`/api/follow-up-sequences/${seq.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !seq.is_active }),
      credentials: "include",
    });
    const updated = await res.json();
    if (res.ok)
      setSequences((prev) =>
        prev.map((s) => (s.id === seq.id ? { ...s, ...updated } : s))
      );
  };

  const loadPreset = async (preset: (typeof PRESET_STAGES)[0]) => {
    if (!confirm(`Add preset "${preset.label}" to your sequence?`)) return;
    const res = await fetch("/api/follow-up-sequences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: preset.label,
        trigger_type: "new_visitor_email_sequence",
        journey_stage: "stage_1_welcome",
        channel: "email",
        delay_days: preset.day,
        message_template: `Subject: ${preset.subject}\n\n${preset.body}`,
        is_active: true,
      }),
      credentials: "include",
    });
    const created = await res.json();
    if (res.ok)
      setSequences((prev) =>
        [...prev, { ...created, delay_days: created.delay_days ?? preset.day }].sort(
          (a, b) => (a.delay_days ?? 0) - (b.delay_days ?? 0)
        )
      );
  };

  const loadPresetPack = async (pack: (typeof PRESET_PACKS)[0]) => {
    if (
      !confirm(
        `Load the "${pack.name}" preset? This will add ${pack.steps.length} email steps to your sequence.`
      )
    )
      return;
    setLoadingPack(pack.id);
    try {
      const created = await Promise.all(
        pack.steps.map((step) =>
          fetch("/api/follow-up-sequences", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: step.name,
              trigger_type: "new_visitor_email_sequence",
              journey_stage: "stage_1_welcome",
              channel: "email",
              delay_days: step.day,
              message_template: `Subject: ${step.subject}\n\n${step.body}`,
              is_active: true,
            }),
            credentials: "include",
          }).then((r) => r.json())
        )
      );
      setSequences((prev) =>
        [...prev, ...created].sort((a, b) => (a.delay_days ?? 0) - (b.delay_days ?? 0))
      );
    } finally {
      setLoadingPack(null);
    }
  };

  const openEdit = (seq: SequenceStep) => {
    setEditing(seq);
    setShowBuilder(true);
  };
  const openNew = () => {
    setEditing(null);
    setShowBuilder(true);
  };

  return (
    <div className="max-w-4xl w-full">
      {showBuilder && (
        <SequenceStepEditor
          step={editing ?? undefined}
          onSave={handleSave}
          onClose={() => {
            setShowBuilder(false);
            setEditing(null);
          }}
        />
      )}

      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0A0A0A]">Email Sequence Builder</h1>
          <p className="text-sm text-[#9CA3AF]">
            Automated emails sent to new guests at Day 1, Day 7, Day 30, and beyond
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0A0A0A] text-white font-semibold text-sm hover:bg-[#1A1A1A] transition-all flex-shrink-0"
        >
          <Plus size={16} /> Add Email Step
        </button>
      </div>

      <div className="bg-[#FDFAF5] border border-[#E8D5A3]/40 rounded-2xl p-5 mb-6">
        <div className="flex items-start gap-3">
          <Zap size={20} className="text-[#C9A84C] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-[#0A0A0A] mb-1">How it works</p>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              When a new guest is added to the system, this sequence automatically sends
              personalized emails at your defined intervals. Use{" "}
              <strong>{"{first_name}"}</strong> in your templates for personalization. Emails
              are sent based on the guest&apos;s email address.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Email Steps", value: sequences.length },
          { label: "Active Steps", value: sequences.filter((s) => s.is_active).length },
          {
            label: "Longest Sequence",
            value:
              sequences.length > 0
                ? `Day ${Math.max(...sequences.map((s) => s.delay_days ?? 0))}`
                : "—",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-xl border border-gray-100 p-4 text-center"
          >
            <p className="text-2xl font-bold text-[#0A0A0A]">{s.value}</p>
            <p className="text-xs text-[#9CA3AF] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-[#9CA3AF]">
          <Loader2 size={24} className="animate-spin mx-auto mb-2" />
          <p className="text-sm">Loading sequence...</p>
        </div>
      ) : sequences.length === 0 ? (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-1">
              <Zap size={18} className="text-[#C9A84C]" />
              <h2 className="font-bold text-[#0A0A0A]">Quick Start — Load a Full Preset</h2>
            </div>
            <p className="text-sm text-[#9CA3AF] mb-5">
              New to email sequences? Pick a preset below and we&apos;ll add every email step
              for you — ready to go in one click.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PRESET_PACKS.map((pack) => (
                <div
                  key={pack.id}
                  className="rounded-2xl border border-gray-100 p-4 hover:border-[#C9A84C]/40 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-2xl">{pack.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <p className="font-semibold text-sm text-[#0A0A0A]">{pack.name}</p>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border font-medium ${pack.badgeColor}`}
                        >
                          {pack.badge}
                        </span>
                      </div>
                      <p className="text-xs text-[#9CA3AF] leading-relaxed">
                        {pack.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {pack.steps.map((s) => (
                      <span
                        key={s.day}
                        className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500"
                      >
                        Day {s.day}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => loadPresetPack(pack)}
                    disabled={loadingPack === pack.id}
                    className="w-full py-2 rounded-xl bg-[#0A0A0A] text-white text-xs font-semibold hover:bg-[#1A1A1A] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loadingPack === pack.id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Check size={12} />
                    )}
                    {loadingPack === pack.id
                      ? "Loading..."
                      : `Load ${pack.steps.length} Email Steps`}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-dashed border-gray-200 bg-gray-50">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Or add individual steps
            </p>
            <div className="flex flex-wrap gap-2">
              {PRESET_STAGES.map((p) => (
                <button
                  key={p.day}
                  onClick={() => loadPreset(p)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-600 font-medium hover:border-[#C9A84C] hover:text-[#A07830] transition-colors"
                >
                  + {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="relative space-y-4">
            {sequences.map((seq, i) => (
              <SequenceCard
                key={seq.id ?? `seq-${i}`}
                seq={seq}
                isLast={i === sequences.length - 1}
                onEdit={() => openEdit(seq)}
                onDelete={() => handleDelete(seq.id)}
                onToggle={() => toggleActive(seq)}
              />
            ))}
          </div>

          <div className="mt-6 p-4 rounded-xl border border-dashed border-gray-200 bg-gray-50">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Quick-add a preset step
            </p>
            <div className="flex flex-wrap gap-2">
              {PRESET_STAGES.map((p) => (
                <button
                  key={p.day}
                  onClick={() => loadPreset(p)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-600 font-medium hover:border-[#C9A84C] hover:text-[#A07830] transition-colors"
                >
                  + {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 bg-[#FDFAF5] border border-[#E8D5A3]/40 rounded-2xl p-5">
            <p className="text-xs font-semibold text-[#0A0A0A] mb-0.5">Load a full preset pack</p>
            <p className="text-xs text-[#9CA3AF] mb-3">
              Add a complete sequence of email steps from a proven template.
            </p>
            <div className="flex flex-wrap gap-2">
              {PRESET_PACKS.map((pack) => (
                <button
                  key={pack.id}
                  onClick={() => loadPresetPack(pack)}
                  disabled={loadingPack === pack.id}
                  className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-white border border-[#E8D5A3] text-[#A07830] font-medium hover:bg-[#C9A84C]/10 transition-colors disabled:opacity-60"
                >
                  {loadingPack === pack.id ? (
                    <Loader2 size={11} className="animate-spin" />
                  ) : (
                    <span>{pack.icon}</span>
                  )}
                  {pack.name}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

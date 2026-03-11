"use client";

import { useState } from "react";
import { X, Hand, Users, Baby, Zap, Leaf, Sprout, Heart, Monitor } from "lucide-react";

export type TouchpointSeed = {
  title: string;
  description: string;
  type: string;
  daysOffset: number;
};

export type StageSeed = {
  name: string;
  label: string;
  description: string;
};

export type JourneyTemplate = {
  id: string;
  title: string;
  description: string;
  category: string;
  categoryColor: string;
  touchpoints: number;
  days: number;
  icon: "hand" | "users" | "baby" | "zap" | "leaf" | "sprout" | "heart" | "monitor";
  touchpointList: TouchpointSeed[];
  stages: StageSeed[];
};

const TEMPLATES: JourneyTemplate[] = [
  {
    id: "first-time",
    title: "First-Time Visitor Welcome",
    description: "A 30-day pathway with 7 touchpoints for brand-new visitors.",
    category: "Most Popular",
    categoryColor: "bg-[#C9A84C]/20 text-[#A07830]",
    touchpoints: 7,
    days: 30,
    icon: "hand",
    touchpointList: [
      { title: "Welcome Email", description: "Send a warm welcome email within 24 hours of their first visit.", type: "email", daysOffset: 0 },
      { title: "Personal Follow-Up Call", description: "Volunteer makes a personal phone call to say thanks and answer questions.", type: "manual", daysOffset: 2 },
      { title: "Invitation to Small Group", description: "Send an invite to a connection group or small group that fits their interests.", type: "email", daysOffset: 7 },
      { title: "Second Visit Check-In", description: "If they return, send a personal note from the pastor.", type: "manual", daysOffset: 14 },
      { title: "Connect Event Invite", description: "Invite to a newcomer connect event or coffee with leadership.", type: "email", daysOffset: 21 },
      { title: "Ministry Opportunity", description: "Share ways to serve based on their interests and availability.", type: "manual", daysOffset: 25 },
      { title: "Next Steps Class", description: "Invite to membership or next steps class to deepen commitment.", type: "email", daysOffset: 30 },
    ],
    stages: [
      { name: "stage_1_welcome", label: "Welcome", description: "First contact within 7 days — email and call." },
      { name: "stage_2_connect", label: "Connect", description: "Invitation to groups and events." },
      { name: "stage_3_engaged", label: "Engaged", description: "Serving and next steps." },
    ],
  },
  {
    id: "returning",
    title: "Returning Visitor Re-engagement",
    description: "A 21-day pathway with 6 touchpoints for guests considering the church.",
    category: "High Conversion",
    categoryColor: "bg-[#C9A84C]/20 text-[#A07830]",
    touchpoints: 6,
    days: 21,
    icon: "users",
    touchpointList: [
      { title: "Thank You Note", description: "Personal note thanking them for returning.", type: "email", daysOffset: 0 },
      { title: "Small Group Match", description: "Connect with a small group leader or host who can reach out.", type: "manual", daysOffset: 3 },
      { title: "Service Invite", description: "Invite to a specific upcoming service or series.", type: "email", daysOffset: 7 },
      { title: "Personal Outreach", description: "Volunteer or staff member reaches out for a coffee or chat.", type: "manual", daysOffset: 10 },
      { title: "Ministry Discovery", description: "Share ministry opportunities that fit their gifts.", type: "email", daysOffset: 14 },
      { title: "Next Steps Invite", description: "Invite to membership class or commitment next step.", type: "manual", daysOffset: 21 },
    ],
    stages: [
      { name: "stage_1_welcome", label: "Returning", description: "Acknowledging their second visit." },
      { name: "stage_2_connect", label: "Connect", description: "Finding community fit." },
      { name: "stage_3_engaged", label: "Engaged", description: "Ready for commitment." },
    ],
  },
  {
    id: "young-family",
    title: "Young Family Pathway",
    description: "A 45-day pathway with 7 touchpoints for families with young children.",
    category: "Family Focus",
    categoryColor: "bg-[#C9A84C]/20 text-[#A07830]",
    touchpoints: 7,
    days: 45,
    icon: "baby",
    touchpointList: [
      { title: "Family Welcome Email", description: "Welcome email highlighting kids ministry and family programs.", type: "email", daysOffset: 0 },
      { title: "Kids Ministry Intro", description: "Connect family with kids ministry director for a personal intro.", type: "manual", daysOffset: 3 },
      { title: "Family Event Invite", description: "Invite to family service, parenting event, or kids activity.", type: "email", daysOffset: 10 },
      { title: "Small Group for Parents", description: "Invite parents to a family-friendly small group.", type: "manual", daysOffset: 17 },
      { title: "Volunteer in Kids Ministry", description: "Offer chance to serve in kids ministry with their child.", type: "email", daysOffset: 24 },
      { title: "Family Resources", description: "Share parenting resources, devotionals, or family event calendar.", type: "manual", daysOffset: 35 },
      { title: "Family Next Steps", description: "Invite to family dedication, baptism, or membership class.", type: "email", daysOffset: 45 },
    ],
    stages: [
      { name: "stage_1_welcome", label: "Welcome", description: "Kids ministry intro and family programs." },
      { name: "stage_2_connect", label: "Connect", description: "Family community and events." },
      { name: "stage_3_engaged", label: "Engaged", description: "Serving and next steps as a family." },
    ],
  },
  {
    id: "single-adults",
    title: "Single Adults Journey",
    description: "A 30-day pathway with 6 touchpoints for single adults.",
    category: "Community Focus",
    categoryColor: "bg-[#C9A84C]/20 text-[#A07830]",
    touchpoints: 6,
    days: 30,
    icon: "zap",
    touchpointList: [
      { title: "Welcome Email", description: "Warm welcome and highlight of single adult ministries.", type: "email", daysOffset: 0 },
      { title: "Single Adult Group Connect", description: "Connect with a single adult group leader or peer.", type: "manual", daysOffset: 5 },
      { title: "Event Invite", description: "Invite to single adult social or small group event.", type: "email", daysOffset: 10 },
      { title: "Mentor or Buddy", description: "Pair with a church member for coffee or small group intro.", type: "manual", daysOffset: 17 },
      { title: "Serving Opportunity", description: "Share ministry opportunities suited for single adults.", type: "email", daysOffset: 22 },
      { title: "Next Steps", description: "Invite to membership or discipleship next step.", type: "manual", daysOffset: 30 },
    ],
    stages: [
      { name: "stage_1_welcome", label: "Welcome", description: "Single adult community intro." },
      { name: "stage_2_connect", label: "Connect", description: "Finding peer community." },
      { name: "stage_3_engaged", label: "Engaged", description: "Serving and belonging." },
    ],
  },
  {
    id: "senior-adult",
    title: "Senior Adult Welcome",
    description: "A 45-day pathway with 7 touchpoints for senior adults.",
    category: "Pastoral Care",
    categoryColor: "bg-[#C9A84C]/20 text-[#A07830]",
    touchpoints: 7,
    days: 45,
    icon: "leaf",
    touchpointList: [
      { title: "Welcome Letter", description: "Personal welcome letter or email from pastoral team.", type: "email", daysOffset: 0 },
      { title: "Pastoral Call", description: "A pastor or senior adult minister makes a personal call.", type: "manual", daysOffset: 3 },
      { title: "Senior Ministry Invite", description: "Invite to senior adult group, Bible study, or fellowship.", type: "email", daysOffset: 10 },
      { title: "Home Visit Offer", description: "Offer a home visit or coffee with a volunteer.", type: "manual", daysOffset: 17 },
      { title: "Care Ministry Info", description: "Share info on care ministry, prayer, and support.", type: "email", daysOffset: 25 },
      { title: "Serving as a Senior", description: "Invite to serve in ministries that fit their gifts and schedule.", type: "manual", daysOffset: 35 },
      { title: "Membership or Legacy", description: "Invite to membership or legacy giving conversation.", type: "email", daysOffset: 45 },
    ],
    stages: [
      { name: "stage_1_welcome", label: "Welcome", description: "Pastoral care and senior ministry intro." },
      { name: "stage_2_connect", label: "Connect", description: "Finding peer community." },
      { name: "stage_3_engaged", label: "Engaged", description: "Serving and legacy." },
    ],
  },
  {
    id: "new-believer",
    title: "New Believer Discipleship",
    description: "A 90-day pathway with 8 touchpoints for new believers.",
    category: "Discipleship",
    categoryColor: "bg-[#C9A84C]/20 text-[#A07830]",
    touchpoints: 8,
    days: 90,
    icon: "sprout",
    touchpointList: [
      { title: "Congratulations Note", description: "Celebrate their decision and outline next steps.", type: "email", daysOffset: 0 },
      { title: "Discipleship Mentor", description: "Connect with a mentor or accountability partner.", type: "manual", daysOffset: 5 },
      { title: "Bible Reading Plan", description: "Provide a starter Bible reading plan and devotional.", type: "email", daysOffset: 14 },
      { title: "Baptism Class", description: "Invite to baptism or believer baptism class.", type: "manual", daysOffset: 21 },
      { title: "Small Group Launch", description: "Connect to a discipleship or growth small group.", type: "email", daysOffset: 35 },
      { title: "Spiritual Gifts Discovery", description: "Offer spiritual gifts assessment and ministry fit.", type: "manual", daysOffset: 50 },
      { title: "First Serve", description: "Help them take their first step in serving.", type: "email", daysOffset: 65 },
      { title: "Mission and Giving", description: "Conversation about mission, stewardship, and tithing.", type: "manual", daysOffset: 90 },
    ],
    stages: [
      { name: "stage_1_welcome", label: "New Believer", description: "Celebration and foundation." },
      { name: "stage_2_connect", label: "Growing", description: "Discipleship and community." },
      { name: "stage_3_engaged", label: "Maturing", description: "Serving and mission." },
    ],
  },
  {
    id: "at-risk",
    title: "At-Risk Guest Re-engagement",
    description: "A 30-day pathway with 6 touchpoints for guests who haven't returned.",
    category: "Re-engagement",
    categoryColor: "bg-[#C9A84C]/20 text-[#A07830]",
    touchpoints: 6,
    days: 30,
    icon: "heart",
    touchpointList: [
      { title: "We Miss You Note", description: "A caring note — no pressure, just letting them know they're valued.", type: "email", daysOffset: 0 },
      { title: "Volunteer Check-In", description: "Assigned volunteer reaches out with a personal call or text.", type: "manual", daysOffset: 5 },
      { title: "Open Door Message", description: "Remind them the door is always open whenever they're ready.", type: "email", daysOffset: 10 },
      { title: "Special Invite", description: "Invite to a specific service, event, or series coming up.", type: "manual", daysOffset: 15 },
      { title: "Pastoral Note", description: "Personal note from pastor if no response yet.", type: "email", daysOffset: 22 },
      { title: "Blessing and Release", description: "Wish them well — leave the door open for future return.", type: "manual", daysOffset: 30 },
    ],
    stages: [
      { name: "stage_1_welcome", label: "Reaching Out", description: "Gentle, no-pressure contact." },
      { name: "stage_2_connect", label: "Inviting Back", description: "Special invites and personal touch." },
      { name: "stage_3_engaged", label: "Release", description: "Blessing and open door." },
    ],
  },
  {
    id: "digital",
    title: "Online/Digital Visitor Journey",
    description: "A 21-day pathway with 6 touchpoints for guests engaging online first.",
    category: "Digital First",
    categoryColor: "bg-gray-100 text-gray-600",
    touchpoints: 6,
    days: 21,
    icon: "monitor",
    touchpointList: [
      { title: "Welcome to Online", description: "Thank them for watching — invite to connect digitally first.", type: "email", daysOffset: 0 },
      { title: "Digital Community Invite", description: "Invite to online small group, chat, or social community.", type: "manual", daysOffset: 3 },
      { title: "In-Person Invite", description: "Warm invite to visit in person when ready — low pressure.", type: "email", daysOffset: 7 },
      { title: "Virtual Coffee", description: "Offer a virtual coffee or Zoom with a staff/volunteer.", type: "manual", daysOffset: 10 },
      { title: "On-Demand Resources", description: "Share sermons, devotions, or small group content.", type: "email", daysOffset: 14 },
      { title: "Next Step", description: "Invite to in-person visit, membership, or digital next step.", type: "manual", daysOffset: 21 },
    ],
    stages: [
      { name: "stage_1_welcome", label: "Digital Welcome", description: "Online connection first." },
      { name: "stage_2_connect", label: "Connect", description: "Digital community and invite." },
      { name: "stage_3_engaged", label: "Engaged", description: "In-person or deeper digital step." },
    ],
  },
];

const ICON_MAP = {
  hand: Hand,
  users: Users,
  baby: Baby,
  zap: Zap,
  leaf: Leaf,
  sprout: Sprout,
  heart: Heart,
  monitor: Monitor,
};

export default function JourneyTemplateGallery({ open, onClose, onSelect }: { open: boolean; onClose: () => void; onSelect?: (t: JourneyTemplate) => void }) {
  const [search, setSearch] = useState("");

  if (!open) return null;

  const filtered = TEMPLATES.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#0A0A0A]">Journey Template Gallery</h2>
              <p className="text-sm text-[#9CA3AF] mt-0.5">Start from a proven pathway — customize it to fit your church.</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <X size={20} className="text-[#6B7280]" />
            </button>
          </div>
          <input
            type="text"
            placeholder="Search pathways..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mt-4 w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C9A84C] placeholder:text-[#9CA3AF]"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((t) => {
              const Icon = ICON_MAP[t.icon];
              return (
                <div
                  key={t.id}
                  className="bg-white border border-gray-200 rounded-xl p-5 hover:border-[#C9A84C]/40 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => {
                    onSelect?.(t);
                    onClose();
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#C9A84C]/10 flex items-center justify-center flex-shrink-0">
                      <Icon size={18} className="text-[#A07830]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-semibold text-[#0A0A0A] text-sm">{t.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.categoryColor}`}>{t.category}</span>
                      </div>
                      <p className="text-xs text-[#6B7280] leading-relaxed mb-2">{t.description}</p>
                      <p className="text-xs text-[#9CA3AF]">
                        {t.touchpoints} touchpoints · {t.days} days
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-[#C9A84C] hover:text-[#A07830] flex-shrink-0">Preview →</span>
                  </div>
                </div>
              );
            })}
          </div>
          {filtered.length === 0 && (
            <p className="text-center py-12 text-[#9CA3AF] text-sm">No templates match your search.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export { TEMPLATES };

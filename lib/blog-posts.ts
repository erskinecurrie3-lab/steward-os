export const categoryLabels: Record<string, string> = {
  guest_experience: "Guest Experience",
  pastoral_care: "Pastoral Care",
  ai_ministry: "AI & Ministry",
  leadership: "Leadership",
  case_study: "Case Study",
  church_growth: "Church Growth",
};

export const categoryColors: Record<string, string> = {
  guest_experience: "bg-[#C9A84C]/20 text-[#A07830]",
  pastoral_care: "bg-purple-50 text-purple-700",
  ai_ministry: "bg-[#C9A84C]/10 text-[#A07830]",
  leadership: "bg-green-50 text-green-700",
  case_study: "bg-[#0A0A0A] text-white",
  church_growth: "bg-orange-50 text-orange-700",
};

export type BlogPost = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  author_name: string;
  published_date: string;
  read_time_minutes: number;
  cover_image_url: string;
  content: string;
};

export const staticPosts: BlogPost[] = [
  {
    id: "1",
    title: "Why 60% of First-Time Visitors Never Return (And How to Fix It)",
    excerpt:
      "The research is sobering: most churches lose the majority of first-time guests before the second visit. Here's what the data shows and what you can do this week.",
    category: "guest_experience",
    author_name: "StewardOS Team",
    published_date: "2026-02-01",
    read_time_minutes: 6,
    cover_image_url: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=600&q=80",
    content: `## The Retention Crisis Nobody Talks About

Research consistently shows that 60–80% of first-time church visitors never return for a second visit. This isn't a new problem — but it's one that most churches haven't built a system to solve.

## Why Guests Don't Come Back

The top reasons visitors don't return are almost never about doctrine or preaching quality. They're about connection:

- **No one followed up** — 72% of non-returning visitors say they never received any outreach after their first visit
- **They felt invisible** — They attended, dropped their contact card, and never heard from anyone
- **The follow-up felt generic** — A mass email blast doesn't communicate personal care

## What Actually Works

Churches that retain 60%+ of first-time visitors share these practices:

1. **Personal outreach within 48 hours** — A real phone call or handwritten note, not an automated email
2. **A clear next step** — Invite them to something specific: a class, a small group, a coffee meeting
3. **Consistent follow-up over 30 days** — Not just once, but a thoughtful sequence of care touches
4. **Volunteer care teams** — Spreading the follow-up load beyond the pastoral staff

## Building Your System

You don't need software to start. You need a process. Map out what happens the moment a guest fills out a connection card:

- Who gets notified?
- Who makes the first call?
- What do they say?
- What happens if there's no response?

Once your process is clear, then you can use tools like StewardOS to automate and scale it — without losing the personal touch that makes care meaningful.`,
  },
  {
    id: "2",
    title: "The Bi-Vocational Pastor's Guide to Not Burning Out",
    excerpt:
      "You're doing the work of three people. Here's how to build systems that care for your congregation without breaking you in the process.",
    category: "pastoral_care",
    author_name: "StewardOS Team",
    published_date: "2026-01-20",
    read_time_minutes: 8,
    cover_image_url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80",
    content: `## The Hidden Weight of Bi-Vocational Ministry

If you're a bi-vocational pastor, you already know: you're doing the spiritual, relational, and administrative work of full-time ministry — while also holding down a job, raising a family, and trying to stay sane.

The average bi-vocational pastor works 25–30 hours per week at their secular job and another 25–35 hours per week on ministry responsibilities. That's 50–65 hours total. Sustainably managing pastoral care in that context requires systems, not heroism.

## What Burns Pastors Out

The number one burnout driver for bi-vocational pastors isn't preaching or counseling. It's **the feeling that people are slipping through the cracks** and there's nothing they can do about it.

You think about the family you haven't called. The new visitor from three weeks ago who you meant to reach out to. The member who seems distant but you haven't had time to check in with.

This mental load — not the work itself — is what exhausts pastoral leaders.

## Building a System That Runs Without You

The solution isn't working harder. It's building a care infrastructure that continues even when you're unavailable.

**Step 1: Delegate care, not just tasks**
Train 3–5 volunteers to be genuine care partners — people who can make real, meaningful contact with guests and members on your behalf.

**Step 2: Create a weekly care rhythm**
Every Monday, identify your top 5 people who need care this week. That's it. Five people you or a volunteer will contact.

**Step 3: Document everything**
When care happens, log it. Not for control — for continuity. If you're exhausted on a Wednesday, you need to know what's already been done.

**Step 4: Use automation for the repetitive stuff**
New visitor welcome emails, event reminders, birthday acknowledgements — these can be automated. Save your personal time for the conversations that require you.`,
  },
  {
    id: "3",
    title: "What is a Visitor Journey Map — and Why Every Church Needs One",
    excerpt:
      "A Visitor Journey Map is the single most important document your church can create. Here's what it is, how it works, and how to build yours.",
    category: "guest_experience",
    author_name: "StewardOS Team",
    published_date: "2026-01-10",
    read_time_minutes: 5,
    cover_image_url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80",
    content: `## What Is a Visitor Journey Map?

A Visitor Journey Map is a documented, step-by-step plan for how your church will care for a first-time guest from the moment they arrive until they become a fully connected member.

It answers three questions:
1. **What happens** at each stage of a guest's journey?
2. **Who is responsible** for making it happen?
3. **When** does each step occur?

## Why Most Churches Don't Have One

Most churches operate on pastoral instinct. The pastor knows (roughly) what should happen when a visitor shows up. But that knowledge lives in one person's head — which means when the pastor is busy, sick, or on vacation, the care system breaks down.

A Visitor Journey Map externalizes that knowledge. It becomes a document your whole team can follow, regardless of who's available.

## The Five-Stage Framework

**Stage 1: Welcome (Days 1–7)**
Immediate acknowledgement. Personal contact within 48 hours. A genuine invitation to return.

**Stage 2: Connect (Days 8–30)**
Invitation to a next step: small group, new members class, or coffee with a staff member.

**Stage 3: Grow (Days 31–60)**
Integration into a meaningful ministry or group. Regular check-ins from a volunteer care partner.

**Stage 4: Serve (Days 61–80)**
Discovery of gifts and passion. An invitation to serve in a specific role.

**Stage 5: Belong (Days 81–90)**
Formal membership or commitment. A sense of genuine belonging and ownership.

## How to Build Yours

Start simple. Take a piece of paper and write down what should happen on Day 1, Day 7, Day 30, Day 60, and Day 90 for every new visitor. That's your first journey map. You can refine it from there.`,
  },
  {
    id: "4",
    title: "How AI is Transforming Church Pastoral Care",
    excerpt:
      "Artificial intelligence isn't replacing the pastor — it's giving them superpowers. Here's what's possible today in AI-powered church care.",
    category: "ai_ministry",
    author_name: "StewardOS Team",
    published_date: "2025-12-28",
    read_time_minutes: 7,
    cover_image_url: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&q=80",
    content: `## AI in Ministry: What It Actually Means

When most pastors hear "artificial intelligence," they picture robots replacing human connection. The reality is far more pastoral.

AI in church care is about one thing: **helping you care for more people, more consistently, without burning out your team.**

## What AI Can Do Today

**Personalized follow-up drafts**
AI can analyze a guest's profile — their spiritual background, family situation, how they heard about your church — and draft a personalized follow-up message. You review it, edit it, and send it. The AI handles the first draft. You provide the pastoral heart.

**At-risk identification**
AI can flag guests who haven't been seen in 2–3 weeks, or who haven't responded to any outreach. This surfaces the people who need attention before they're already gone.

**Journey stage recommendations**
Based on a guest's engagement pattern, AI can suggest what next step is most appropriate — whether that's a small group invitation, a one-on-one coffee, or a serving opportunity.

**Communication sequencing**
AI can help you build automated care sequences that go out at the right time, in the right channel, with the right message — without you manually managing every step.

## What AI Cannot Do

AI cannot replace genuine human relationship. It cannot pray with someone in a moment of crisis. It cannot sit across from a grieving family and offer the comfort of presence.

What it can do is make sure those moments of human connection happen more often — because the administrative and logistical burden of pastoral care is being handled by intelligent systems working in the background.

## The Pastor's Role in an AI-Assisted Ministry

Your role doesn't shrink — it deepens. When AI handles the routine, you're freed to focus on the irreplaceable: the hard conversations, the pastoral wisdom, the spiritual direction that only you can provide.`,
  },
  {
    id: "5",
    title: "From 20% to 65% Visitor Retention: A Church Growth Case Study",
    excerpt:
      "Grace Community Church tripled their visitor retention in 90 days. Here's exactly what they changed and what you can replicate.",
    category: "case_study",
    author_name: "StewardOS Team",
    published_date: "2025-12-15",
    read_time_minutes: 9,
    cover_image_url: "https://images.unsplash.com/photo-1494891848038-7bd202a2afeb?w=600&q=80",
    content: `## The Church That Transformed Its Retention

Grace Community Church in the suburbs of Atlanta had a problem every pastor recognizes: people were showing up, but not sticking.

For three years, their first-time visitor retention rate hovered around 20%. For every 10 guests who walked through the door, 8 never came back.

Pastor David knew they weren't lacking in welcome. The greeters were warm. The services were excellent. The problem, he eventually realized, was **what happened after Sunday.**

## What They Changed

**Week 1: They built a Journey Map**
For the first time, Grace Community documented a step-by-step process for what happens after a guest arrives. Who calls? When? What do they say? What's the next invitation?

**Week 2: They trained a care team**
Five volunteers were recruited and trained specifically for guest follow-up. Each volunteer took responsibility for 3–4 guests per month — a manageable load that they could handle with excellence.

**Week 3: They implemented a follow-up system**
Using StewardOS, they set up automated reminders, a care notes system, and a weekly priority dashboard. Every Monday, Pastor David knew exactly who needed attention that week.

**Week 4: They measured everything**
For the first time, they tracked: How many first-time guests? How many received follow-up? How many returned? How many connected to a small group?

## The Results (90 Days Later)

- First-time visitor retention: **20% → 65%**
- Volunteer care team engagement: **0 → 12 active volunteers**
- Average time-to-first-follow-up: **4 days → 28 hours**
- New small group connections in 90 days: **23**

## What You Can Replicate

You don't need a large church or a big budget to do what Grace Community did. You need:

1. A documented journey map
2. A small team of trained care volunteers  
3. A consistent weekly rhythm of reviewing who needs care
4. A simple system to log what's been done

Start with those four things. The results will follow.`,
  },
  {
    id: "6",
    title: "Building a Culture of Care: How to Train Volunteers for Guest Follow-Up",
    excerpt:
      "Great care doesn't start with software — it starts with people. Here's how to recruit, train, and mobilize your team for consistent guest follow-up.",
    category: "leadership",
    author_name: "StewardOS Team",
    published_date: "2025-12-01",
    read_time_minutes: 6,
    cover_image_url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80",
    content: `## Why Volunteers Are Your Most Important Care Asset

Pastoral staff can only reach so many people. But a well-trained volunteer care team can multiply your church's capacity for meaningful connection by 5x, 10x, or more.

The key word is **trained**. A volunteer who doesn't know what to say, when to reach out, or how to handle a difficult conversation will either do it poorly or not do it at all.

## Who to Recruit

The best care volunteers share three characteristics:

1. **They're genuinely warm people** — not just people who want to serve, but people who naturally make others feel seen and welcomed
2. **They're reliable** — they follow through on what they commit to
3. **They understand their role** — they're extending the pastor's care, not replacing it

Recruit from your existing members who already demonstrate these qualities in their everyday interactions.

## How to Train Them

**Session 1: The Why**
Help volunteers understand why guest follow-up matters. Share your visitor retention data. Talk about the people who left and might have stayed with better care. Build the emotional conviction that this work matters.

**Session 2: The How**
Walk them through your Visitor Journey Map. Role-play a first follow-up call. Give them scripts — not to read verbatim, but to give them confidence about what to say.

**Session 3: The Tools**
Show them how to log care notes, how to flag someone who needs pastoral attention, and how to communicate with the pastoral team.

## Sustaining the Culture

Monthly check-ins with your care volunteers are essential. Celebrate wins. Share stories of guests who connected because of someone's follow-up. Pray together for the people you're caring for.

Care culture isn't built in a training session — it's built in the ongoing rhythms of a team that genuinely loves people together.`,
  },
  {
    id: "7",
    title: "5 Proven Strategies to Grow Your Church Without a Bigger Budget",
    excerpt:
      "Church growth doesn't require a massive marketing spend. These five strategies have helped small and mid-sized churches double their active attendance — with nothing more than intentional systems.",
    category: "church_growth",
    author_name: "StewardOS Team",
    published_date: "2026-02-15",
    read_time_minutes: 7,
    cover_image_url: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=600&q=80",
    content: `## Growth Doesn't Require a Big Budget

The churches experiencing the most meaningful growth right now aren't the ones with the biggest advertising budgets. They're the ones with the most intentional systems for connecting people.

## Strategy 1: Fix Your Follow-Up Before You Spend on Outreach

There's no point filling a bucket with holes. Before investing in any outreach campaign, make sure your follow-up process is airtight. If you can't retain 40%+ of first-time visitors, more outreach will only accelerate disappointment.

## Strategy 2: Mobilize Your Members as Ambassadors

Your most powerful growth tool is already in the room every Sunday — your congregation. People trust referrals from friends far more than any advertisement. Build a simple "bring a friend" culture by celebrating stories of people who invited someone and saw them connect.

## Strategy 3: Create Irresistible On-Ramps

"Come to church" is a big ask for a non-churchgoer. Lower the barrier with entry-point events: a community cookout, a marriage workshop, a grief support group, a parenting class. These events let people experience your community without the commitment of a Sunday service.

## Strategy 4: Invest in Your Children's Ministry

Research consistently shows that families choose a church primarily based on the children's experience. A safe, engaging, warm children's ministry is one of the highest-ROI investments a church can make.

## Strategy 5: Build a Pipeline, Not Just a Service

A church that only offers Sunday services has one opportunity per week to connect with someone. Build a pipeline: Sunday service → small group → serving opportunity → leadership development. Each step deepens connection and reduces the likelihood of someone quietly walking out the back door.`,
  },
  {
    id: "8",
    title: "The Back Door Problem: Why Churches Grow Forward but Leak from Behind",
    excerpt:
      "Most church growth strategies focus on attracting new people. But the real growth killer is the back door — the quiet, steady exit of people who were never truly connected.",
    category: "church_growth",
    author_name: "StewardOS Team",
    published_date: "2026-01-28",
    read_time_minutes: 6,
    cover_image_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
    content: `## The Silent Epidemic in Church Growth

Most pastors focus on the front door — getting new people in. But the back door is where churches bleed.

The average church loses 6–8% of its congregation every year to what researchers call "silent attrition" — people who gradually attend less frequently, then stop entirely, without ever saying anything to anyone. For a church of 200, that's 12–16 people quietly walking out every year.

## Why People Leave Quietly

The back door isn't usually a dramatic exit. It's a gradual drift. The most common reasons:

- **They never felt truly connected** — They attended for months but didn't have a single meaningful relationship
- **Life got busy** — And no one noticed they were gone or reached out
- **They had an unmet need** — A struggle or season of doubt they never felt safe sharing

## How to Identify At-Risk Members

The warning signs of impending departure are almost always visible — if you're tracking the right things:

- Attendance frequency dropping from weekly to bi-weekly to monthly
- No involvement in any group, team, or ministry
- No record of pastoral contact in the last 60+ days
- A life transition (new baby, job change, move, loss) with no follow-up

## Closing the Back Door

**Track attendance patterns.** You can't manage what you don't measure.

**Create a care escalation protocol.** When someone misses two consecutive weeks, someone reaches out personally.

**Invest in small groups.** People who are in a small group are 70% less likely to leave the church.

**Make it easy to share struggles.** A culture where vulnerability is welcomed catches people before they drift, not after they're already gone.`,
  },
  {
    id: "9",
    title: "Small Groups Are Your Growth Engine: Here's How to Build Them Right",
    excerpt:
      "Healthy small groups are the single biggest predictor of long-term church retention. Here's how to launch, sustain, and multiply them in any size congregation.",
    category: "church_growth",
    author_name: "StewardOS Team",
    published_date: "2026-01-05",
    read_time_minutes: 8,
    cover_image_url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80",
    content: `## Why Small Groups Change Everything

The data is unambiguous: people who are in a small group are dramatically more likely to stay connected to the church, grow in their faith, and eventually serve and give.

Small groups aren't just a program — they're the infrastructure of genuine community. And genuine community is what turns a Sunday attendee into a lifelong member.

## The Most Common Small Group Mistakes

**Starting too many groups at once** — Quantity without quality kills small group culture. Start with 2–3 strong groups led by excellent leaders.

**No leader training** — An untrained small group leader can do more harm than good. Invest heavily in your leaders.

**Groups that never end** — Closed groups that run indefinitely become cliques. Design groups with a clear on-ramp, a defined duration, and a natural multiplication point.

**One-size-fits-all** — Offer groups organized by life stage, topic, geography, and interest — not just Bible study.

## Building Your Small Group System

**Phase 1: Identify and develop leaders (Months 1–2)**
Your first leaders should be people already demonstrating care and community-building. Cast vision. Train them. Walk with them.

**Phase 2: Launch pilot groups (Month 3)**
Start 2–3 groups with your strongest leaders. Attend sessions yourself. Learn what works.

**Phase 3: Celebrate and recruit (Months 4–6)**
Share stories from your pilot groups from the stage. Invite people to join. Recruit new leaders from within the groups.

**Phase 4: Multiply (Month 6+)**
Every healthy group should birth a new group. Train your leaders to identify and develop their own apprentice leaders.

## The Bottom Line

Churches with 50%+ of their congregation in small groups grow at twice the rate of churches without them. Connected people stay, invite others, and give — and unconnected people drift. Your investment in small groups is your investment in long-term church health.`,
  },
];

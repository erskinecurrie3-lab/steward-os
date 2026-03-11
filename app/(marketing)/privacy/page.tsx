export const metadata = {
  title: "Privacy Policy | StewardOS",
  description: "StewardOS privacy policy for church management platform.",
};

export default function PrivacyPage() {
  return (
    <div className="bg-white min-h-screen">
      <section className="py-16 max-w-3xl mx-auto px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-[#0A0A0A] mb-3">
          StewardOS Privacy Policy
        </h1>
        <p className="text-[#9CA3AF] text-sm mb-10">
          Effective Date: March 6, 2025
        </p>
        <div className="space-y-6 text-[#6B7280] leading-relaxed">
          <p>
            StewardOS (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) provides a church management platform that helps churches manage communication, events, volunteers, and member engagement.
          </p>
          <p>
            This Privacy Policy explains how we collect, use, and protect your information.
          </p>

          <div>
            <h2 className="text-lg font-bold text-[#0A0A0A] mb-2">1. Information We Collect</h2>
            <p className="mb-2">We may collect the following information:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Church affiliation</li>
              <li>Event registrations</li>
              <li>Communication preferences</li>
              <li>Technical information (IP address, browser, device data)</li>
            </ul>
            <p className="mt-2">Information is collected when you:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Register for church events</li>
              <li>Fill out visitor forms</li>
              <li>Join volunteer teams</li>
              <li>Subscribe to communications</li>
              <li>Interact with StewardOS powered services</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0A0A0A] mb-2">2. How Information Is Used</h2>
            <p className="mb-2">Your information may be used to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Send event reminders</li>
              <li>Coordinate volunteers</li>
              <li>Provide church updates</li>
              <li>Improve communication systems</li>
              <li>Provide platform support services</li>
            </ul>
            <p className="mt-2">StewardOS does <strong>not sell personal data to third parties</strong>.</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0A0A0A] mb-2">3. SMS Messaging Privacy</h2>
            <p className="mb-2">If you opt in to receive SMS communications:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Your phone number will only be used for church-related communication.</li>
              <li>SMS consent data is not shared with third parties for marketing purposes.</li>
              <li>SMS messages may include reminders, notifications, and ministry communications.</li>
            </ul>
            <p className="mt-2">Users may opt out at any time by replying:</p>
            <code className="block bg-gray-100 px-4 py-2 rounded-lg text-sm font-mono my-2">STOP</code>
            <p>For assistance reply:</p>
            <code className="block bg-gray-100 px-4 py-2 rounded-lg text-sm font-mono my-2">HELP</code>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0A0A0A] mb-2">4. Data Security</h2>
            <p>We implement industry-standard security practices to protect personal data, including secure data storage and encryption where appropriate.</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0A0A0A] mb-2">5. Data Retention</h2>
            <p>Information is retained only as long as necessary to provide services to participating churches.</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0A0A0A] mb-2">6. Third-Party Services</h2>
            <p>StewardOS integrates with trusted service providers including payment processors and communication platforms. These services operate under their own privacy policies.</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0A0A0A] mb-2">7. Children&apos;s Privacy</h2>
            <p>StewardOS services are intended for general church communication and are not directed toward children under the age of 13 without parental consent.</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0A0A0A] mb-2">8. Changes to this Policy</h2>
            <p>We may update this policy periodically. Updates will be posted on this page.</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0A0A0A] mb-2">9. Contact</h2>
            <p>For questions regarding this policy:</p>
            <a href="mailto:support@stewardos.cc" className="text-[#C9A84C] hover:text-[#A07830]">
              support@stewardos.cc
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

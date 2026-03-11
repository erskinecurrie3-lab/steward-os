export const metadata = {
  title: "Terms of Service | StewardOS",
  description: "StewardOS terms of service for church management platform.",
};

export default function TermsPage() {
  return (
    <div className="bg-white min-h-screen">
      <section className="py-16 max-w-3xl mx-auto px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-[#0A0A0A] mb-3">
          StewardOS Terms of Service
        </h1>
        <p className="text-[#9CA3AF] text-sm mb-10">
          Effective Date: March 6, 2025
        </p>
        <div className="space-y-6 text-[#6B7280] leading-relaxed">
          <p>
            StewardOS provides software tools designed to help churches manage communication, events, volunteers, and member engagement.
          </p>
          <p>
            By using the StewardOS platform, you agree to these terms.
          </p>

          <div>
            <h2 className="text-lg font-bold text-[#0A0A0A] mb-2">1. Platform Use</h2>
            <p>StewardOS may only be used by legitimate churches, ministries, and nonprofit organizations.</p>
            <p className="mt-2">Users agree not to use the platform for:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Spam messaging</li>
              <li>Purchased contact lists</li>
              <li>Unsolicited marketing</li>
              <li>Illegal activity</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0A0A0A] mb-2">2. Communication Features</h2>
            <p>StewardOS includes communication tools including email and SMS messaging.</p>
            <p className="mt-2">Organizations using these tools are responsible for ensuring recipients have provided consent to receive communications.</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0A0A0A] mb-2">3. Account Security</h2>
            <p>Users are responsible for maintaining the confidentiality of their account credentials.</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0A0A0A] mb-2">4. Service Availability</h2>
            <p>StewardOS strives to maintain reliable service but does not guarantee uninterrupted operation.</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0A0A0A] mb-2">5. Limitation of Liability</h2>
            <p>StewardOS is not liable for indirect or consequential damages resulting from use of the platform.</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0A0A0A] mb-2">6. Termination</h2>
            <p>We reserve the right to suspend or terminate accounts that violate these terms.</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0A0A0A] mb-2">7. Governing Law</h2>
            <p>These terms are governed by applicable United States law.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

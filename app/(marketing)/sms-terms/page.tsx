import Link from "next/link";

export const metadata = {
  title: "SMS Terms & Conditions | StewardOS",
  description: "SMS messaging terms for StewardOS church communication platform.",
};

export default function SmsTermsPage() {
  return (
    <div className="bg-white min-h-screen">
      <section className="py-16 max-w-3xl mx-auto px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-[#0A0A0A] mb-3">
          StewardOS SMS Messaging Terms & Conditions
        </h1>
        <p className="text-[#9CA3AF] text-sm mb-10">
          Effective Date: March 6, 2025
        </p>
        <div className="space-y-6 text-[#6B7280] leading-relaxed">
          <p>
            StewardOS provides SMS messaging services that allow churches and ministry organizations to communicate with their members, guests, volunteers, and staff.
          </p>
          <p>
            By opting in to receive SMS messages through StewardOS, you agree to the following terms.
          </p>

          <div>
            <h2 className="text-lg font-bold text-[#0A0A0A] mb-2">1. SMS Program Description</h2>
            <p className="mb-2">StewardOS enables churches to send text message communications related to church activities, including but not limited to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Event reminders</li>
              <li>Volunteer coordination</li>
              <li>Service schedule updates</li>
              <li>Visitor follow-up messages</li>
              <li>Member care communication</li>
              <li>Administrative notifications</li>
            </ul>
            <p className="mt-2">Messages are sent by the church or ministry organization you have an existing relationship with.</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0A0A0A] mb-2">2. Message Frequency</h2>
            <p>Message frequency may vary depending on church events, activities, and communication needs.</p>
            <p>Typical message volume ranges from <strong>1–10 messages per month</strong>, though this may vary.</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0A0A0A] mb-2">3. Opt-In Consent</h2>
            <p>By providing your mobile phone number and opting in through a church form, event registration, website signup, or SMS opt-in process, you consent to receive SMS messages from that organization via StewardOS.</p>
            <p>Consent is <strong>not a condition of any purchase or donation</strong>.</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0A0A0A] mb-2">4. Message & Data Rates</h2>
            <p>Message and data rates may apply depending on your mobile carrier plan.</p>
            <p>StewardOS and participating churches are not responsible for any carrier charges incurred.</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0A0A0A] mb-2">5. Opt-Out Instructions</h2>
            <p className="mb-2">You can opt out of SMS communications at any time.</p>
            <p className="mb-2">Reply:</p>
            <code className="block bg-gray-100 px-4 py-2 rounded-lg text-sm font-mono mb-2">STOP</code>
            <p className="mb-2">to any message to unsubscribe.</p>
            <p>After opting out, you will receive a confirmation message and will no longer receive SMS messages from that organization unless you opt in again.</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0A0A0A] mb-2">6. Help</h2>
            <p className="mb-2">For assistance, reply:</p>
            <code className="block bg-gray-100 px-4 py-2 rounded-lg text-sm font-mono mb-2">HELP</code>
            <p>or contact the church or organization that sent the message.</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0A0A0A] mb-2">7. Supported Carriers</h2>
            <p>SMS services are supported by most major U.S. carriers but delivery is not guaranteed.</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0A0A0A] mb-2">8. Privacy</h2>
            <p className="mb-2">Your privacy is important to us. Information collected through SMS communications is handled according to the StewardOS Privacy Policy.</p>
            <p>View the policy here:</p>
            <Link href="/privacy" className="text-[#C9A84C] hover:text-[#A07830] underline break-all">
              https://stewardos.cc/privacy
            </Link>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0A0A0A] mb-2">9. Changes to Terms</h2>
            <p>StewardOS may update these SMS Terms from time to time. Continued participation in SMS messaging constitutes acceptance of any updates.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

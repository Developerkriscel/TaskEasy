'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px 80px' }}>
        <Link
          href="/login"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            color: '#3b82f6',
            textDecoration: 'none',
            fontSize: 14,
            marginBottom: 24,
          }}
        >
          <ArrowLeft size={16} />
          Back to Login
        </Link>

        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
          Privacy Policy
        </h1>
        <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 32 }}>
          Last Updated: July 15, 2026
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 28, color: '#334155', fontSize: 14, lineHeight: 1.7 }}>
          <section>
            <p>
              Kriscel Tech Private Limited, a private limited company incorporated under the laws of
              India (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot; or &quot;our&quot;), manages
              and operates the TaskEasy platform, including the website, domain name, and any other
              linked pages, features, content, mobile applications or any other services we offer
              from time to time (collectively the &quot;Platform&quot;) which is an online platform
              that enables users to manage tasks, projects, team collaboration, and allied services.
            </p>
          </section>

          <section>
            <p>
              All users of the Platform are advised to read and understand our Privacy Policy and
              Terms &amp; Conditions carefully before registering, accessing or using the Platform.
              By giving your consent for accessing the Platform, you expressly consent to our
              collection, storage, use and disclosure of the Information in accordance with the terms
              of this Privacy Policy, as amended from time to time. This Privacy Policy does not
              apply to the websites of our business partners, corporate affiliates or to any other
              third party, even if their websites are linked to our site.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#0f172a', marginBottom: 10 }}>
              1. Information We Collect
            </h2>

            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1e293b', marginBottom: 6 }}>
              Personal Information
            </h3>
            <p>
              As part of the registration process, the Company may collect the following personally
              identifiable information:
            </p>
            <ul style={{ paddingLeft: 20, marginTop: 8 }}>
              <li>Name (including name of the entity and/or its representative)</li>
              <li>Email address</li>
              <li>Mobile phone number and contact details</li>
              <li>Organization name and details</li>
              <li>Demographic profile (age, gender, occupation, address, etc.)</li>
            </ul>

            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1e293b', marginTop: 16, marginBottom: 6 }}>
              Non-Personal Information
            </h3>
            <p>
              When you visit the Platform, we may collect certain non-personal information such as
              your internet protocol address, operating system, browser type, internet service
              provider, pages visited, links clicked, and browsing information. We may also collect
              information about the services that you use and how you use them, including log-in
              information, task data, and location information.
            </p>

            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1e293b', marginTop: 16, marginBottom: 6 }}>
              Automatic Information
            </h3>
            <p>
              We may use online identifiers like &quot;cookies&quot; and similar electronic tools to
              collect information to understand your individual interests for analytics. These server
              logs may include information such as your web request, IP address, browser type,
              browser language, the date and time of your request, and cookies that may uniquely
              identify your browser.
            </p>

            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1e293b', marginTop: 16, marginBottom: 6 }}>
              Mobile Device Information
            </h3>
            <p>
              When you use the Platform through your mobile device, we may receive information about
              your location and device, including a unique identifier number, device model,
              manufacturer, operating system, version information, and IP address.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#0f172a', marginBottom: 10 }}>
              2. How We Use Your Information
            </h2>
            <p>The Company will process your Information in the following manners:</p>
            <ul style={{ paddingLeft: 20, marginTop: 8 }}>
              <li>To provide personalized features and services on the Platform;</li>
              <li>To provide your information to business associates and partners when necessary to deliver services;</li>
              <li>For product improvement and customer communication;</li>
              <li>To provide services requested by you;</li>
              <li>To improve our services;</li>
              <li>To enforce our Terms &amp; Conditions;</li>
              <li>To protect the security or integrity of the Platform, our business, and users;</li>
              <li>To prevent, detect, and investigate crimes, fraud, or violations;</li>
              <li>For identity verification and due diligence checks;</li>
              <li>To conduct surveys and collect feedback about our services.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#0f172a', marginBottom: 10 }}>
              3. Information Sharing
            </h2>
            <p>
              The Company will not use your information for any purpose other than to provide its
              services. We do not rent, sell or share your personal information and will not disclose
              any personally identifiable information to third parties, except:
            </p>
            <ul style={{ paddingLeft: 20, marginTop: 8 }}>
              <li>When we have your permission to provide products or services you&apos;ve requested;</li>
              <li>On an aggregate basis with partners or third parties where necessary to provide services;</li>
              <li>To investigate, prevent or take action regarding unlawful activities or suspected fraud;</li>
              <li>For compliance with subpoenas, court orders, or law enforcement requests;</li>
              <li>For internal analytical and research purposes;</li>
              <li>In the event of reorganization, merger, sale, or transfer of business assets.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#0f172a', marginBottom: 10 }}>
              4. Your Choices
            </h2>
            <p>
              The Company has appropriate electronic and managerial procedures to protect against
              loss, misuse and alteration of your Information. You can at any time withdraw consent
              for collection and use of your Personal Information, but you may not be eligible to use
              our Platform if you do so. Your decision to withdraw consent will not affect the
              processing of Personal Information based on your previous consent.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#0f172a', marginBottom: 10 }}>
              5. Cookies
            </h2>
            <p>
              The Company uses cookies to personalize your experience on the Platform. Cookies are
              small pieces of information stored by your browser on your device. We use cookies
              primarily for user authentication and to improve the quality of our service. You can
              control and manage cookies in various ways through your browser settings.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#0f172a', marginBottom: 10 }}>
              6. Data Security
            </h2>
            <p>
              We make measures to protect your sensitive information. However, transmissions made by
              means of the internet cannot be made absolutely secure. By using the Platform, you
              agree that the Company will have no liability for disclosure of Information due to
              errors in transmission or unauthorized acts of third parties.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#0f172a', marginBottom: 10 }}>
              7. Children&apos;s Privacy
            </h2>
            <p>
              The Platform and its contents are not targeted to minors (those under the age of 18).
              If you have reason to believe that a minor child has provided Personal Information to
              us, please contact our Grievance Officer and we will endeavor to delete that
              information.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#0f172a', marginBottom: 10 }}>
              8. Third-Party Links
            </h2>
            <p>
              The Platform may include links to third-party websites. Such third-party sites are
              governed by their respective privacy policies, which are beyond our control. We do not
              provide any Personal Information to third-party websites without your consent.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#0f172a', marginBottom: 10 }}>
              9. Data Retention &amp; Revocation
            </h2>
            <p>
              We shall be entitled to retain your Information for as long as needed or permitted in
              light of the purpose(s) for which it was obtained and consistent with applicable law.
              If you wish to review, delete, or revoke consent for your personal information, you may
              write to us at the contact details provided below.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#0f172a', marginBottom: 10 }}>
              10. Push Notifications
            </h2>
            <p>
              We may request to send you push notifications regarding your account or the
              application. If you wish to opt-out, you may turn it off in your device&apos;s
              settings.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#0f172a', marginBottom: 10 }}>
              11. Policy Updates
            </h2>
            <p>
              The Company reserves the right to change, amend, modify or update this Privacy Policy
              at any time without any prior notice. Such changes shall be effective immediately upon
              posting to the Platform. We encourage you to review the Privacy Policy whenever you
              visit the Platform.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#0f172a', marginBottom: 10 }}>
              12. Grievance Redressal
            </h2>
            <p>
              If there are any questions regarding this Privacy Policy, please write to our Grievance
              Officer. The Grievance Officer shall acknowledge the complaint within 72 hours and
              redress the complaints within 15 days from the date of receipt.
            </p>
            <div style={{ background: '#f1f5f9', borderRadius: 8, padding: 16, marginTop: 12 }}>
              <p style={{ margin: 0, fontWeight: 600 }}>Grievance Officer</p>
              <p style={{ margin: '4px 0 0' }}>Kriscel Tech Pvt. Ltd.</p>
              <p style={{ margin: '4px 0 0' }}>Phone: +91 8985419420</p>
              <p style={{ margin: '4px 0 0' }}>Email: Info@kriscel.com</p>
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#0f172a', marginBottom: 10 }}>
              13. Jurisdiction
            </h2>
            <p>
              Any kind of dispute arising out of the Platform and its users will be governed in
              accordance with Indian Law. If for any reason, any part of the provision of this
              Privacy Policy is deemed invalid, the remaining which is valid will be put to use.
            </p>
            <p style={{ marginTop: 12 }}>Thank you for using TaskEasy!</p>
          </section>
        </div>

        <footer style={{
          marginTop: 48,
          paddingTop: 24,
          borderTop: '1px solid #e2e8f0',
          fontSize: 12,
          color: '#94a3b8',
          textAlign: 'center',
        }}>
          COPYRIGHT &copy; 2026 &ndash; Kriscel Tech Pvt. Ltd., India
        </footer>
      </div>
    </div>
  );
}

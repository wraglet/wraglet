import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Wraglet',
  description:
    'Learn how Wraglet protects your privacy and personal information. Read our comprehensive privacy policy covering data collection, usage, and your rights.',
  openGraph: {
    title: 'Privacy Policy | Wraglet',
    description:
      'Learn how Wraglet protects your privacy and personal information. Read our comprehensive privacy policy covering data collection, usage, and your rights.',
    type: 'website'
  },
  twitter: {
    title: 'Privacy Policy | Wraglet',
    description:
      'Learn how Wraglet protects your privacy and personal information. Read our comprehensive privacy policy covering data collection, usage, and your rights.'
  }
}

const PrivacyPolicyPage = () => (
  <div className="space-y-8">
    <div>
      <h1 className="mb-4 text-3xl font-bold text-[#0EA5E9]">Privacy Policy</h1>
      <p className="mb-6 text-sm text-gray-500 italic">
        Last updated: May 2025
      </p>
      <p className="text-lg text-gray-700">
        Wraglet values your privacy and is committed to protecting your personal
        information. This Privacy Policy explains how we collect, use, and
        safeguard your data.
      </p>
    </div>

    <div className="space-y-6">
      <section>
        <h2 className="mb-3 text-xl font-semibold text-[#0EA5E9]">
          1. Information We Collect
        </h2>
        <ul className="ml-4 list-inside list-disc space-y-2 text-gray-700">
          <li>
            <strong className="text-gray-900">Account Information:</strong>{' '}
            Name, email address, and profile details
          </li>
          <li>
            <strong className="text-gray-900">Usage Data:</strong> Interactions,
            device information, and log data
          </li>
          <li>
            <strong className="text-gray-900">Cookies:</strong> For
            authentication and analytics
          </li>
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-[#0EA5E9]">
          2. How We Use Your Information
        </h2>
        <ul className="ml-4 list-inside list-disc space-y-2 text-gray-700">
          <li>To provide and improve Wraglet services</li>
          <li>To personalize your experience</li>
          <li>To communicate with you about updates and support</li>
          <li>To ensure platform safety and security</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-[#0EA5E9]">
          3. Sharing Your Information
        </h2>
        <p className="text-gray-700">
          We do not sell your personal information. We may share data with
          trusted service providers for platform functionality, or if required
          by law.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-[#0EA5E9]">
          4. Your Rights
        </h2>
        <p className="mb-3 text-gray-700">
          You may access, update, or delete your personal information at any
          time by visiting your account settings. You may also contact us at{' '}
          <a
            href="mailto:privacy@wraglet.com"
            className="font-medium text-[#0EA5E9] hover:underline"
          >
            privacy@wraglet.com
          </a>
          .
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-[#0EA5E9]">
          5. Data Security
        </h2>
        <p className="text-gray-700">
          We implement industry-standard security measures to protect your data.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-[#0EA5E9]">
          6. Changes to This Policy
        </h2>
        <p className="text-gray-700">
          We may update this Privacy Policy periodically. We will notify you of
          significant changes via the platform or email.
        </p>
      </section>
    </div>

    <div className="border-t border-gray-200 pt-6">
      <p className="text-sm text-gray-500 italic">
        Your trust is important to us. Thank you for using Wraglet!
      </p>
    </div>
  </div>
)

export default PrivacyPolicyPage

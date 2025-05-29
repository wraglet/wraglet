import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy | Wraglet',
  description:
    'Understand how Wraglet uses cookies and similar technologies. Learn about cookie types, management options, and your privacy choices.',
  openGraph: {
    title: 'Cookie Policy | Wraglet',
    description:
      'Understand how Wraglet uses cookies and similar technologies. Learn about cookie types, management options, and your privacy choices.',
    type: 'website'
  },
  twitter: {
    title: 'Cookie Policy | Wraglet',
    description:
      'Understand how Wraglet uses cookies and similar technologies. Learn about cookie types, management options, and your privacy choices.'
  }
}

const CookiePolicyPage = () => (
  <div className="space-y-8">
    <div>
      <h1 className="mb-4 text-3xl font-bold text-[#0EA5E9]">Cookie Policy</h1>
      <p className="mb-6 text-sm text-gray-500 italic">
        Last updated: May 2025
      </p>
      <p className="text-lg text-gray-700">
        Wraglet uses cookies and similar technologies to enhance your experience
        on our platform. This Cookie Policy explains what cookies are, how we
        use them, and your choices regarding cookies.
      </p>
    </div>

    <div className="space-y-6">
      <section>
        <h2 className="mb-3 text-xl font-semibold text-[#0EA5E9]">
          1. What Are Cookies?
        </h2>
        <p className="text-gray-700">
          Cookies are small text files stored on your device when you visit a
          website. They help us remember your preferences and improve your
          experience.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-[#0EA5E9]">
          2. How We Use Cookies
        </h2>
        <ul className="ml-4 list-inside list-disc space-y-2 text-gray-700">
          <li>
            <strong className="text-gray-900">Authentication:</strong> To keep
            you logged in
          </li>
          <li>
            <strong className="text-gray-900">Preferences:</strong> To remember
            your settings
          </li>
          <li>
            <strong className="text-gray-900">Analytics:</strong> To understand
            how you use Wraglet
          </li>
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-[#0EA5E9]">
          3. Managing Cookies
        </h2>
        <p className="text-gray-700">
          You can control or delete cookies through your browser settings.
          Disabling cookies may affect your ability to use certain features of
          Wraglet.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-[#0EA5E9]">
          4. Third-Party Cookies
        </h2>
        <p className="text-gray-700">
          Some third-party services integrated with Wraglet may use their own
          cookies. We do not control these cookies.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-[#0EA5E9]">
          5. Changes to This Policy
        </h2>
        <p className="text-gray-700">
          We may update this Cookie Policy from time to time. Please review it
          periodically for changes.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-[#0EA5E9]">
          6. Contact
        </h2>
        <p className="text-gray-700">
          For questions about our use of cookies, contact us at{' '}
          <a
            href="mailto:privacy@wraglet.com"
            className="font-medium text-[#0EA5E9] hover:underline"
          >
            privacy@wraglet.com
          </a>
          .
        </p>
      </section>
    </div>

    <div className="border-t border-gray-200 pt-6">
      <p className="text-sm text-gray-500 italic">
        By using Wraglet, you consent to our use of cookies as described above.
      </p>
    </div>
  </div>
)

export default CookiePolicyPage

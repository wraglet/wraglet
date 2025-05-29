import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Help | Wraglet',
  description:
    'Get help with your Wraglet account. Find answers to frequently asked questions about creating accounts, resetting passwords, and reporting content.',
  openGraph: {
    title: 'Help | Wraglet',
    description:
      'Get help with your Wraglet account. Find answers to frequently asked questions about creating accounts, resetting passwords, and reporting content.',
    type: 'website'
  },
  twitter: {
    title: 'Help | Wraglet',
    description:
      'Get help with your Wraglet account. Find answers to frequently asked questions about creating accounts, resetting passwords, and reporting content.'
  }
}

const HelpPage = () => (
  <div className="space-y-8">
    <div>
      <h1 className="mb-4 text-3xl font-bold text-[#0EA5E9]">Help</h1>
      <p className="mb-6 text-lg text-gray-700">
        Welcome to Wraglet Help Center!
      </p>
      <p className="mb-8 text-gray-600">
        Wraglet is your trusted platform for sharing, connecting, and
        discovering new communities. If you have questions or need assistance,
        you&apos;re in the right place.
      </p>
    </div>

    <div>
      <h2 className="mb-6 text-2xl font-semibold text-[#0EA5E9]">
        Frequently Asked Questions
      </h2>

      <div className="space-y-6">
        <div className="rounded-lg bg-blue-50 p-6">
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            How do I create an account?
          </h3>
          <p className="text-gray-700">
            Click the Sign Up button on the homepage and follow the
            instructions. You&apos;ll need a valid email address and to agree to
            our Terms of Service.
          </p>
        </div>

        <div className="rounded-lg bg-blue-50 p-6">
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            How do I reset my password?
          </h3>
          <p className="text-gray-700">
            Use the &ldquo;Forgot Password&rdquo; link on the login page.
            We&apos;ll send you an email with instructions to reset your
            password securely.
          </p>
        </div>

        <div className="rounded-lg bg-blue-50 p-6">
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            How do I report inappropriate content?
          </h3>
          <p className="text-gray-700">
            Click the three dots on any post or message and select
            &ldquo;Report&rdquo;. Our moderation team will review your report
            promptly.
          </p>
        </div>
      </div>
    </div>

    <div>
      <h2 className="mb-4 text-2xl font-semibold text-[#0EA5E9]">
        Contact Support
      </h2>
      <p className="mb-4 text-gray-700">
        If you need further assistance, please contact us at{' '}
        <a
          href="mailto:support@wraglet.com"
          className="font-medium text-[#0EA5E9] hover:underline"
        >
          support@wraglet.com
        </a>
        .
      </p>
    </div>

    <div className="border-t border-gray-200 pt-6">
      <p className="text-sm text-gray-500 italic">
        Wraglet is committed to providing a safe and welcoming environment for
        all users. For more information, please review our Terms of Service and
        Privacy Policy.
      </p>
    </div>
  </div>
)

export default HelpPage

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Advertising | Wraglet',
  description:
    "Learn about Wraglet's advertising policies and practices. Understand how we work with brands while protecting your privacy and maintaining transparency.",
  openGraph: {
    title: 'Advertising | Wraglet',
    description:
      "Learn about Wraglet's advertising policies and practices. Understand how we work with brands while protecting your privacy and maintaining transparency.",
    type: 'website'
  },
  twitter: {
    title: 'Advertising | Wraglet',
    description:
      "Learn about Wraglet's advertising policies and practices. Understand how we work with brands while protecting your privacy and maintaining transparency."
  }
}

const AdvertisingPage = () => (
  <div className="space-y-8">
    <div>
      <h1 className="mb-4 text-3xl font-bold text-[#0EA5E9]">Advertising</h1>
      <p className="mb-6 text-sm text-gray-500 italic">
        Last updated: May 2025
      </p>
      <p className="text-lg text-gray-700">
        Wraglet offers advertising opportunities to help brands connect with our
        vibrant community. This page outlines our advertising policies and
        practices.
      </p>
    </div>

    <div className="space-y-6">
      <section>
        <h2 className="mb-3 text-xl font-semibold text-[#0EA5E9]">
          1. Advertising Guidelines
        </h2>
        <p className="text-gray-700">
          All advertisements must comply with applicable laws and Wraglet&apos;s
          community standards. We do not allow ads that are misleading,
          offensive, or promote illegal activities.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-[#0EA5E9]">
          2. Data Usage
        </h2>
        <p className="text-gray-700">
          We may use non-personal, aggregated data to help advertisers reach
          relevant audiences. Personal information is never sold to advertisers.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-[#0EA5E9]">
          3. Sponsored Content
        </h2>
        <p className="text-gray-700">
          Sponsored posts and ads are clearly labeled. We strive for
          transparency in all advertising relationships.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-[#0EA5E9]">
          4. Ad Choices
        </h2>
        <p className="mb-3 text-gray-700">
          You can manage your ad preferences in your account settings. For more
          information, contact us at{' '}
          <a
            href="mailto:ads@wraglet.com"
            className="font-medium text-[#0EA5E9] hover:underline"
          >
            ads@wraglet.com
          </a>
          .
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-[#0EA5E9]">
          5. Changes to Advertising Policy
        </h2>
        <p className="text-gray-700">
          We may update our advertising policies from time to time. Continued
          use of Wraglet constitutes acceptance of these changes.
        </p>
      </section>
    </div>

    <div className="border-t border-gray-200 pt-6">
      <p className="text-sm text-gray-500 italic">
        Wraglet is committed to responsible and transparent advertising
        practices.
      </p>
    </div>
  </div>
)

export default AdvertisingPage

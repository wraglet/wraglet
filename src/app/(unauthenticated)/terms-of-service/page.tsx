import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | Wraglet',
  description:
    "Read Wraglet's Terms of Service. Understand your rights and responsibilities when using our social platform for meaningful connections.",
  openGraph: {
    title: 'Terms of Service | Wraglet',
    description:
      "Read Wraglet's Terms of Service. Understand your rights and responsibilities when using our social platform for meaningful connections.",
    type: 'website'
  },
  twitter: {
    title: 'Terms of Service | Wraglet',
    description:
      "Read Wraglet's Terms of Service. Understand your rights and responsibilities when using our social platform for meaningful connections."
  }
}

const TermsOfServicePage = () => (
  <div className="space-y-8">
    <div>
      <h1 className="mb-4 text-3xl font-bold text-[#0EA5E9]">
        Terms of Service
      </h1>
      <p className="mb-6 text-sm text-gray-500 italic">
        Last updated: May 2025
      </p>
      <p className="text-lg text-gray-700">
        Welcome to Wraglet! By accessing or using our platform, you agree to
        comply with and be bound by these Terms of Service
        (&ldquo;Terms&rdquo;). Please read them carefully.
      </p>
    </div>

    <div className="space-y-6">
      <section>
        <h2 className="mb-3 text-xl font-semibold text-[#0EA5E9]">
          1. Acceptance of Terms
        </h2>
        <p className="text-gray-700">
          By using Wraglet, you agree to these Terms and our Privacy Policy. If
          you do not agree, please do not use our services.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-[#0EA5E9]">
          2. Eligibility
        </h2>
        <p className="text-gray-700">
          You must be at least 13 years old to use Wraglet. By using the
          platform, you represent and warrant that you meet this requirement.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-[#0EA5E9]">
          3. User Conduct
        </h2>
        <p className="mb-3 text-gray-700">You agree not to:</p>
        <ul className="ml-4 list-inside list-disc space-y-2 text-gray-700">
          <li>Violate any applicable laws or regulations</li>
          <li>Post harmful, abusive, or illegal content</li>
          <li>Infringe on the rights of others</li>
          <li>Attempt to gain unauthorized access to Wraglet systems</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-[#0EA5E9]">
          4. Content Ownership
        </h2>
        <p className="text-gray-700">
          You retain ownership of the content you post, but grant Wraglet a
          non-exclusive, worldwide, royalty-free license to use, display, and
          distribute your content on the platform.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-[#0EA5E9]">
          5. Termination
        </h2>
        <p className="text-gray-700">
          Wraglet reserves the right to suspend or terminate your account for
          violations of these Terms or for any reason at our discretion.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-[#0EA5E9]">
          6. Disclaimers
        </h2>
        <p className="text-gray-700">
          Wraglet is provided &ldquo;as is&rdquo; without warranties of any
          kind. We do not guarantee the accuracy or reliability of any content.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-[#0EA5E9]">
          7. Limitation of Liability
        </h2>
        <p className="text-gray-700">
          Wraglet is not liable for any indirect, incidental, or consequential
          damages arising from your use of the platform.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-[#0EA5E9]">
          8. Changes to Terms
        </h2>
        <p className="text-gray-700">
          We may update these Terms from time to time. Continued use of Wraglet
          constitutes acceptance of the revised Terms.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-[#0EA5E9]">
          9. Contact
        </h2>
        <p className="text-gray-700">
          For questions about these Terms, contact us at{' '}
          <a
            href="mailto:legal@wraglet.com"
            className="font-medium text-[#0EA5E9] hover:underline"
          >
            legal@wraglet.com
          </a>
          .
        </p>
      </section>
    </div>

    <div className="border-t border-gray-200 pt-6">
      <p className="text-sm text-gray-500 italic">
        Thank you for being part of the Wraglet community!
      </p>
    </div>
  </div>
)

export default TermsOfServicePage

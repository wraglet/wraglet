import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Community Guidelines | Wraglet',
  description:
    'Wraglet Community Guidelines — standards for safe, respectful participation on our platform.',
  openGraph: {
    title: 'Community Guidelines | Wraglet',
    description:
      'Wraglet Community Guidelines — standards for safe, respectful participation on our platform.',
    type: 'website'
  },
  twitter: {
    title: 'Community Guidelines | Wraglet',
    description:
      'Wraglet Community Guidelines — standards for safe, respectful participation on our platform.'
  }
}

const CommunityGuidelinesPage = () => (
  <div className="space-y-8">
    <div>
      <h1 className="mb-4 text-3xl font-bold text-[#0EA5E9]">
        Community Guidelines
      </h1>
      <p className="mb-6 text-sm text-gray-500 italic">
        Last updated: June 2026
      </p>
      <p className="text-lg text-gray-700">
        Wraglet is built for meaningful connection. These guidelines explain
        what we expect from everyone who posts, comments, and messages on the
        platform. They extend our{' '}
        <Link
          href="/terms-of-service"
          className="font-medium text-[#0EA5E9] hover:underline"
        >
          Terms of Service
        </Link>
        .
      </p>
    </div>

    <div className="space-y-6">
      <section>
        <h2 className="mb-3 text-xl font-semibold text-[#0EA5E9]">
          1. Be respectful
        </h2>
        <p className="text-gray-700">
          Do not harass, threaten, or target others with hate speech. Treat
          people the way you would in a real conversation.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-[#0EA5E9]">
          2. Keep public spaces family-friendly
        </h2>
        <p className="mb-3 text-gray-700">
          Profanity, slurs, and sexually explicit language are not allowed on
          public surfaces — including posts, comments, bios, blogs, and direct
          messages.
        </p>
        <p className="text-gray-700">
          Nudity and pornography are prohibited. We have zero tolerance for
          child sexual abuse material (CSAM). If you encounter CSAM, report it
          immediately and contact law enforcement in your jurisdiction.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-[#0EA5E9]">
          3. No harmful links or malware
        </h2>
        <p className="text-gray-700">
          Do not share phishing links, malware, or URLs to adult sites. Links
          that attempt to trick users or compromise devices will be removed and
          may result in account action.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-[#0EA5E9]">
          4. Video and media
        </h2>
        <ul className="ml-4 list-inside list-disc space-y-2 text-gray-700">
          <li>Feed videos may be up to 10 minutes long.</li>
          <li>Do not upload executable files disguised as media.</li>
          <li>
            Images and videos are scanned automatically before publication.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-[#0EA5E9]">
          5. Reporting and enforcement
        </h2>
        <p className="mb-3 text-gray-700">
          Use the Report option on posts to flag content that violates these
          guidelines. Our moderation team reviews reports and flagged content.
        </p>
        <p className="text-gray-700">
          Repeated violations may result in warnings, temporary upload
          restrictions, or account suspension.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-[#0EA5E9]">
          6. Contact
        </h2>
        <p className="text-gray-700">
          Questions about these guidelines? Email{' '}
          <a
            href="mailto:trust@wraglet.com"
            className="font-medium text-[#0EA5E9] hover:underline"
          >
            trust@wraglet.com
          </a>
          .
        </p>
      </section>
    </div>
  </div>
)

export default CommunityGuidelinesPage

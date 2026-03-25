import Link from 'next/link'

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <div className="text-center py-20">
        <h1 className="text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          Rate Every Rally.{' '}
          <span style={{ color: 'var(--accent)' }}>Review Every Match.</span>
        </h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
          The social platform for tennis fans. Rate matches, review players, and discover the greatest tennis across ATP, WTA, and Grand Slams.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/auth/signup"
            className="px-8 py-3 rounded-lg font-semibold text-lg transition"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-primary)' }}
          >
            Get Started
          </Link>
          <Link
            href="/matches"
            className="px-8 py-3 rounded-lg font-semibold text-lg border transition"
            style={{ color: 'var(--text-primary)', borderColor: 'var(--border)' }}
          >
            Browse Matches
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-12">
        {[
          {
            icon: '🎾',
            title: 'Rate Matches',
            description: 'Score matches 1-10 across entertainment, level of play, umpiring, and crowd atmosphere.',
          },
          {
            icon: '✍️',
            title: 'Write Reviews',
            description: 'Share your take on epic matches. Read what other fans thought about Wimbledon classics.',
          },
          {
            icon: '👥',
            title: 'Follow Fans',
            description: 'Build your tennis community. Follow fans with great taste and discover hidden gems.',
          },
        ].map((feature) => (
          <div
            key={feature.title}
            className="p-6 rounded-xl border"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
          >
            <div className="text-4xl mb-4">{feature.icon}</div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              {feature.title}
            </h3>
            <p style={{ color: 'var(--text-secondary)' }}>{feature.description}</p>
          </div>
        ))}
      </div>

      {/* CTA Section */}
      <div
        className="text-center py-16 rounded-2xl my-8"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', border: '1px solid' }}
      >
        <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          Ready to join?
        </h2>
        <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
          Start rating matches today. Free forever.
        </p>
        <Link
          href="/auth/signup"
          className="px-8 py-3 rounded-lg font-semibold text-lg transition"
          style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-primary)' }}
        >
          Create your account
        </Link>
      </div>
    </div>
  )
}

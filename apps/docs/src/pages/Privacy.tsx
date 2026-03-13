export default function Privacy() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Last updated: March 13, 2026
        </p>
      </div>

      <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">Overview</h2>
          <p className="text-slate-600 dark:text-slate-400">
            ReelKit is an open-source software library. This privacy policy
            applies to the documentation website at reelkit.dev. We are
            committed to keeping things simple: we collect no personal data.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">What We Don't Collect</h2>
          <ul className="list-disc pl-6 space-y-2 text-slate-600 dark:text-slate-400">
            <li>No cookies or tracking pixels</li>
            <li>No analytics or usage tracking</li>
            <li>No user accounts or personal information</li>
            <li>No advertising or third-party marketing tools</li>
            <li>No IP address logging beyond standard server access logs</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Third-Party Services</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            This website is hosted as a static site. The only external resources
            loaded are:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-slate-600 dark:text-slate-400">
            <li>
              <strong>Google Fonts</strong> (Inter, Source Code Pro) — subject
              to{' '}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 dark:text-primary-400 hover:underline"
              >
                Google's Privacy Policy
              </a>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">npm Packages</h2>
          <p className="text-slate-600 dark:text-slate-400">
            The ReelKit libraries (@reelkit/core, @reelkit/react,
            @reelkit/react-reel-player, @reelkit/react-lightbox) are distributed
            via npm. Installing or using these packages does not transmit any
            data to us. The packages contain no telemetry, analytics, or
            phone-home functionality.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Open Source</h2>
          <p className="text-slate-600 dark:text-slate-400">
            ReelKit is MIT licensed. The source code for both the library and
            this documentation site is publicly available for inspection on
            GitHub.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Changes</h2>
          <p className="text-slate-600 dark:text-slate-400">
            If this policy changes, we will update the "Last updated" date
            above. Since we collect no data, meaningful changes are unlikely.
          </p>
        </section>
      </div>
    </div>
  );
}

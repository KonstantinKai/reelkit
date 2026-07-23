import { PublishedPackageList } from '../components/ui/PublishedPackageList';

export default function Privacy() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Last updated: July 22, 2026
        </p>
      </div>

      <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">Overview</h2>
          <p className="text-slate-600 dark:text-slate-400">
            ReelKit is an open-source software library. This privacy policy
            applies to the documentation website at reelkit.dev. There are no
            accounts, no cookies, and nothing here that identifies you
            personally. The site does measure aggregate traffic, and the section
            below describes exactly what that involves.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Analytics</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            This site runs{' '}
            <a
              href="https://plausible.io/privacy-focused-web-analytics"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 dark:text-primary-400 hover:underline"
            >
              Plausible
            </a>
            , a cookieless analytics script, on our own server rather than
            through a third-party analytics provider. It sends:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-slate-600 dark:text-slate-400">
            <li>The page URL you visited and the referring page, if any</li>
            <li>
              How far down the page you scrolled and how long you stayed on it
            </li>
            <li>The destination of any outbound link you click</li>
            <li>
              An event when you open a code example in StackBlitz, recording the
              example's title and framework
            </li>
          </ul>
          <p className="text-slate-600 dark:text-slate-400 mt-4">
            No cookie is set and no visitor identifier is sent with these
            measurements, so nothing here follows you across other sites. The
            result is a visitor count and a list of popular pages, which is what
            we use to decide what to document next.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Opting Out</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            The analytics script skips any browser that carries an opt-out flag.
            To set it, run this once in your browser's developer console:
          </p>
          <pre className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 overflow-x-auto text-sm">
            <code className="font-mono text-slate-800 dark:text-slate-200">
              localStorage.plausible_ignore = 'true'
            </code>
          </pre>
          <p className="text-slate-600 dark:text-slate-400 mt-4">
            The flag is stored in your browser and applies to this site only. A
            content blocker that blocks analytics requests works equally well.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">What We Don't Collect</h2>
          <ul className="list-disc pl-6 space-y-2 text-slate-600 dark:text-slate-400">
            <li>No cookies or tracking pixels</li>
            <li>No user accounts or personal information</li>
            <li>No advertising or third-party marketing tools</li>
            <li>No cross-site tracking or visitor profiles</li>
            <li>No IP address logging beyond standard server access logs</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Third-Party Services</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            This website is served as a static site. Beyond the analytics
            endpoint described above, your browser reaches these origins:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-slate-600 dark:text-slate-400">
            <li>
              <strong>Google Fonts</strong> (
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                fonts.googleapis.com
              </code>
              ,{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                fonts.gstatic.com
              </code>
              ) — loads the Inter and Source Code Pro typefaces on every page,
              subject to{' '}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 dark:text-primary-400 hover:underline"
              >
                Google's Privacy Policy
              </a>
            </li>
            <li>
              <strong>GitHub</strong> (
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                api.github.com
              </code>
              ) — read when you first open the site, then cached in your browser
              for an hour, to show the repository's star count, subject to{' '}
              <a
                href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 dark:text-primary-400 hover:underline"
              >
                GitHub's Privacy Statement
              </a>
            </li>
            <li>
              <strong>ReelKit CDN</strong> (
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                cdn.reelkit.dev
              </code>
              ) — our own infrastructure, serving the images and video used in
              the live demos
            </li>
            <li>
              <strong>StackBlitz</strong> (
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                stackblitz.com
              </code>
              ) — reached only when you click "Open in StackBlitz", which sends
              that example's code to a new tab, subject to{' '}
              <a
                href="https://stackblitz.com/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 dark:text-primary-400 hover:underline"
              >
                StackBlitz's Privacy Policy
              </a>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">npm Packages</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            The ReelKit libraries are distributed via npm. Installing or using
            any of them transmits no data to us — the packages contain no
            telemetry, analytics, or phone-home functionality. Nothing on this
            page applies to them; it describes this website only.
          </p>
          <PublishedPackageList />
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Open Source</h2>
          <p className="text-slate-600 dark:text-slate-400">
            ReelKit is MIT licensed. The source code for both the library and
            this documentation site is publicly available for inspection on
            GitHub — including the analytics setup described above.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Changes</h2>
          <p className="text-slate-600 dark:text-slate-400">
            If this policy changes, we will update the "Last updated" date
            above.
          </p>
        </section>
      </div>
    </div>
  );
}

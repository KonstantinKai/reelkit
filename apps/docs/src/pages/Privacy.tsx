import { PublishedPackageList } from '../components/ui/PublishedPackageList';

export default function Privacy() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Last updated: October 20, 2026
        </p>
      </div>

      <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">Overview</h2>
          <p className="text-slate-600 dark:text-slate-400">
            ReelKit is an open-source software library. This privacy policy
            applies to the documentation website at reelkit.dev. There are no
            accounts, no tracking cookies, and nothing here that identifies you
            personally. The site does measure aggregate traffic, and the section
            below describes exactly what that involves.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Analytics</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            This site runs{' '}
            <a
              href="https://www.cloudflare.com/web-analytics/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 dark:text-primary-400 hover:underline"
            >
              Cloudflare Web Analytics
            </a>
            , a cookieless analytics script loaded from{' '}
            <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
              static.cloudflareinsights.com
            </code>
            . When a page loads, it sends Cloudflare:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-slate-600 dark:text-slate-400">
            <li>The page URL you visited and the referring page, if any</li>
            <li>
              Your browser and operating system, as your browser names them
            </li>
            <li>
              The country you are browsing from, worked out from your IP
              address, which is not stored
            </li>
            <li>
              How quickly the page loaded and settled, the measurements known as
              Core Web Vitals
            </li>
          </ul>
          <p className="text-slate-600 dark:text-slate-400 mt-4">
            No cookie is set, nothing is stored in your browser, and no visitor
            identifier is sent, so nothing here follows you across other sites
            or from one visit to the next. The result is a visitor count, a list
            of popular pages and how fast they load, which is what we use to
            decide what to document and what to speed up. Cloudflare processes
            the measurements on our behalf, subject to{' '}
            <a
              href="https://www.cloudflare.com/privacypolicy/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 dark:text-primary-400 hover:underline"
            >
              Cloudflare's Privacy Policy
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Opting Out</h2>
          <p className="text-slate-600 dark:text-slate-400">
            The script has no opt-out switch of its own. Any content blocker
            that blocks{' '}
            <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
              static.cloudflareinsights.com
            </code>
            , as most do by default, stops it from loading, and the site works
            the same without it.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Language</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            The documentation is available in several languages. When you open
            an English page, the server reads the language your browser says you
            prefer and, if the site offers that language, sends you to the same
            page in it. That preference is read for the one request and is not
            stored.
          </p>
          <p className="text-slate-600 dark:text-slate-400">
            When you pick a language yourself with the language switcher, the
            site stores that choice in a single cookie,{' '}
            <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
              rk-locale
            </code>
            , holding only the language code, so it can respect your choice on
            later visits. It is kept for one year, is only ever sent to
            reelkit.dev, and is not used for analytics. Deleting it brings back
            the browser-based choice.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Bot Protection</h2>
          <p className="text-slate-600 dark:text-slate-400">
            The site is hosted on Cloudflare. To tell browsers from automated
            traffic, Cloudflare adds a small script to each page that runs a
            check in your browser and stores the result in a cookie,{' '}
            <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
              cf_clearance
            </code>
            . The cookie is only ever sent to reelkit.dev, is needed for that
            protection to work, and is not used for analytics, advertising or
            following you across sites. It is subject to{' '}
            <a
              href="https://www.cloudflare.com/privacypolicy/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 dark:text-primary-400 hover:underline"
            >
              Cloudflare's Privacy Policy
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">What We Don't Collect</h2>
          <ul className="list-disc pl-6 space-y-2 text-slate-600 dark:text-slate-400">
            <li>No tracking cookies or tracking pixels</li>
            <li>No user accounts or personal information</li>
            <li>No advertising or third-party marketing tools</li>
            <li>No cross-site tracking or visitor profiles</li>
            <li>No IP address logging beyond standard server access logs</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Third-Party Services</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            This website is served as a static site. Beyond the analytics script
            described above, your browser reaches these origins:
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

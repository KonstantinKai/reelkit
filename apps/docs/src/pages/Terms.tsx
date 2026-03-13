export default function Terms() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Last updated: March 13, 2026
        </p>
      </div>

      <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">The Software</h2>
          <p className="text-slate-600 dark:text-slate-400">
            ReelKit is free, open-source software released under the{' '}
            <a
              href="https://opensource.org/licenses/MIT"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 dark:text-primary-400 hover:underline"
            >
              MIT License
            </a>
            . You may use, copy, modify, merge, publish, distribute, sublicense,
            and/or sell copies of the software, subject to the conditions of
            that license.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Packages</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            The following npm packages are covered by the MIT License:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-slate-600 dark:text-slate-400">
            <li>
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                @reelkit/core
              </code>{' '}
              — Framework-agnostic slider engine
            </li>
            <li>
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                @reelkit/react
              </code>{' '}
              — React bindings
            </li>
            <li>
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                @reelkit/react-reel-player
              </code>{' '}
              — Video reel player component
            </li>
            <li>
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                @reelkit/react-lightbox
              </code>{' '}
              — Image gallery lightbox component
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Documentation Site</h2>
          <p className="text-slate-600 dark:text-slate-400">
            The content on this documentation site (reelkit.dev) — including
            text, code examples, and demos — is provided for educational
            purposes. Code examples may be freely used in your own projects.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Disclaimer</h2>
          <p className="text-slate-600 dark:text-slate-400">
            The software is provided "as is", without warranty of any kind,
            express or implied, including but not limited to the warranties of
            merchantability, fitness for a particular purpose, and
            noninfringement. In no event shall the authors or copyright holders
            be liable for any claim, damages, or other liability, whether in an
            action of contract, tort, or otherwise, arising from, out of, or in
            connection with the software or the use or other dealings in the
            software.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Changes</h2>
          <p className="text-slate-600 dark:text-slate-400">
            We may update these terms occasionally. Changes will be reflected by
            updating the "Last updated" date above.
          </p>
        </section>
      </div>
    </div>
  );
}

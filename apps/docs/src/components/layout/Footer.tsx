import { Link } from 'react-router-dom';
import { GithubIcon } from '../ui/GithubIcon';
import logoSvg from '../../assets/logo.svg';
import { useLocalePath, useMessages } from '../../i18n/useLocale';

export default function Footer() {
  const messages = useMessages();
  const localePath = useLocalePath();

  return (
    <footer className="bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img src={logoSvg} alt="reelkit" className="w-8 h-8 rounded-lg" />
              <span className="text-lg font-bold">
                <span className="text-white">Reel</span>
                <span className="bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
                  Kit
                </span>
              </span>
            </div>
            <p className="text-slate-400 text-sm max-w-md">
              {messages.footer.tagline}
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">
              {messages.footer.documentation}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to={localePath('/docs/getting-started')}
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                >
                  {messages.footer.gettingStarted}
                </Link>
              </li>
              <li>
                <Link
                  to={localePath('/docs/installation')}
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                >
                  {messages.footer.installation}
                </Link>
              </li>
              <li>
                <Link
                  to={localePath('/docs/react/guide')}
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                >
                  {messages.footer.examples}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{messages.footer.community}</h4>
            <div className="flex gap-3">
              <a
                href="https://github.com/KonstantinKai/reelkit"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                <GithubIcon size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm">
            {messages.footer.rights(new Date().getFullYear())}
          </p>
          <div className="flex gap-6 text-sm">
            <Link
              to={localePath('/privacy')}
              className="text-slate-400 hover:text-white transition-colors"
            >
              {messages.footer.privacy}
            </Link>
            <Link
              to={localePath('/terms')}
              className="text-slate-400 hover:text-white transition-colors"
            >
              {messages.footer.terms}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

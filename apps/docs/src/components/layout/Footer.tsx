import { Github, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';
import logoSvg from '../../assets/logo.svg';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img src={logoSvg} alt="reelkit" className="w-8 h-8 rounded-lg" />
              <span className="text-lg font-bold">reelkit</span>
            </div>
            <p className="text-slate-400 text-sm max-w-md">
              A framework-agnostic one-item-at-a-time slider library. Perfect
              for vertical video feeds, story viewers, and fullscreen galleries.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Documentation</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/docs/getting-started"
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                >
                  Getting Started
                </Link>
              </li>
              <li>
                <Link
                  to="/docs/installation"
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                >
                  Installation
                </Link>
              </li>
              <li>
                <Link
                  to="/docs/examples/basic"
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                >
                  Examples
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Community</h4>
            <div className="flex gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                <Github size={20} />
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                <Twitter size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm">
            &copy; {new Date().getFullYear()} ReelKit. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <a
              href="#"
              className="text-slate-400 hover:text-white transition-colors"
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-slate-400 hover:text-white transition-colors"
            >
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

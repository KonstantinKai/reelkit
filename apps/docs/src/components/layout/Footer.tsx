import { Github } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p className="footer-text">
          Released under the MIT License.
        </p>
        <div className="footer-links">
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            <Github size={16} />
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}

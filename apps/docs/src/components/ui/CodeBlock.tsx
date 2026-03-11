import { useEffect, useState } from 'react';
import { codeToHtml } from 'shiki';
import { useTheme } from '../../context/ThemeContext';
import './CodeBlock.css';

interface CodeBlockProps {
  code: string;
  lang?: string;
  title?: string;
}

export function CodeBlock({ code, lang = 'tsx', title }: CodeBlockProps) {
  const { theme } = useTheme();
  const [html, setHtml] = useState<string>('');

  useEffect(() => {
    const highlight = async () => {
      const result = await codeToHtml(code.trim(), {
        lang,
        theme: theme === 'dark' ? 'github-dark' : 'github-light',
      });
      setHtml(result);
    };
    highlight();
  }, [code, lang, theme]);

  return (
    <div className="code-block">
      {title && <div className="code-block-header">{title}</div>}
      {html ? (
        <div className="code-block-content" dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <pre className="code-block-content">
          <code>{code.trim()}</code>
        </pre>
      )}
    </div>
  );
}

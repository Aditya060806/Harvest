import { site } from '@/lib/site';

export default function Footer() {
  return (
    <footer className="border-t border-line/10 bg-bg">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="flex flex-col items-start justify-between gap-10 md:flex-row">
          <div className="max-w-sm">
            <div className="flex items-center gap-2 font-semibold text-strong">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-harvest-500/15 text-lg">🌾</span>
              harvest<span className="text-harvest-500">-scan</span>
            </div>
            <p className="mt-4 text-sm text-muted">{site.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <div>
              <h4 className="text-sm font-semibold text-strong">Product</h4>
              <ul className="mt-3 space-y-2 text-sm text-muted">
                <li><a className="transition hover:text-strong" href="/#features">Features</a></li>
                <li><a className="transition hover:text-strong" href="/#plugins">Plugins</a></li>
                <li><a className="transition hover:text-strong" href="/docs">Docs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-strong">Resources</h4>
              <ul className="mt-3 space-y-2 text-sm text-muted">
                <li><a className="transition hover:text-strong" href={site.github} target="_blank" rel="noreferrer">GitHub</a></li>
                <li><a className="transition hover:text-strong" href={site.npm} target="_blank" rel="noreferrer">npm</a></li>
                <li><a className="transition hover:text-strong" href={`${site.github}/releases`} target="_blank" rel="noreferrer">Releases</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-strong">Author</h4>
              <ul className="mt-3 space-y-2 text-sm text-muted">
                <li><a className="transition hover:text-strong" href={site.author.github} target="_blank" rel="noreferrer">GitHub</a></li>
                <li><a className="transition hover:text-strong" href={site.author.linkedin} target="_blank" rel="noreferrer">LinkedIn</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-line/10 pt-6 text-sm text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} harvest-scan · MIT License</p>
          <p>
            Built by{' '}
            <a href={site.author.linkedin} target="_blank" rel="noreferrer" className="text-harvest-500 hover:text-harvest-600 dark:hover:text-harvest-300">
              {site.author.name}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

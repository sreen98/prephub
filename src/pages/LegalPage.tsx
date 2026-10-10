import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

/**
 * Privacy Policy and Terms of Use. Both are DRAFTS: they describe what the site
 * actually does today (static site, no accounts, browser-only storage, Google
 * Analytics), and every fact the code cannot tell us is listed under "Open items"
 * for the owner to settle. Do not add a commitment here that the site does not keep.
 */

type Doc = 'privacy' | 'terms';

interface Section { heading: string; body: ReactNode }

const ext = (href: string, label: string) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-2 hover:text-accent-strong">
    {label}
  </a>
);

const ISSUES_URL = 'https://github.com/sreen98/prephub/issues';

const PRIVACY: { title: string; openItems: string[]; sections: Section[] } = {
  title: 'Privacy Policy',
  openItems: [
    'Name the person responsible for the site and add a contact email.',
    'Decide whether visitors from the EU or UK must give consent before Google Analytics loads. It currently loads for everyone.',
    'Check how long the Google Analytics property keeps data (its data retention setting) and state it here.',
    'Confirm whether Cloudflare only provides DNS for the domain or also proxies traffic. If it proxies, add it under "Hosting".',
  ],
  sections: [
    {
      heading: 'In short',
      body: (
        <p>
          PrepHub has no accounts and no server of its own. Your progress stays in your browser. The site uses Google
          Analytics to count page views.
        </p>
      ),
    },
    {
      heading: 'What stays in your browser',
      body: (
        <>
          <p>
            PrepHub saves the following in your browser's local storage, on your device only. It is never sent to us.
          </p>
          <ul>
            <li>which guides you have started or finished, your bookmarks and checkpoints</li>
            <li>your spaced-repetition review schedule and study streak</li>
            <li>code you write in the playgrounds, which challenges you solved, and Interview Simulator history</li>
            <li>preferences such as theme, text size and editor settings</li>
          </ul>
          <p>
            Because it lives in one browser, it does not follow you to another browser or device. Clearing this site's data
            in your browser settings deletes it.
          </p>
        </>
      ),
    },
    {
      heading: 'Code and queries you run',
      body: (
        <p>
          The JavaScript, React and Query playgrounds run entirely in your browser, including the PostgreSQL database
          used by the Query Playground. Your code and queries are not uploaded anywhere.
        </p>
      ),
    },
    {
      heading: 'Offline copy',
      body: (
        <p>
          A service worker stores the site's files in your browser so that pages load quickly and work offline. It holds
          no personal information.
        </p>
      ),
    },
    {
      heading: 'Google Analytics',
      body: (
        <>
          <p>
            The site uses Google Analytics 4 to see which pages are visited. Google sets cookies for this and receives
            information such as the pages you view, your approximate location, and your device and browser type. Google
            processes it under the {ext('https://policies.google.com/privacy', 'Google Privacy Policy')}.
          </p>
          <p>
            You can opt out with the {ext('https://tools.google.com/dlpage/gaoptout', 'Google Analytics opt-out add-on')}{' '}
            or a content blocker. PrepHub works the same without it.
          </p>
        </>
      ),
    },
    {
      heading: 'Hosting',
      body: (
        <p>
          The site is served by GitHub Pages. GitHub may log technical information, such as IP addresses, to run and
          secure the service; see the{' '}
          {ext('https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement', 'GitHub Privacy Statement')}.
        </p>
      ),
    },
    {
      heading: 'Questions',
      body: <p>Open an issue on the {ext(ISSUES_URL, 'PrepHub GitHub repository')}.</p>,
    },
  ],
};

const TERMS: typeof PRIVACY = {
  title: 'Terms of Use',
  openItems: [
    'Choose a licence for the guides and code. The repository has no LICENSE file, so reuse rights are currently undefined.',
    'Name the person responsible for the site and add a contact email.',
    'Decide which country\'s law governs these terms, if you want to state one.',
  ],
  sections: [
    {
      heading: 'Using PrepHub',
      body: <p>PrepHub is free to use for your own study. You do not need an account.</p>,
    },
    {
      heading: 'The content',
      body: (
        <p>
          The guides, questions and code examples are written to be accurate, but they can contain mistakes or go out of
          date. They are provided as they are, without any guarantee, and they are not a promise of any interview result.
          Check anything important against the official documentation.
        </p>
      ),
    },
    {
      heading: 'Running code',
      body: (
        <p>
          Code you run in the playgrounds runs in your own browser. You are responsible for the code you write and run.
        </p>
      ),
    },
    {
      heading: 'Other sites and names',
      body: (
        <p>
          Guides link to other websites, which have their own terms. Product and company names mentioned in the guides
          belong to their owners.
        </p>
      ),
    },
    {
      heading: 'Changes',
      body: (
        <p>
          The site and these terms may change or stop at any time. Your saved progress lives in your browser, so it is
          not affected by changes to these terms. See the <Link to="/privacy" className="text-accent underline underline-offset-2 hover:text-accent-strong">Privacy Policy</Link> for
          what the site stores.
        </p>
      ),
    },
    {
      heading: 'Questions',
      body: <p>Open an issue on the {ext(ISSUES_URL, 'PrepHub GitHub repository')}.</p>,
    },
  ],
};

export default function LegalPage({ doc }: { doc: Doc }) {
  const { title, openItems, sections } = doc === 'privacy' ? PRIVACY : TERMS;
  return (
    <article className="px-6 py-12 md:px-12 max-w-2xl mx-auto text-ink">
      <h1 className="text-3xl font-bold tracking-tight mb-6">{title}</h1>

      <section aria-labelledby="draft-heading" className="mb-10 border border-line bg-surface rounded-md p-5">
        <h2 id="draft-heading" className="text-sm font-semibold mb-2">Draft for review</h2>
        <p className="text-sm text-muted mb-2">
          This page describes how the site works today. These details still need to be settled:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-sm text-muted">
          {openItems.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>

      <div className="space-y-8 leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_p+p]:mt-3 [&_p+ul]:mt-3 [&_ul+p]:mt-3">
        {sections.map(({ heading, body }) => (
          <section key={heading}>
            <h2 className="text-lg font-semibold mb-2">{heading}</h2>
            {body}
          </section>
        ))}
      </div>
    </article>
  );
}

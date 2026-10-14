import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ACCOUNTS_ENABLED } from '../lib/account';
import { ANALYTICS_ENABLED } from '../lib/analytics';

/**
 * Privacy Policy and Terms of Use, written to cover the EU/UK GDPR (controller,
 * legal bases, rights, transfers, retention), the ePrivacy cookie rules,
 * California's CalOPPA (effective date, Do Not Track), COPPA (children), and
 * India's DPDP Act (notice at sign-in in AccountControl, under-18s, grievance
 * contact, the Data Protection Board).
 * They describe only what the site actually does: the optional Google account
 * appears only when ACCOUNTS_ENABLED, and visitor statistics only when
 * ANALYTICS_ENABLED, so a build can never promise or admit to something it
 * doesn't do. Facts the code cannot settle stay under "Open items".
 * Update LAST_UPDATED whenever the wording changes.
 */

type Doc = 'privacy' | 'terms';

interface Section { heading: string; body: ReactNode }

const LAST_UPDATED = '14 October 2026';
const OWNER = 'Sreenath P';
const CONTACT_EMAIL = 'developersreenz@gmail.com';

const LINK = 'text-accent underline underline-offset-2 hover:text-accent-strong';

const ext = (href: string, label: string) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className={LINK}>
    {label}
  </a>
);

/** Only the services this build actually sends data to. */
const PROCESSORS = new Intl.ListFormat('en', { type: 'conjunction' }).format([
  'GitHub',
  ...(ANALYTICS_ENABLED ? ['Cloudflare'] : []),
  ...(ACCOUNTS_ENABLED ? ['Google'] : []),
]);

const mail = <a href={`mailto:${CONTACT_EMAIL}`} className={LINK}>{CONTACT_EMAIL}</a>;

const ACCOUNT_SECTION: Section = {
  heading: 'If you sign in with Google',
  body: (
    <>
      <p>
        Signing in is optional. If you sign in, PrepHub uses Google's Firebase service to keep your account and a copy of
        your progress:
      </p>
      <ul>
        <li>
          your Google account's name, email address and profile photo, and an account ID, held by Firebase Authentication
        </li>
        <li>
          a copy of the progress listed above (guides, bookmarks, checkpoints, review schedule and streak, playground code
          and solved challenges, Interview Simulator attempts), held in a Cloud Firestore database in Mumbai, India.
          Preferences such as theme and text size stay on your device.
        </li>
      </ul>
      <p>
        Security rules let only your signed-in account read or change your progress. The site's owner can see the
        database through the Firebase console, and looks at it only to run and fix the service. Google acts as our data
        processor under the {ext('https://cloud.google.com/terms/data-processing-addendum', 'Google Cloud Data Processing Addendum')},
        which covers Cloud Firestore and Firebase Authentication.
        Signing in stores a sign-in token in your browser; it exists only because you asked to sign in.
      </p>
      <p>
        It is kept until you delete it. In the account menu, Export my data downloads your progress as a file, and Delete
        account removes your stored progress and your sign-in straight away. No backups of the database are kept. When you
        sign out you choose whether this device keeps its copy.
      </p>
    </>
  ),
};

const STATISTICS_SECTION: Section = {
  heading: 'Visitor statistics',
  body: ANALYTICS_ENABLED ? (
    <p>
      The site counts visits with {ext('https://www.cloudflare.com/web-analytics/', 'Cloudflare Web Analytics')}. It sets no
      cookies, stores nothing on your device and does not follow you across sites. Cloudflare sees the page you visit, the
      page that linked to it, your browser type and your country (from your IP address, which it does not use to identify
      you), and gives us only totals. Cloudflare handles this under its {ext('https://www.cloudflare.com/privacypolicy/', 'Privacy Policy')}.
    </p>
  ) : (
    <p>The site does not use analytics or any other tracking, and sets no cookies.</p>
  ),
};

const PRIVACY: { title: string; openItems: string[]; sections: Section[] } = {
  title: 'Privacy Policy',
  // Settled 2026-10-14: Cloudflare is DNS-only for prephub.sreenathp.com (not a hosting processor),
  // and Firestore and Firebase Auth fall under the GCP Terms, which include Google's Cloud Data
  // Processing Addendum with no separate acceptance. Add a line here when a new fact needs settling.
  openItems: [],
  sections: [
    {
      heading: 'In short',
      body: (
        <p>
          PrepHub works without an account, and your progress stays in your browser.
          {ACCOUNTS_ENABLED && ' If you choose to sign in with Google, a copy of your progress is stored in your account so it follows you to other devices.'}
          {ANALYTICS_ENABLED
            ? ' Visits are counted with Cloudflare Web Analytics, which uses no cookies.'
            : ' There is no analytics or tracking.'}{' '}
          Nothing is sold, and there are no ads.
        </p>
      ),
    },
    {
      heading: 'Who is responsible',
      body: (
        <p>
          PrepHub is run by {OWNER}, who is the data controller for the personal data described here. Contact: {mail}.
        </p>
      ),
    },
    {
      heading: 'What stays in your browser',
      body: (
        <>
          <p>
            PrepHub saves the following in your browser's local storage.{' '}
            {ACCOUNTS_ENABLED ? 'Unless you sign in, it stays on your device and is never sent to us.' : 'It stays on your device and is never sent to us.'}
          </p>
          <ul>
            <li>which guides you have started or finished, your bookmarks and checkpoints</li>
            <li>your spaced-repetition review schedule and study streak</li>
            <li>code you write in the playgrounds, which challenges you solved, and Interview Simulator history</li>
            <li>preferences such as theme, text size and editor settings</li>
          </ul>
          <p>
            This storage is needed for the features you use, so it does not require consent. Because it lives in one
            browser, it does not follow you to another browser or device{ACCOUNTS_ENABLED ? ' unless you sign in' : ''}.
            Clearing this site's data in your browser settings deletes it.
          </p>
        </>
      ),
    },
    ...(ACCOUNTS_ENABLED ? [ACCOUNT_SECTION] : []),
    {
      heading: 'Code and queries you run',
      body: (
        <p>
          The JavaScript, React and Query playgrounds run entirely in your browser, including the PostgreSQL database
          used by the Query Playground. Your code and queries are not uploaded anywhere
          {ACCOUNTS_ENABLED ? ', except playground drafts saved to your account if you sign in' : ''}.
        </p>
      ),
    },
    STATISTICS_SECTION,
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
      heading: 'Legal bases (EU and UK)',
      body: (
        <ul>
          {ACCOUNTS_ENABLED && <li>Your account and synced progress: to provide the service you asked for by signing in (contract).</li>}
          {ANALYTICS_ENABLED && <li>Cookieless visitor statistics: our legitimate interest in knowing which pages are useful.</li>}
          <li>Hosting logs: our legitimate interest in keeping the site running and secure.</li>
          <li>Everything else stays on your device and is not processed by us.</li>
        </ul>
      ),
    },
    {
      heading: 'Where data is processed',
      body: (
        <p>
          The services above are run by {PROCESSORS}, which may process data in the United States and other countries
          outside the EU and UK. They protect these transfers with the European Commission's Standard Contractual Clauses
          and, where they are certified, the EU-U.S. Data Privacy Framework.
        </p>
      ),
    },
    {
      heading: 'Your rights',
      body: (
        <>
          <p>
            You can ask to see, correct, delete or receive a copy of your personal data, object to its use, restrict it,
            or withdraw your consent.{ACCOUNTS_ENABLED && ' Signed-in users can export and delete everything themselves from the account menu; deleting the account withdraws consent.'}{' '}
            For anything else, or a complaint, email {mail}; it is the contact for questions and grievances about your
            data, and you will get an answer within one month.
          </p>
          <p>
            You can also complain to your data protection authority: in the EU your national authority, in the UK the
            Information Commissioner's Office, in India the Data Protection Board of India, and in Brazil the ANPD.
          </p>
        </>
      ),
    },
    {
      heading: 'Children',
      body: (
        <p>
          PrepHub is a study tool for developers and is not directed at children under 13. We do not knowingly collect
          personal data from them, and the site does no behavioural tracking or advertising.
          {ACCOUNTS_ENABLED && ' Using PrepHub without an account is fine at any age, because nothing leaves your browser. To sign in, you must be 18 or older if you are in India. Elsewhere, if you are under the age of digital consent where you live (13 to 16 in the EU), sign in only with a parent\'s permission.'}
        </p>
      ),
    },
    {
      heading: 'Do Not Track',
      body: (
        <p>
          PrepHub does not track you across other sites{ANALYTICS_ENABLED ? ' and its statistics use no cookies' : ''}, so
          it treats every visitor the same whether or not the browser sends a Do Not Track signal.
        </p>
      ),
    },
    {
      heading: 'Changes',
      body: <p>If this policy changes, the date below changes too, and important changes are announced in What's New.</p>,
    },
  ],
};

const TERMS: typeof PRIVACY = {
  title: 'Terms of Use',
  openItems: [
    'Choose a licence for the guides and code. The repository has no LICENSE file, so reuse rights are currently undefined.',
    'Decide which country\'s law governs these terms, if you want to state one.',
  ],
  sections: [
    {
      heading: 'Using PrepHub',
      body: (
        <p>
          PrepHub is run by {OWNER} and is free to use for your own study. You do not need an account.
          {ACCOUNTS_ENABLED && ' Signing in with Google is optional, and you can delete your account at any time from the account menu.'}
        </p>
      ),
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
      heading: 'Open-source software',
      body: (
        <p>
          PrepHub is built with open-source libraries such as React, Monaco and PGlite. Their licences and copyright
          notices are listed in <a href={`${import.meta.env.BASE_URL}licenses.txt`} className={LINK}>licenses.txt</a>.
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
          The site and these terms may change or stop at any time. Your saved progress lives in your browser
          {ACCOUNTS_ENABLED ? ' (and, if you signed in, in your account)' : ''}, so it is not affected by changes to these terms.
          See the <Link to="/privacy" className={LINK}>Privacy Policy</Link> for what the site stores.
        </p>
      ),
    },
    {
      heading: 'Contact',
      body: <p>Email {mail}.</p>,
    },
  ],
};

export default function LegalPage({ doc }: { doc: Doc }) {
  const { title, openItems, sections } = doc === 'privacy' ? PRIVACY : TERMS;
  return (
    <article className="px-6 py-12 md:px-12 max-w-2xl mx-auto text-ink">
      <h1 className="font-display text-4xl font-semibold tracking-tight mb-2">{title}</h1>
      <p className="text-sm text-muted mb-6">Last updated {LAST_UPDATED}</p>

      {openItems.length > 0 && (
        <section aria-labelledby="draft-heading" className="mb-10 border border-line bg-surface rounded-md p-5">
          <h2 id="draft-heading" className="text-sm font-semibold mb-2">Still to settle</h2>
          <p className="text-sm text-muted mb-2">
            This page describes how the site works today. These details are still open:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-muted">
            {openItems.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </section>
      )}

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

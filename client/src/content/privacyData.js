/**
 * @file client/src/content/privacyData.js
 * @description Plain-language privacy policy data specific to KestrelCI.
 */

import { LAST_UPDATED } from './constants.js';

export const PRIVACY_POLICY = {
  lastUpdated: LAST_UPDATED,
  summary: 'KestrelCI is engineered with strict data minimization principles. We do not use third-party analytics trackers, behavioral ad pixels, or remote telemetry. Only public metadata from GitHub is read—never cloned or executed.',
  sections: [
    {
      title: '1. What Data is Collected & Stored',
      content: [
        'Projects & Pipelines: Names, slugs, descriptions, repository URLs, default branch names, and configuration JSON defined by you.',
        'Pipeline Runs & Logs: Generated run records, commit metadata, execution status timestamps, durations, and diagnostic log lines written during stage execution.',
        'GitHub Analysis Snapshots: For public GitHub repositories, read-only metadata (such as commit SHA, commit author, primary language, and small manifest files ≤100 KB) is cached locally to minimize API traffic.',
        'Contact Messages: If you submit a query via the contact form, your name, email address, subject, and message are stored in the local database.',
        'Browser LocalStorage: Only two functional preferences are stored locally on your device: "kestrel-theme" (persisting appearance mode) and "kestrel-cookie-consent" (persisting cookie banner acknowledgment).'
      ]
    },
    {
      title: '2. GitHub Public API & Zero-Execution Policy',
      content: [
        'When you register a public GitHub repository, KestrelCI queries the official GitHub REST API in read-only mode.',
        'Strict Honesty & Safety: Only public repositories are inspected. KestrelCI never accesses private repositories, never clones repository code to disk, and never executes repository code or build scripts.',
        'SSRF Protection: Outbound requests only ever hit the configured GitHub API endpoint. Arbitrary external hostnames, local IPs, and private networks are strictly rejected.'
      ]
    },
    {
      title: '3. Zero Third-Party Tracking',
      content: [
        'KestrelCI loads zero third-party tracking scripts, zero advertising beacons, and zero telemetry software.',
        'Whether you accept or decline the informational cookie banner, no third-party trackers are ever loaded into your browser session.'
      ]
    },
    {
      title: '4. Data Storage & Hosting Location',
      content: [
        'All application records reside inside a single SQLite file on the server running KestrelCI (default location: server/data/app.sqlite).',
        'No database replication to external commercial clouds occurs unless configured by the system administrator.'
      ]
    },
    {
      title: '5. Data Retention & Deletion Rights',
      content: [
        'You have full control over your records. You can delete individual projects (which cascades to all pipelines and associated runs) or wipe all execution history via the "Wipe Archive" interface.',
        'System administrators can permanently delete all data at any time by removing the server SQLite file.'
      ]
    },
    {
      title: '6. Contact & Questions',
      content: [
        'For inquiries regarding data protection or technical infrastructure, submit a message via the built-in Contact form or reach out to your designated deployment administrator.'
      ]
    }
  ],
  legalDisclaimer: 'Notice: This privacy policy describes the technical behavior of the KestrelCI simulation software. Before deploying this software to production or public internet environments with real end-users, please have your legal counsel review this policy.'
};

export default PRIVACY_POLICY;

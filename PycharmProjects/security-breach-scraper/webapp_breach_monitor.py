#!/usr/bin/env python3
"""
Web Application Breach Business Development Monitor
Identifies companies affected by web application breaches related to the OWASP Top 10
for penetration testing outreach.
"""

import os
import requests
import sqlite3
import re
import hashlib
import logging
import time
from urllib.parse import quote_plus
from datetime import datetime, timedelta, timezone
from bs4 import BeautifulSoup
import feedparser
from dotenv import load_dotenv
from typing import Dict, List, Optional, Tuple

# Local import for the notifier
from teams_notifier import TeamsNotifier

# Load environment variables
load_dotenv('env')

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class WebAppBreachMonitor:
    """Monitor for web application breaches and security incidents for business development"""

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        })

        # High-priority RSS feeds
        self.security_feeds = [
            {'name': 'BleepingComputer', 'url': 'https://www.bleepingcomputer.com/feed/', 'priority': 1},
            {'name': 'TheHackerNews', 'url': 'https://feeds.feedburner.com/TheHackersNews', 'priority': 2},
            {'name': 'SecurityWeek', 'url': 'https://feeds.feedburner.com/Securityweek', 'priority': 3},
            {'name': 'DarkReading', 'url': 'https://www.darkreading.com/rss.xml', 'priority': 4},
            {'name': 'HelpNetSecurity', 'url': 'https://www.helpnetsecurity.com/feed/', 'priority': 5}
        ]

        # Keywords focused on the OWASP Top 10 for precise targeting
        self.owasp_top_10_keywords = {
            "A01: Broken Access Control": ['authorization bypass', 'authentication bypass', 'directory traversal',
                                           'path traversal', 'csrf', 'cross-site request forgery', 'idor',
                                           'insecure direct object reference'],
            "A02: Cryptographic Failures": ['cryptographic failure', 'weak cryptography', 'data exposure',
                                            'sensitive data exposure', 'unencrypted'],
            "A03: Injection": ['sql injection', 'sqli', 'xss', 'cross-site scripting', 'command injection',
                               'code injection', 'os injection'],
            "A04: Insecure Design": ['insecure design', 'flaw by design', 'design vulnerability'],
            "A05: Security Misconfiguration": ['misconfiguration', 'security misconfiguration', 'default credentials',
                                               'exposed cloud storage', 's3 bucket leak', 'exposed database'],
            "A06: Vulnerable Components": ['vulnerable component', 'outdated library', 'known vulnerability', 'log4j',
                                           'log4shell', 'apache struts', 'spring framework vulnerability',
                                           'exchange vulnerability'],
            "A07: Identification & Authentication Failures": ['session fixation', 'session hijacking',
                                                              'credential stuffing', 'brute force attack',
                                                              'weak password'],
            "A08: Software & Data Integrity Failures": ['insecure deserialization', 'software update integrity',
                                                        'supply chain attack'],
            "A09: Security Logging & Monitoring Failures": ['insufficient logging', 'monitoring failure',
                                                            'lack of monitoring'],
            "A10: Server-Side Request Forgery (SSRF)": ['ssrf', 'server-side request forgery', 'cross-site port attack']
        }

        self.company_patterns = [
            r'\b([A-Z][a-zA-Z\s&\'-]{2,40}(?:\s+(?:Inc\.?|Corp\.?|Corporation|Company|Group|Holdings|Systems|Technologies|Solutions)))\b',
            r'\b(Microsoft|Google|Amazon|Apple|Meta|ServiceNow|Salesforce|Oracle|IBM|Cisco|Dell|HP)\b',
            r'\b([A-Z][a-zA-Z\s]{2,25}(?:\s+(?:Bank|Financial|Insurance|Capital|Investments)))\b',
            r'\b(Qantas|Marks & Spencer|M&S|Coinbase|AT&T|WestJet|PowerSchool|Ingram Micro|Ticketmaster|Ascension)\b'
        ]

        self.executive_patterns = [
            r'(?:CEO|CTO|CISO|CIO|CSO)\s+([A-Z][a-z]+\s+[A-Z][a-z]+)',
            r'(?:VP|Vice President|Director|Head of)\s+(?:of\s+)?(?:IT|Security|Cybersecurity|Technology)?\s*([A-Z][a-z]+\s+[A-Z][a-z]+)',
            r'"[^"]*",?\s*(?:said|stated|according to)\s+([A-Z][a-z]+\s+[A-Z][a-z]+)'
        ]

        self.database_file = 'webapp_breach_prospects.db'
        self._init_database()

    def _init_database(self):
        """Initialize comprehensive prospect database"""
        try:
            with sqlite3.connect(self.database_file) as conn:
                conn.execute('''
                    CREATE TABLE IF NOT EXISTS breach_prospects (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        company_name TEXT NOT NULL,
                        vulnerability_type TEXT,
                        article_url TEXT UNIQUE,
                        article_title TEXT,
                        source_feed TEXT,
                        published_date TEXT,
                        breach_severity INTEGER,
                        fit_rating INTEGER,
                        discovered_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                ''')
                conn.execute('''
                    CREATE TABLE IF NOT EXISTS decision_makers (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        prospect_id INTEGER,
                        full_name TEXT NOT NULL,
                        title TEXT,
                        linkedin_profile TEXT,
                        FOREIGN KEY (prospect_id) REFERENCES breach_prospects (id)
                    )
                ''')
                conn.commit()
                logger.info("Prospect database initialized successfully")
        except Exception as e:
            logger.error(f"Database initialization failed: {e}")

    def get_processed_urls(self) -> set:
        """Gets all previously processed article URLs from the database for deduplication."""
        try:
            with sqlite3.connect(self.database_file) as conn:
                cursor = conn.cursor()
                cursor.execute('SELECT article_url FROM breach_prospects')
                return {row[0] for row in cursor.fetchall()}
        except Exception as e:
            logger.error(f"Failed to get processed URLs from database: {e}")
            return set()

    def get_last_processed_prospect(self) -> Optional[Dict]:
        """Gets the most recently added prospect from the database."""
        try:
            with sqlite3.connect(self.database_file) as conn:
                conn.row_factory = sqlite3.Row  # Allows accessing columns by name
                cursor = conn.cursor()

                # Get the most recent prospect
                cursor.execute('SELECT * FROM breach_prospects ORDER BY discovered_date DESC LIMIT 1')
                last_prospect_row = cursor.fetchone()

                if not last_prospect_row:
                    return None

                # Get associated decision makers
                cursor.execute('SELECT * FROM decision_makers WHERE prospect_id = ?', (last_prospect_row['id'],))
                dm_rows = cursor.fetchall()
                decision_makers = [
                    {'name': r['full_name'], 'title': r['title'], 'linkedin_profile': r['linkedin_profile']} for r in
                    dm_rows]

                # Reconstruct the prospect dictionary in the required format
                prospect = {
                    'company_name': last_prospect_row['company_name'],
                    'vulnerability_type': last_prospect_row['vulnerability_type'],
                    'breach_severity': last_prospect_row['breach_severity'],
                    'fit_rating': last_prospect_row['fit_rating'],
                    'article': {
                        'url': last_prospect_row['article_url'],
                        'title': last_prospect_row['article_title'],
                        'source': last_prospect_row['source_feed'],
                        'published_formatted': last_prospect_row['published_date']
                    },
                    'summary': "This is the most recently processed prospect. Full summary is not stored in the database.",
                    'decision_makers': decision_makers,
                    'phone_search_link': self._generate_phone_search_link(last_prospect_row['company_name']),
                    'is_repost': True  # Flag to indicate this is not a new alert
                }
                return prospect
        except Exception as e:
            logger.error(f"Could not retrieve last processed prospect: {e}")
            return None

    def _identify_vulnerability_type(self, text: str) -> str:
        text_lower = text.lower()
        for owasp_category, keywords in self.owasp_top_10_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                return owasp_category
        return 'Web Application Vulnerability (General)'

    def extract_companies(self, text: str) -> List[str]:
        companies = set()
        for pattern in self.company_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                if len(match) > 2 and 'company' not in match.lower():
                    companies.add(match.strip())
        return list(companies)[:3]

    def extract_decision_makers(self, text: str, company: str) -> List[Dict]:
        decision_makers = []
        found_names = set()
        for pattern in self.executive_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                name = " ".join(part.capitalize() for part in match.strip().split())
                if len(name.split()) == 2 and name not in found_names:
                    title = "Executive / Decision Maker"
                    linkedin_url = f"https://www.linkedin.com/search/results/people/?keywords={quote_plus(name)}%20{quote_plus(company)}"
                    decision_makers.append({'name': name, 'title': title, 'linkedin_profile': linkedin_url})
                    found_names.add(name)
        return decision_makers[:3]

    def _generate_phone_search_link(self, company_name: str) -> str:
        query = f"{company_name} contact phone number"
        return f"https://www.google.com/search?q={quote_plus(query)}"

    def _create_summary(self, html_text: str) -> str:
        if not html_text:
            return "No summary content available."
        soup = BeautifulSoup(html_text, "html.parser")
        text = soup.get_text(separator=' ').strip()
        sentences = re.split(r'(?<=[.!?])\s+', text)
        meaningful_sentences = [s.strip() for s in sentences if 30 < len(s.strip()) < 500]
        summary = " ".join(meaningful_sentences[:4])
        return summary if summary else "A brief summary could not be generated from the provided text."

    def _assess_breach_severity(self, text: str) -> int:
        text_lower = text.lower()
        severity = 5
        if any(term in text_lower for term in ['critical', 'severe', 'zero-day', 'massive']): severity += 3
        if any(term in text_lower for term in ['ransomware', 'credit card', 'financial', 'healthcare']): severity += 2
        if any(term in text_lower for term in ['patched', 'fixed', 'mitigated']): severity -= 2
        return max(1, min(10, severity))

    def _calculate_prospect_fit_rating(self, prospect: Dict) -> int:
        rating = 0
        vuln_type = prospect.get('vulnerability_type', '')
        if any(cat in vuln_type for cat in ['A03: Injection', 'A01: Broken Access Control', 'A10: SSRF']):
            rating += 4
        elif any(cat in vuln_type for cat in ['A07', 'A08']):
            rating += 3
        else:
            rating += 2
        company_lower = prospect.get('company_name', '').lower()
        high_value_industries = ['bank', 'financial', 'insurance', 'healthcare', 'e-commerce', 'tech', 'software']
        if any(industry in company_lower for industry in high_value_industries): rating += 2
        if any(suffix in company_lower for suffix in ['corp', 'group', 'global', 'international']): rating += 1
        severity = prospect.get('breach_severity', 5)
        if severity >= 8:
            rating += 3
        elif severity >= 6:
            rating += 2
        else:
            rating += 1
        return min(10, rating)

    def fetch_and_analyze_feed(self, feed: Dict) -> List[Dict]:
        prospects = []
        logger.info(f"Analyzing {feed['name']} for OWASP Top 10 breaches...")
        feed_data = feedparser.parse(feed['url'])
        twenty_four_hours_ago = datetime.now(timezone.utc) - timedelta(hours=24)
        for entry in feed_data.entries:
            if not hasattr(entry, 'published_parsed') or not entry.published_parsed: continue
            article_date = datetime.fromtimestamp(time.mktime(entry.published_parsed), tz=timezone.utc)
            if article_date < twenty_four_hours_ago: break
            article_text = f"{entry.title} {getattr(entry, 'summary', '')}"
            vulnerability_type = self._identify_vulnerability_type(article_text)
            if "A" in vulnerability_type:
                companies = self.extract_companies(article_text)
                if companies:
                    for company in companies:
                        prospect = {
                            'company_name': company,
                            'vulnerability_type': vulnerability_type,
                            'breach_severity': self._assess_breach_severity(article_text),
                            'article': {'url': entry.link, 'title': entry.title, 'source': feed['name'],
                                        'published_formatted': article_date.strftime('%b %d, %Y at %I:%M %p %Z')},
                            'summary': self._create_summary(getattr(entry, 'summary', '')),
                            'decision_makers': self.extract_decision_makers(article_text, company),
                            'phone_search_link': self._generate_phone_search_link(company)
                        }
                        prospect['fit_rating'] = self._calculate_prospect_fit_rating(prospect)
                        prospects.append(prospect)
        logger.info(f"✅ {feed['name']} found {len(prospects)} OWASP-related prospects in the last 24 hours.")
        return prospects

    def save_prospects_to_database(self, prospects: List[Dict]):
        try:
            with sqlite3.connect(self.database_file) as conn:
                for prospect in prospects:
                    cursor = conn.execute('''
                        INSERT OR IGNORE INTO breach_prospects (company_name, vulnerability_type, article_url, article_title, source_feed, published_date, breach_severity, fit_rating)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    ''', (prospect['company_name'], prospect['vulnerability_type'], prospect['article']['url'],
                          prospect['article']['title'], prospect['article']['source'],
                          prospect['article']['published_formatted'], prospect['breach_severity'],
                          prospect['fit_rating']))
                    prospect_id = cursor.lastrowid
                    if prospect_id > 0 and prospect.get('decision_makers'):
                        for dm in prospect['decision_makers']:
                            conn.execute(
                                'INSERT INTO decision_makers (prospect_id, full_name, title, linkedin_profile) VALUES (?, ?, ?, ?)',
                                (prospect_id, dm['name'], dm['title'], dm['linkedin_profile']))
                conn.commit()
                logger.info(f"Saved {len(prospects)} new prospects to the database.")
        except Exception as e:
            logger.error(f"Failed to save prospects to database: {e}")

    def run_monitoring_scan(self) -> List[Dict]:
        logger.info("🚀 Starting OWASP Top 10 Breach Monitoring Scan")
        processed_urls = self.get_processed_urls()
        logger.info(f"Loaded {len(processed_urls)} previously processed articles to prevent duplicates.")
        all_prospects = []
        for feed in sorted(self.security_feeds, key=lambda x: x['priority']):
            prospects_from_feed = self.fetch_and_analyze_feed(feed)
            all_prospects.extend(prospects_from_feed)

        unique_prospects_this_scan = list({p['article']['url']: p for p in all_prospects}.values())
        new_prospects_to_notify = []
        for prospect in unique_prospects_this_scan:
            if prospect['article']['url'] not in processed_urls:
                new_prospects_to_notify.append(prospect)

        sorted_prospects = sorted(new_prospects_to_notify, key=lambda x: x['fit_rating'], reverse=True)

        if sorted_prospects:
            logger.info(f"Found {len(sorted_prospects)} truly new articles to process and notify.")
            self.save_prospects_to_database(sorted_prospects)
            try:
                notifier = TeamsNotifier()
                notifier.send_prospect_notifications(sorted_prospects)
            except Exception as e:
                logger.error(f"Failed to send Teams notifications: {e}")
            return sorted_prospects
        else:
            logger.info("📭 No new articles found since the last run. Fetching last processed prospect.")
            try:
                notifier = TeamsNotifier()
                last_prospect = self.get_last_processed_prospect()
                if last_prospect:
                    logger.info(f"Reposting last prospect: {last_prospect['company_name']}")
                    notifier.send_prospect_notifications([last_prospect])
                else:
                    logger.info("No prospects in database to repost. Sending standard 'no results' notification.")
                    notifier.send_no_results_notification()
            except Exception as e:
                logger.error(f"Failed to send repost or 'no results' notification: {e}")
            return []


def main():
    try:
        monitor = WebAppBreachMonitor()
        prospects = monitor.run_monitoring_scan()
        logger.info(f"✅ Scan Complete. Total new prospects identified and processed: {len(prospects)}")
    except Exception as e:
        logger.error(f"💥 Main execution failed: {e}", exc_info=True)


if __name__ == "__main__":
    main()
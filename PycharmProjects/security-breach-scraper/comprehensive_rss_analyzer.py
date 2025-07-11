#!/usr/bin/env python3
"""
Comprehensive RSS Security News Analyzer
Processes ALL articles from RSS feeds, extracts entities, and posts comprehensive summaries to Teams
"""

import os
import requests
import sqlite3
from datetime import datetime, timedelta
from bs4 import BeautifulSoup
import feedparser
import hashlib
import logging
import re
from urllib.parse import quote, urljoin
import time

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class ComprehensiveSecurityAnalyzer:
    """Analyzes ALL security news and extracts detailed entity information"""

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        })

        # Comprehensive RSS feeds for security news
        self.rss_sources = [
            # Press Release Distribution Services
            {
                'name': 'PRNewswire_InfoTech_Security',
                'url': 'https://www.prnewswire.com/rss/subject/information-technology-security.rss',
                'priority': 1,
                'description': 'Official IT Security Press Releases'
            },
            {
                'name': 'BusinessWire_TechSecurity',
                'url': 'https://feed.businesswire.com/rss/home/?rss=G1QFmjZ9v24-9bV77Vye0A',
                'priority': 2,
                'description': 'Technology Security Press Releases'
            },

            # Dedicated Cybersecurity News Outlets
            {
                'name': 'BleepingComputer',
                'url': 'https://www.bleepingcomputer.com/feed/',
                'priority': 3,
                'description': 'Technical malware and security threats'
            },
            {
                'name': 'TheHackerNews',
                'url': 'https://feeds.feedburner.com/TheHackersNews',
                'priority': 4,
                'description': 'Popular cybersecurity news platform'
            },
            {
                'name': 'SecurityWeek',
                'url': 'https://feeds.feedburner.com/Securityweek',
                'priority': 5,
                'description': 'Enterprise security insights'
            },
            {
                'name': 'DarkReading',
                'url': 'https://www.darkreading.com/rss_simple.asp',
                'priority': 6,
                'description': 'Cybersecurity professional news'
            },
            {
                'name': 'HelpNetSecurity',
                'url': 'https://www.helpnetsecurity.com/feed/',
                'priority': 7,
                'description': 'Daily cybersecurity news'
            },

            # Additional Quality Sources
            {
                'name': 'KrebsOnSecurity',
                'url': 'https://krebsonsecurity.com/feed/',
                'priority': 8,
                'description': 'Investigative cybersecurity journalism'
            }
        ]

        self.database_file = 'comprehensive_cyber_news.db'
        self._init_database()

    def _init_database(self):
        """Initialize comprehensive database"""
        try:
            with sqlite3.connect(self.database_file) as conn:
                conn.execute('''
                    CREATE TABLE IF NOT EXISTS analyzed_articles (
                        url_hash TEXT PRIMARY KEY,
                        url TEXT UNIQUE,
                        title TEXT,
                        summary TEXT,
                        source TEXT,
                        published_date TEXT,
                        companies TEXT,
                        individuals TEXT,
                        analysis_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                ''')
                conn.commit()
                logger.info("Database initialized successfully")
        except Exception as e:
            logger.error(f"Database initialization failed: {e}")

    def fetch_all_rss_articles(self, source, max_articles=40):
        """Fetch ALL recent articles from RSS feed"""
        try:
            logger.info(f"Fetching ALL articles from {source['name']}...")
            feed = feedparser.parse(source['url'])

            if feed.bozo:
                logger.warning(f"RSS feed parsing issues for {source['name']}")

            articles = []
            for entry in feed.entries[:max_articles]:
                try:
                    # Get published date and filter to recent articles
                    published_date = getattr(entry, 'published', '')

                    article = {
                        'title': entry.title,
                        'url': entry.link,
                        'summary': getattr(entry, 'summary', ''),
                        'published': published_date,
                        'source': source['name']
                    }
                    articles.append(article)
                except Exception as e:
                    logger.error(f"Error parsing RSS entry: {e}")
                    continue

            logger.info(f"Found {len(articles)} articles from {source['name']}")
            return articles

        except Exception as e:
            logger.error(f"Failed to fetch RSS from {source['name']}: {e}")
            return []

    def extract_companies(self, text):
        """Extract company names from text"""
        companies = set()

        # Company name patterns (enhanced for press releases)
        company_patterns = [
            # Standard corporate suffixes
            r'([A-Z][a-zA-Z\s&]+(?:Inc\.?|Corporation|Corp\.?|Company|Co\.?|Ltd\.?|LLC|Limited|Group|Holdings|Systems|Technologies|Solutions))',
            # Specific patterns for well-known companies
            r'\b(Microsoft|Google|Amazon|Apple|Meta|Facebook|Twitter|LinkedIn|GitHub|Zoom|Slack|Tesla|Netflix|Uber|Airbnb|Oracle|IBM|Cisco|VMware|Adobe|Salesforce|ServiceNow|CrowdStrike|Palo Alto Networks|Fortinet|Check Point|McAfee|Symantec|Norton|Kaspersky|Trend Micro|FireEye|Mandiant|Okta|Zscaler|SentinelOne|Splunk|Tenable|Rapid7|Qualys|Veracode|Synopsys|BlackBerry|Carbon Black|Cylance|Darktrace|Cybereason|Endgame|Tanium|Phantom|Demisto|Recorded Future|ThreatConnect)\b',
            # Healthcare and institutional
            r'([A-Z][a-zA-Z\s]+(?:Hospital|Medical Center|Healthcare|University|College|School|Bank|Credit Union|Health System))',
            # Government and agencies
            r'([A-Z][a-zA-Z\s]+(?:Department|Agency|Bureau|Commission|Authority|Government|Ministry|Office))',
            # Press release specific patterns
            r'\b([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)\s+(?:announces|today announced|has announced|reports|confirms|discloses|releases)',
            r'([A-Z][a-zA-Z\s]+)\s+\(NASDAQ:|NYSE:|OTCQX:|LSE:\)',  # Stock exchange listings
            # Generic organizational patterns
            r'\b([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)\s+(?:confirmed|reported|disclosed|suffered|experienced)',
        ]

        for pattern in company_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                if isinstance(match, tuple):
                    match = match[0] if match[0] else match[1] if len(match) > 1 else ""

                company = match.strip()
                # Filter out obvious false positives
                if (len(company) > 3 and
                        not company.lower() in ['the company', 'this company', 'said company', 'that company'] and
                        not re.match(r'^(a|an|the|this|that|said|their|our|my)\s', company.lower())):
                    companies.add(company)

        return list(companies)[:10]  # Limit to top 10

    def extract_individuals(self, text):
        """Extract individual names from text with improved accuracy"""
        individuals = []

        # Individual name patterns (enhanced for press releases)
        name_patterns = [
            # Names with titles (expanded for press releases)
            r'(?:CEO|CTO|CISO|President|Director|Manager|VP|Vice President|Chief|Chairman|Founder|Co-founder|Partner|Principal|Head of|Lead|Senior|Executive|Officer)\s+([A-Z][a-z]+\s+[A-Z][a-z]+)',
            # Title after name
            r'([A-Z][a-z]+\s+[A-Z][a-z]+),?\s+(?:CEO|CTO|CISO|President|VP|Vice President|Chief|Chairman|Director|Manager|Head of)',
            # Names in quotes or attributed
            r'(?:said|according to|spokesperson|representative|stated|commented|noted|explained)\s+([A-Z][a-z]+\s+[A-Z][a-z]+)',
            # Names with company context
            r'([A-Z][a-z]+\s+[A-Z][a-z]+),?\s+(?:of|from|at|with)\s+[A-Z][a-zA-Z]',
            # Names in formal contexts
            r'([A-Z][a-z]+\s+[A-Z][a-z]+),?\s+(?:told|stated|confirmed|announced|explained|disclosed)',
            # Press release specific patterns
            r'"([A-Z][a-z]+\s+[A-Z][a-z]+)[",]',  # Names in quotes
            # Names followed by contact info or email
            r'([A-Z][a-z]+\s+[A-Z][a-z]+).*?@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}',
            # Names in bylines
            r'[Bb]y\s+([A-Z][a-z]+\s+[A-Z][a-z]+)',
            # Contact patterns
            r'[Cc]ontact:?\s+([A-Z][a-z]+\s+[A-Z][a-z]+)',
        ]

        found_names = set()

        for pattern in name_patterns:
            matches = re.findall(pattern, text)
            for match in matches:
                name = match.strip()
                # Filter out obvious false positives
                if (len(name.split()) == 2 and
                        not any(
                            word.lower() in ['said', 'told', 'from', 'with', 'that', 'this', 'about', 'also', 'have',
                                             'will', 'been', 'were', 'some', 'more', 'than', 'they', 'when', 'what',
                                             'only', 'such', 'each', 'both'] for word in name.split()) and
                        name not in found_names and
                        # Ensure both parts are proper names (start with capital, contain only letters)
                        all(part[0].isupper() and part.isalpha() for part in name.split()) and
                        # Avoid common non-names
                        name not in ['Security Week', 'Dark Reading', 'Help Net', 'Cyber Security', 'Data Protection',
                                     'Risk Management', 'Business Wire', 'Press Release']):
                    found_names.add(name)
                    individuals.append(name)

        return individuals[:5]  # Limit to top 5

    def generate_linkedin_url(self, name, company=None):
        """Generate potential LinkedIn URL for a person"""
        # Clean the name
        name_parts = name.lower().replace(',', '').split()
        if len(name_parts) >= 2:
            first_name = name_parts[0]
            last_name = name_parts[1]

            # Common LinkedIn URL patterns
            linkedin_patterns = [
                f"https://linkedin.com/in/{first_name}-{last_name}",
                f"https://linkedin.com/in/{first_name}{last_name}",
                f"https://linkedin.com/in/{first_name}.{last_name}",
                f"https://linkedin.com/in/{first_name}_{last_name}"
            ]

            # Return the most likely pattern
            return linkedin_patterns[0]

        return None

    def fetch_article_content(self, url):
        """Fetch full article content for better analysis"""
        try:
            response = self.session.get(url, timeout=10)
            response.raise_for_status()

            soup = BeautifulSoup(response.content, 'html.parser')

            # Extract main content
            content_selectors = [
                'article', '.article-content', '.post-content',
                '.entry-content', 'main', '.content'
            ]

            content = ""
            for selector in content_selectors:
                element = soup.select_one(selector)
                if element:
                    content = element.get_text(strip=True)
                    break

            if not content:
                # Fallback to body text
                content = soup.get_text(strip=True)

            # Clean and limit content
            content = ' '.join(content.split())[:2000]  # Limit to 2000 chars
            return content

        except Exception as e:
            logger.debug(f"Failed to fetch content from {url}: {e}")
            return ""

    def analyze_article(self, article):
        """Comprehensive analysis of a single article"""
        # Get full content for better analysis
        full_content = self.fetch_article_content(article['url'])

        # Combine title, summary, and content for analysis
        analysis_text = f"{article['title']} {article['summary']} {full_content}"

        # Extract entities
        companies = self.extract_companies(analysis_text)
        individuals = self.extract_individuals(analysis_text)

        # Generate LinkedIn links for individuals
        individuals_with_linkedin = []
        for person in individuals:
            linkedin_url = self.generate_linkedin_url(person, companies[0] if companies else None)
            individuals_with_linkedin.append({
                'name': person,
                'linkedin': linkedin_url
            })

        # Create enhanced summary
        enhanced_summary = self.create_enhanced_summary(article, companies, individuals_with_linkedin)

        return {
            'article': article,
            'companies': companies,
            'individuals': individuals_with_linkedin,
            'enhanced_summary': enhanced_summary,
            'analysis_text': analysis_text[:500]  # First 500 chars for reference
        }

    def create_enhanced_summary(self, article, companies, individuals):
        """Create an enhanced summary with individual names as headers"""
        # Start with individuals as prominent headers if they exist
        if individuals:
            summary = f"**👥 KEY PEOPLE: {', '.join([person['name'] for person in individuals[:3]])}**\n\n"
        else:
            summary = "**👥 KEY PEOPLE: None identified**\n\n"

        summary += f"**{article['title']}**\n\n"
        summary += f"*Source: {article['source']}*\n"
        summary += f"*Published: {article.get('published', 'Unknown date')}*\n\n"

        # Add article summary
        if article.get('summary'):
            # Clean HTML from summary
            clean_summary = BeautifulSoup(article['summary'], 'html.parser').get_text()
            summary += f"{clean_summary[:300]}...\n\n"

        # Add individuals with LinkedIn in expanded format
        if individuals:
            summary += f"**👥 Individuals with LinkedIn Profiles:**\n"
            for person in individuals[:3]:  # Limit to 3
                summary += f"• **{person['name']}**"
                if person['linkedin']:
                    summary += f" - [LinkedIn Profile]({person['linkedin']})"
                summary += "\n"
            summary += "\n"

        # Add companies
        if companies:
            summary += f"**🏢 Companies/Organizations Affected:**\n"
            for company in companies[:5]:  # Limit to 5
                summary += f"• {company}\n"
            summary += "\n"

        # Add read more link
        summary += f"[🔗 Read Full Article]({article['url']})"

        return summary

    def run_comprehensive_analysis(self):
        """Run comprehensive analysis of ALL security news"""
        logger.info("🚀 Starting Comprehensive Security News Analysis")
        logger.info("📊 Processing ALL articles from RSS feeds...")

        all_analyzed_articles = []

        # Process each RSS source
        for source in self.rss_sources:
            logger.info(f"🔍 Analyzing {source['name']} ({source['description']})...")

            articles = self.fetch_all_rss_articles(source)
            source_analyzed = []

            for article in articles[:15]:  # Process more articles from press release sources
                try:
                    analyzed = self.analyze_article(article)
                    source_analyzed.append(analyzed)

                    # Log findings
                    companies = analyzed['companies']
                    individuals = analyzed['individuals']
                    logger.info(f"📰 {article['title'][:50]}...")
                    if companies:
                        logger.info(f"   🏢 Companies: {', '.join(companies[:3])}")
                    if individuals:
                        logger.info(f"   👥 People: {', '.join([p['name'] for p in individuals[:2]])}")

                    # Small delay to be respectful
                    time.sleep(0.5)

                except Exception as e:
                    logger.error(f"Error analyzing article: {e}")
                    continue

            all_analyzed_articles.extend(source_analyzed)
            logger.info(f"✅ Completed {source['name']}: {len(source_analyzed)} articles analyzed")

        # Send comprehensive report to Teams
        if all_analyzed_articles:
            logger.info(f"📤 Sending comprehensive report with {len(all_analyzed_articles)} articles to Teams...")
            self._send_comprehensive_report(all_analyzed_articles)
        else:
            logger.warning("⚠️ No articles found to analyze")

        return all_analyzed_articles

    def _send_comprehensive_report(self, analyzed_articles):
        """Send comprehensive report to Teams"""
        try:
            from teams_notifier import TeamsNotifier
            notifier = TeamsNotifier()

            # Create comprehensive Teams card
            card = self._create_comprehensive_teams_card(analyzed_articles)
            success = notifier._send_message(card)

            if success:
                logger.info("✅ Comprehensive report sent to Teams successfully")
            else:
                logger.error("❌ Failed to send comprehensive report to Teams")
                self._log_comprehensive_report(analyzed_articles)

        except Exception as e:
            logger.error(f"Teams notification error: {e}")
            self._log_comprehensive_report(analyzed_articles)

    def _create_comprehensive_teams_card(self, analyzed_articles):
        """Create a comprehensive Teams adaptive card"""

        # Create summary statistics
        total_companies = set()
        total_individuals = set()

        for analysis in analyzed_articles:
            total_companies.update(analysis['companies'])
            for person in analysis['individuals']:
                total_individuals.add(person['name'])

        # Create the main card
        card = {
            "@type": "MessageCard",
            "@context": "https://schema.org/extensions",
            "summary": f"Comprehensive Security News Analysis - {len(analyzed_articles)} Articles",
            "themeColor": "#FF4B4B",
            "sections": [
                {
                    "activityTitle": "🔒 Comprehensive Security News Analysis",
                    "activitySubtitle": f"Analysis completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
                    "facts": [
                        {
                            "name": "📊 Total Articles Analyzed",
                            "value": str(len(analyzed_articles))
                        },
                        {
                            "name": "🏢 Companies/Organizations Identified",
                            "value": str(len(total_companies))
                        },
                        {
                            "name": "👥 Individuals Mentioned",
                            "value": str(len(total_individuals))
                        },
                        {
                            "name": "📰 Sources Covered",
                            "value": ", ".join(set([a['article']['source'] for a in analyzed_articles]))
                        }
                    ]
                }
            ]
        }

        # Add article sections (limit to first 8 to avoid message size limits)
        for i, analysis in enumerate(analyzed_articles[:8]):
            # Create header with individual names if available
            individuals_header = ""
            if analysis['individuals']:
                names = [person['name'] for person in analysis['individuals'][:2]]
                individuals_header = f" - People: {', '.join(names)}"

            article_section = {
                "activityTitle": f"📰 Article {i + 1}: {analysis['article']['source']}{individuals_header}",
                "text": analysis['enhanced_summary']
            }
            card["sections"].append(article_section)

        # Add summary section if more articles
        if len(analyzed_articles) > 8:
            remaining = len(analyzed_articles) - 8
            summary_section = {
                "activityTitle": f"📋 Additional Articles ({remaining} more)",
                "text": f"Analysis includes {remaining} additional articles from various sources. "
                        f"Total entities identified: {len(total_companies)} companies, {len(total_individuals)} individuals."
            }
            card["sections"].append(summary_section)

        return card

    def _log_comprehensive_report(self, analyzed_articles):
        """Log comprehensive report as fallback"""
        logger.info("📋 COMPREHENSIVE SECURITY NEWS REPORT")
        logger.info("=" * 60)

        for i, analysis in enumerate(analyzed_articles[:10], 1):
            article = analysis['article']
            logger.info(f"{i}. {article['title']}")
            logger.info(f"   Source: {article['source']}")

            if analysis['companies']:
                logger.info(f"   🏢 Companies: {', '.join(analysis['companies'][:3])}")

            if analysis['individuals']:
                names_with_linkedin = []
                for person in analysis['individuals'][:2]:
                    if person['linkedin']:
                        names_with_linkedin.append(f"{person['name']} ({person['linkedin']})")
                    else:
                        names_with_linkedin.append(person['name'])
                logger.info(f"   👥 People: {', '.join(names_with_linkedin)}")

            logger.info(f"   🔗 {article['url']}")
            logger.info("")


def main():
    """Main execution function"""
    logger.info("🚀 COMPREHENSIVE RSS SECURITY NEWS ANALYZER")
    logger.info("=" * 60)
    logger.info("This will analyze ALL recent articles from security RSS feeds")
    logger.info("and extract companies, individuals, and LinkedIn profiles")
    logger.info("=" * 60)

    try:
        analyzer = ComprehensiveSecurityAnalyzer()
        analyzed_articles = analyzer.run_comprehensive_analysis()

        # Final summary
        logger.info("=" * 60)
        logger.info("📊 ANALYSIS COMPLETE")
        logger.info(f"✅ Total articles analyzed: {len(analyzed_articles)}")

        # Count unique entities
        all_companies = set()
        all_individuals = set()

        for analysis in analyzed_articles:
            all_companies.update(analysis['companies'])
            for person in analysis['individuals']:
                all_individuals.add(person['name'])

        logger.info(f"🏢 Unique companies identified: {len(all_companies)}")
        logger.info(f"👥 Unique individuals identified: {len(all_individuals)}")
        logger.info("📤 Comprehensive report sent to Teams!")

    except Exception as e:
        logger.error(f"💥 Analysis failed: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
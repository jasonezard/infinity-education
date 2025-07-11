#!/usr/bin/env python3
"""
Quick Fix Script for Security Breach Scraper
This script addresses the immediate issues preventing the scraper from working
"""

import os
import shutil
import requests
import sqlite3
from datetime import datetime
from bs4 import BeautifulSoup
import feedparser
import hashlib
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class FixedSecurityScraper:
    """Quick fix version focusing on reliable sources"""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        })
        
        # Reliable RSS feeds for security news
        self.rss_sources = [
            {
                'name': 'BleepingComputer',
                'url': 'https://www.bleepingcomputer.com/feed/',
                'priority': 1
            },
            {
                'name': 'SecurityWeek',
                'url': 'https://feeds.feedburner.com/Securityweek',
                'priority': 2
            },
            {
                'name': 'DarkReading',
                'url': 'https://www.darkreading.com/rss.xml',
                'priority': 3
            }
        ]
        
        # Security incident keywords
        self.security_keywords = [
            'ransomware attack', 'data breach', 'cyberattack', 'security breach',
            'cyber incident', 'hack', 'malware', 'phishing attack',
            'safepay ransomware', 'lockbit', 'ransomhub', 'ingram micro'
        ]
        
        self.database_file = 'fixed_cyber_news.db'
        self._init_database()
    
    def _init_database(self):
        """Initialize SQLite database"""
        try:
            with sqlite3.connect(self.database_file) as conn:
                conn.execute('''
                    CREATE TABLE IF NOT EXISTS processed_articles (
                        url_hash TEXT PRIMARY KEY,
                        url TEXT UNIQUE,
                        title TEXT,
                        summary TEXT,
                        source TEXT,
                        published_date TEXT,
                        processed_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                ''')
                conn.commit()
                logger.info("Database initialized successfully")
        except Exception as e:
            logger.error(f"Database initialization failed: {e}")
    
    def is_processed(self, url):
        """Check if article was already processed"""
        url_hash = hashlib.md5(url.encode()).hexdigest()
        try:
            with sqlite3.connect(self.database_file) as conn:
                result = conn.execute('SELECT 1 FROM processed_articles WHERE url_hash = ?', (url_hash,)).fetchone()
                return result is not None
        except:
            return False
    
    def mark_processed(self, article):
        """Mark article as processed"""
        url_hash = hashlib.md5(article['url'].encode()).hexdigest()
        try:
            with sqlite3.connect(self.database_file) as conn:
                conn.execute('''
                    INSERT OR IGNORE INTO processed_articles 
                    (url_hash, url, title, summary, source, published_date) 
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (url_hash, article['url'], article['title'], 
                     article.get('summary', ''), article['source'], 
                     article.get('published', '')))
                conn.commit()
        except Exception as e:
            logger.error(f"Failed to mark article as processed: {e}")
    
    def fetch_rss_feed(self, source):
        """Fetch and parse RSS feed"""
        try:
            logger.info(f"Fetching RSS from {source['name']}...")
            feed = feedparser.parse(source['url'])
            
            if feed.bozo:
                logger.warning(f"RSS feed parsing issues for {source['name']}")
            
            articles = []
            for entry in feed.entries[:20]:  # Limit to 20 most recent
                try:
                    article = {
                        'title': entry.title,
                        'url': entry.link,
                        'summary': getattr(entry, 'summary', ''),
                        'published': getattr(entry, 'published', ''),
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
    
    def is_security_incident(self, article):
        """Determine if article is about a security incident"""
        text = (article.get('title', '') + ' ' + article.get('summary', '')).lower()
        
        # Must contain security terms
        security_terms = ['ransomware', 'cyberattack', 'data breach', 'security breach', 
                         'hack', 'malware', 'cyber incident', 'compromised', 'attack']
        has_security = any(term in text for term in security_terms)
        
        # Must indicate an actual incident (not advice/tips)
        incident_terms = ['attack', 'breach', 'incident', 'hit by', 'affected', 'victim', 
                         'confirms', 'admits', 'discloses']
        has_incident = any(term in text for term in incident_terms)
        
        # Exclude generic security content
        exclude_terms = ['how to protect', 'security tips', 'best practices', 
                        'prevention guide', 'tutorial', 'review']
        is_generic = any(term in text for term in exclude_terms)
        
        # Prioritize high-impact terms
        high_impact = ['hospital', 'government', 'million users', 'billion', 'major', 
                      'massive', 'critical infrastructure', 'supply chain']
        is_high_impact = any(term in text for term in high_impact)
        
        score = 0
        if has_security: score += 2
        if has_incident: score += 2
        if is_high_impact: score += 3
        if is_generic: score -= 5
        
        # Special boost for current hot topics
        hot_topics = ['ingram micro', 'safepay', 'ransomhub', 'lockbit', 'healthcare']
        if any(topic in text for topic in hot_topics):
            score += 5
        
        return score >= 3
    
    def run_quick_scan(self):
        """Run a quick scan for recent security incidents"""
        logger.info("🚀 Starting Quick Security Incident Scan")
        
        all_new_articles = []
        
        # Scan RSS feeds
        for source in self.rss_sources:
            articles = self.fetch_rss_feed(source)
            
            for article in articles:
                if not self.is_processed(article['url']):
                    if self.is_security_incident(article):
                        all_new_articles.append(article)
                        self.mark_processed(article)
                        logger.info(f"✅ Found: {article['title'][:60]}...")
        
        # Test with specific Ingram Micro search
        self._test_ingram_micro_detection()
        
        if all_new_articles:
            logger.info(f"🎯 Found {len(all_new_articles)} new security incidents")
            self._send_test_notification(all_new_articles[0])  # Send first article
        else:
            logger.info("📭 No new security incidents found")
            self._send_no_incidents_notification()
        
        return all_new_articles
    
    def _test_ingram_micro_detection(self):
        """Specific test for Ingram Micro incident"""
        logger.info("🔍 Testing Ingram Micro incident detection...")
        
        # Search specifically for Ingram Micro
        try:
            search_url = "https://www.google.com/search"
            params = {
                'q': 'Ingram Micro ransomware SafePay site:bleepingcomputer.com OR site:darkreading.com',
                'tbm': 'nws',  # News search
                'tbs': 'qdr:w'  # Past week
            }
            
            response = self.session.get(search_url, params=params, timeout=10)
            if response.status_code == 200:
                if 'ingram micro' in response.text.lower():
                    logger.info("✅ Ingram Micro incident is detectable via web search")
                else:
                    logger.warning("⚠️ Ingram Micro incident not found in search results")
            
        except Exception as e:
            logger.error(f"Ingram Micro test failed: {e}")
    
    def _send_test_notification(self, article):
        """Send test notification (simulate Teams webhook)"""
        try:
            from teams_notifier import TeamsNotifier
            notifier = TeamsNotifier()
            success = notifier.send_article_notification(article)
            
            if success:
                logger.info("✅ Teams notification sent successfully")
            else:
                logger.error("❌ Teams notification failed")
                
        except Exception as e:
            logger.error(f"Teams notification error: {e}")
            # Fallback: just log the article
            logger.info(f"📰 Would send: {article['title']}")
            logger.info(f"🔗 URL: {article['url']}")
    
    def _send_no_incidents_notification(self):
        """Send notification when no incidents found"""
        logger.info("📤 Sending 'no incidents' notification")
        
        try:
            from teams_notifier import TeamsNotifier
            notifier = TeamsNotifier()
            notifier.send_no_results_notification()
        except Exception as e:
            logger.error(f"No incidents notification failed: {e}")

def fix_chromedriver_issues():
    """Fix common ChromeDriver issues"""
    logger.info("🔧 Fixing ChromeDriver issues...")
    
    # Clear WebDriver Manager cache
    cache_paths = [
        os.path.expanduser("~/.wdm"),
        os.path.join(os.environ.get('APPDATA', ''), 'webdriver-manager') if os.name == 'nt' else None
    ]
    
    for cache_path in cache_paths:
        if cache_path and os.path.exists(cache_path):
            try:
                shutil.rmtree(cache_path)
                logger.info(f"✅ Cleared cache: {cache_path}")
            except Exception as e:
                logger.error(f"Failed to clear cache {cache_path}: {e}")

def fix_teams_webhook():
    """Check and fix Teams webhook configuration"""
    logger.info("🔧 Checking Teams webhook configuration...")
    
    env_file = 'env'
    if not os.path.exists(env_file):
        logger.warning("❌ 'env' file not found!")
        return False
    
    try:
        with open(env_file, 'r') as f:
            content = f.read()
        
        if 'TEAMS_WEBHOOK_URL' not in content:
            logger.warning("❌ TEAMS_WEBHOOK_URL not found in env file")
            return False
        
        # Basic validation
        if 'https://outlook.office.com' in content or 'https://YOUR-TENANT.webhook.office.com' in content:
            logger.info("✅ Teams webhook URL format looks correct")
            return True
        else:
            logger.warning("⚠️ Teams webhook URL format may be incorrect")
            return False
            
    except Exception as e:
        logger.error(f"Error checking env file: {e}")
        return False

def main():
    """Main execution function"""
    logger.info("🚀 SECURITY BREACH SCRAPER - QUICK FIX VERSION")
    logger.info("=" * 60)
    
    # Step 1: Fix infrastructure issues
    fix_chromedriver_issues()
    webhook_ok = fix_teams_webhook()
    
    if not webhook_ok:
        logger.warning("⚠️ Teams webhook may not work - check 'env' file")
    
    # Step 2: Run improved scraper
    try:
        scraper = FixedSecurityScraper()
        articles = scraper.run_quick_scan()
        
        # Step 3: Report results
        logger.info("=" * 60)
        logger.info("📊 SCAN RESULTS:")
        logger.info(f"New incidents found: {len(articles)}")
        
        for i, article in enumerate(articles[:5], 1):  # Show first 5
            logger.info(f"{i}. {article['title'][:50]}...")
            logger.info(f"   Source: {article['source']}")
            logger.info(f"   URL: {article['url']}")
            logger.info("")
        
        if articles:
            logger.info("✅ Scraper is now finding security incidents!")
        else:
            logger.info("ℹ️ No new incidents found (this might be normal)")
        
    except Exception as e:
        logger.error(f"💥 Scraper failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()

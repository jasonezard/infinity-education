# config.py
# Configuration file for the press release scraper

# Press release sources to scrape (updated with working URLs)
PRESS_RELEASE_SOURCES = [
    {
        'name': 'PRNewswire',
        'method': 'requests',
        'base_url': 'https://www.prnewswire.com',
        'search_url': 'https://www.prnewswire.com/search/news/',
        'search_params': {
            'query': '{keyword}',
            'pagesize': '20',
            'page': '1'
        },
        'priority': 1
    },
    {
        'name': 'BusinessWire',
        'method': 'selenium',  # Force Selenium due to 403 blocking
        'base_url': 'https://www.businesswire.com',
        'search_url': 'https://www.businesswire.com/portal/site/home/search/',
        'search_params': {
            'searchType': 'news',
            'q': '{keyword}'
        },
        'priority': 2
    },
    {
        'name': 'PRWeb',
        'method': 'requests',
        'base_url': 'https://www.prweb.com',
        'search_url': 'https://www.prweb.com/search/releases/search/',
        'search_params': {
            'query': '{keyword}',
            'num': '15'
        },
        'priority': 3
    }
]

# Enhanced keywords to catch specific breaches like Ingram Micro
SECURITY_KEYWORDS = [
    # Specific company searches
    'Ingram Micro ransomware',
    'Ingram Micro cyber attack',
    'Ingram Micro security breach',
    # High priority generic terms
    'ransomware attack',
    'cyberattack',
    'data breach',
    'security breach',
    # Medium priority
    'cyber security breach',
    'security incident'
]

# Geographical keywords for filtering
NORTH_AMERICA_KEYWORDS = [
    'united states', 'usa', 'u.s.', 'america', 'american',
    'canada', 'canadian', 'mexico', 'mexican',
    'north america', 'north american',
    'california', 'texas', 'florida', 'new york', 'illinois',
    'ontario', 'quebec', 'british columbia', 'alberta',
    'toronto', 'vancouver', 'montreal', 'chicago', 'houston',
    'los angeles', 'new york city', 'san francisco'
]

EUROPE_KEYWORDS = [
    'europe', 'european', 'eu', 'european union',
    'united kingdom', 'uk', 'britain', 'british', 'england', 'scotland', 'wales',
    'germany', 'german', 'france', 'french', 'italy', 'italian',
    'spain', 'spanish', 'netherlands', 'dutch', 'belgium', 'belgian',
    'switzerland', 'swiss', 'austria', 'austrian', 'norway', 'norwegian',
    'sweden', 'swedish', 'denmark', 'danish', 'finland', 'finnish',
    'ireland', 'irish', 'portugal', 'portuguese', 'poland', 'polish',
    'czech republic', 'hungary', 'romania', 'bulgaria',
    'london', 'paris', 'berlin', 'madrid', 'rome', 'amsterdam',
    'brussels', 'zurich', 'vienna', 'stockholm', 'copenhagen',
    'dublin', 'lisbon', 'warsaw', 'prague', 'budapest'
]

# Content extraction selectors (in order of preference)
CONTENT_SELECTORS = [
    'div.release-xml-container',
    'article',
    'main',
    'div.content',
    'div.article-body',
    'div.press-release-content',
    '.news-content',
    '.article-content'
]

# Scoring weights for article relevance
SCORING_WEIGHTS = {
    'title_keyword_match': 3.0,
    'content_keyword_match': 1.0,
    'recent_date': 2.0,
    'source_reliability': 1.5,
    'geographic_relevance': 1.0
}

# Database configuration
DATABASE_FILE = 'cyber_news.db'

# Teams message configuration
TEAMS_MESSAGE_CONFIG = {
    'max_summary_length': 500,
    'card_color': '#FF6B6B',  # Red for security alerts
    'card_title': '🔒 Security Breach Alert',
    'fallback_title': '🔍 Fallback Security News'
}

# Selenium configuration
SELENIUM_CONFIG = {
    'implicit_wait': 5,
    'page_load_timeout': 20,
    'headless': True,
    'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

# Request configuration
REQUEST_CONFIG = {
    'timeout': 30,
    'max_retries': 3,
    'retry_delay': 2,
    'headers': {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
    }
}

# Fallback search configuration
FALLBACK_CONFIG = {
    'days_back': 30,
    'max_results': 1,
    'minimum_score': 0.5
}

# Performance optimization settings
PERFORMANCE_CONFIG = {
    'max_articles_per_source': 5,     # Limit articles processed per source
    'early_exit_threshold': 10,       # Stop if we find enough articles
    'parallel_processing': False,     # Keep False for now (single WebDriver)
    'cache_search_results': True,     # Cache results during session
    'skip_low_priority_on_success': True  # Skip lower priority sources if high priority found results
}
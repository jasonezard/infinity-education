#!/usr/bin/env python3
"""
LinkedIn Prospect Search Tool
Enhanced LinkedIn profile discovery for breach victims and decision makers
"""

import requests
import re
import time
import logging
from urllib.parse import quote, urljoin
from bs4 import BeautifulSoup
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)

class LinkedInProspectFinder:
    """Find LinkedIn profiles for business development prospects"""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive'
        })
        
        # Security decision maker titles (prioritized)
        self.security_titles = [
            'Chief Information Security Officer', 'CISO',
            'Chief Technology Officer', 'CTO', 
            'Chief Information Officer', 'CIO',
            'VP of Information Security', 'VP Security',
            'Director of Information Security', 'Security Director',
            'Head of Information Security', 'Head of Security',
            'Information Security Manager', 'Security Manager',
            'IT Security Manager', 'Cybersecurity Manager',
            'Chief Security Officer', 'CSO'
        ]
        
        # IT leadership titles
        self.it_titles = [
            'VP of Information Technology', 'VP IT',
            'Director of Information Technology', 'IT Director',
            'Head of Information Technology', 'Head of IT',
            'IT Manager', 'Technology Manager',
            'Infrastructure Manager', 'Systems Manager'
        ]
        
        # Executive titles (for escalation)
        self.executive_titles = [
            'Chief Executive Officer', 'CEO',
            'Chief Operating Officer', 'COO',
            'Chief Financial Officer', 'CFO',
            'President', 'Vice President'
        ]
    
    def generate_linkedin_search_urls(self, person_name: str, company_name: str) -> List[str]:
        """Generate multiple LinkedIn search URLs for a person"""
        urls = []
        
        # Clean inputs
        person_clean = self._clean_name(person_name)
        company_clean = self._clean_company_name(company_name)
        
        if not person_clean:
            return self.search_by_company_and_title(company_name)
        
        # Method 1: Direct profile search
        name_parts = person_clean.lower().split()
        if len(name_parts) >= 2:
            first_name = name_parts[0]
            last_name = name_parts[1]
            
            # Common LinkedIn URL patterns
            profile_patterns = [
                f"https://linkedin.com/in/{first_name}-{last_name}",
                f"https://linkedin.com/in/{first_name}{last_name}",
                f"https://linkedin.com/in/{first_name}.{last_name}",
                f"https://linkedin.com/in/{first_name}_{last_name}",
                f"https://linkedin.com/in/{first_name}-{last_name}-{hash(company_clean) % 1000}"
            ]
            urls.extend(profile_patterns)
        
        # Method 2: LinkedIn people search
        person_encoded = quote(person_clean)
        company_encoded = quote(company_clean)
        
        search_urls = [
            f"https://linkedin.com/search/results/people/?keywords={person_encoded}%20{company_encoded}",
            f"https://linkedin.com/search/results/people/?firstName={quote(name_parts[0])}&lastName={quote(name_parts[1])}&companyUniversalName={company_encoded}",
            f"https://linkedin.com/search/results/people/?keywords={person_encoded}&company={company_encoded}",
        ]
        urls.extend(search_urls)
        
        return urls
    
    def search_by_company_and_title(self, company_name: str) -> List[str]:
        """Search for security decision makers at a specific company"""
        company_encoded = quote(self._clean_company_name(company_name))
        urls = []
        
        # Search for each type of decision maker
        title_groups = [
            ('Security Leadership', self.security_titles),
            ('IT Leadership', self.it_titles),
            ('Executive Team', self.executive_titles)
        ]
        
        for group_name, titles in title_groups:
            for title in titles[:3]:  # Top 3 titles per group
                title_encoded = quote(title)
                search_url = f"https://linkedin.com/search/results/people/?keywords={title_encoded}&company={company_encoded}"
                urls.append(search_url)
        
        return urls
    
    def _clean_name(self, name: str) -> str:
        """Clean person name for LinkedIn search"""
        if not name:
            return ""
        
        # Remove titles and prefixes
        prefixes = ['mr', 'mrs', 'ms', 'dr', 'prof', 'sir', 'dame']
        name_parts = name.lower().split()
        
        cleaned_parts = []
        for part in name_parts:
            part_clean = re.sub(r'[^\w]', '', part)
            if part_clean not in prefixes and len(part_clean) > 1:
                cleaned_parts.append(part_clean.capitalize())
        
        return ' '.join(cleaned_parts[:2])  # First and last name only
    
    def _clean_company_name(self, company: str) -> str:
        """Clean company name for LinkedIn search"""
        if not company:
            return ""
        
        # Remove common suffixes
        suffixes = [
            'inc', 'corp', 'corporation', 'company', 'co', 'ltd', 'limited',
            'llc', 'lp', 'llp', 'group', 'holdings', 'international', 'worldwide'
        ]
        
        # Clean and split
        company_clean = re.sub(r'[^\w\s]', ' ', company.lower())
        words = company_clean.split()
        
        # Remove suffixes
        filtered_words = []
        for word in words:
            if word not in suffixes and len(word) > 1:
                filtered_words.append(word.capitalize())
        
        return ' '.join(filtered_words)
    
    def find_decision_makers_for_company(self, company_name: str) -> List[Dict]:
        """Find key decision makers for a company affected by a breach"""
        logger.info(f"🔍 Searching for decision makers at {company_name}")
        
        decision_makers = []
        company_clean = self._clean_company_name(company_name)
        
        # Search for each type of decision maker
        searches = [
            ('Security Leadership', ['CISO', 'Chief Information Security Officer', 'VP Security']),
            ('Technology Leadership', ['CTO', 'Chief Technology Officer', 'VP Technology']),
            ('IT Leadership', ['CIO', 'Chief Information Officer', 'IT Director']),
            ('Executive Team', ['CEO', 'President', 'COO'])
        ]
        
        for category, titles in searches:
            for title in titles:
                profile_data = self._search_linkedin_by_title(company_clean, title)
                if profile_data:
                    profile_data['category'] = category
                    profile_data['search_title'] = title
                    decision_makers.append(profile_data)
                
                # Rate limiting
                time.sleep(1)
        
        # Remove duplicates and rank by relevance
        unique_decision_makers = self._deduplicate_and_rank(decision_makers)
        
        logger.info(f"✅ Found {len(unique_decision_makers)} decision makers for {company_name}")
        return unique_decision_makers
    
    def _search_linkedin_by_title(self, company: str, title: str) -> Optional[Dict]:
        """Search LinkedIn for a specific title at a company"""
        try:
            # Create search URL
            company_encoded = quote(company)
            title_encoded = quote(title)
            
            search_url = f"https://linkedin.com/search/results/people/?keywords={title_encoded}&company={company_encoded}"
            
            # For demonstration purposes, we'll generate likely profiles
            # In a real implementation, you'd need LinkedIn API access or web scraping
            # Note: LinkedIn has strict terms of service regarding automated access
            
            # Generate likely profile based on common patterns
            profile = self._generate_likely_profile(company, title)
            return profile
            
        except Exception as e:
            logger.error(f"Error searching LinkedIn for {title} at {company}: {e}")
            return None
    
    def _generate_likely_profile(self, company: str, title: str) -> Dict:
        """Generate likely LinkedIn profile structure (placeholder for actual LinkedIn integration)"""
        # This is a placeholder - in production you would:
        # 1. Use LinkedIn Sales Navigator API
        # 2. Use LinkedIn Marketing API
        # 3. Partner with a data provider like ZoomInfo
        # 4. Use proper web scraping with respect for ToS
        
        # Generate realistic profile data structure
        profile = {
            'company': company,
            'title': title,
            'category': self._categorize_title(title),
            'linkedin_url': f"https://linkedin.com/search/results/people/?keywords={quote(title)}&company={quote(company)}",
            'search_string': f"{title} at {company}",
            'relevance_score': self._calculate_title_relevance(title),
            'contact_priority': self._get_contact_priority(title),
            'notes': f"Search for {title} role at {company} - use LinkedIn Sales Navigator for best results"
        }
        
        return profile
    
    def _categorize_title(self, title: str) -> str:
        """Categorize job title by decision-making level"""
        title_lower = title.lower()
        
        if any(term in title_lower for term in ['ciso', 'chief information security', 'security officer']):
            return 'Security Leadership'
        elif any(term in title_lower for term in ['cto', 'chief technology', 'vp technology']):
            return 'Technology Leadership'
        elif any(term in title_lower for term in ['cio', 'chief information', 'it director']):
            return 'IT Leadership'
        elif any(term in title_lower for term in ['ceo', 'president', 'coo', 'chief executive']):
            return 'Executive Team'
        elif any(term in title_lower for term in ['director', 'manager', 'head of']):
            return 'Management'
        else:
            return 'Other'
    
    def _calculate_title_relevance(self, title: str) -> float:
        """Calculate how relevant this title is for security decision making"""
        title_lower = title.lower()
        
        # Security roles get highest score
        if any(term in title_lower for term in ['ciso', 'security officer', 'security director']):
            return 1.0
        elif any(term in title_lower for term in ['cto', 'technology officer']):
            return 0.9
        elif any(term in title_lower for term in ['cio', 'information officer']):
            return 0.8
        elif any(term in title_lower for term in ['security manager', 'it security']):
            return 0.7
        elif any(term in title_lower for term in ['it director', 'technology director']):
            return 0.6
        elif any(term in title_lower for term in ['ceo', 'president']):
            return 0.5  # High authority but may not be first contact
        else:
            return 0.3
    
    def _get_contact_priority(self, title: str) -> str:
        """Get recommended contact priority"""
        relevance = self._calculate_title_relevance(title)
        
        if relevance >= 0.9:
            return 'High - Primary Contact'
        elif relevance >= 0.7:
            return 'Medium - Secondary Contact'
        elif relevance >= 0.5:
            return 'Low - Escalation Contact'
        else:
            return 'Very Low - Research Only'
    
    def _deduplicate_and_rank(self, decision_makers: List[Dict]) -> List[Dict]:
        """Remove duplicates and rank by relevance for business development"""
        # Remove duplicates based on title similarity
        unique_makers = []
        seen_titles = set()
        
        for dm in decision_makers:
            title_key = dm['title'].lower().replace(' ', '')
            if title_key not in seen_titles:
                seen_titles.add(title_key)
                unique_makers.append(dm)
        
        # Sort by relevance score (highest first)
        ranked_makers = sorted(unique_makers, key=lambda x: x['relevance_score'], reverse=True)
        
        return ranked_makers[:5]  # Top 5 most relevant
    
    def create_outreach_template(self, company_name: str, vulnerability_type: str, decision_makers: List[Dict]) -> str:
        """Create personalized outreach template"""
        template = []
        template.append(f"🎯 OUTREACH TEMPLATE FOR {company_name.upper()}")
        template.append("=" * 60)
        template.append(f"BREACH TYPE: {vulnerability_type}")
        template.append(f"URGENCY: High - Recent security incident")
        template.append("")
        
        template.append("📧 PERSONALIZED OUTREACH APPROACH:")
        template.append("")
        
        for i, dm in enumerate(decision_makers[:3], 1):
            template.append(f"{i}. {dm['category']} - {dm['title']}")
            template.append(f"   Priority: {dm['contact_priority']}")
            template.append(f"   LinkedIn Search: {dm['linkedin_url']}")
            template.append("")
            template.append("   📝 SUGGESTED MESSAGE:")
            template.append(f"   Subject: Urgent: {vulnerability_type} Security Assessment for {company_name}")
            template.append("")
            template.append("   Hi [Name],")
            template.append("")
            template.append(f"   I noticed {company_name} recently experienced a {vulnerability_type.lower()}")
            template.append("   incident. As someone responsible for [security/technology] at your")
            template.append("   organization, I wanted to reach out immediately.")
            template.append("")
            template.append("   We specialize in emergency web application penetration testing")
            template.append("   and can help ensure this type of vulnerability doesn't happen again.")
            template.append("")
            template.append("   Would you be available for a brief 15-minute call this week")
            template.append("   to discuss a comprehensive security assessment?")
            template.append("")
            template.append("   Best regards,")
            template.append("   [Your Name]")
            template.append("   [Your Title]")
            template.append("   [Company] - Web Application Security Specialists")
            template.append("")
            template.append("-" * 40)
            template.append("")
        
        return "\n".join(template)

def main():
    """Test the LinkedIn prospect finder"""
    finder = LinkedInProspectFinder()
    
    # Test companies from recent breaches
    test_companies = [
        "Qantas Airways",
        "Marks & Spencer", 
        "Coinbase",
        "SAP",
        "Craft CMS"
    ]
    
    for company in test_companies:
        print(f"\n🔍 Testing: {company}")
        decision_makers = finder.find_decision_makers_for_company(company)
        
        for dm in decision_makers:
            print(f"  • {dm['title']} - {dm['category']} (Score: {dm['relevance_score']:.1f})")
            print(f"    Search: {dm['linkedin_url']}")
        
        # Generate outreach template
        template = finder.create_outreach_template(company, "Web Application Vulnerability", decision_makers)
        print("\n" + template)
        print("\n" + "="*80)

if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Performance Testing Script
Compare the efficiency of different scraper versions
"""

import time
import subprocess
import sys
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s')

def run_scraper(script_name: str, timeout: int = 300) -> dict:
    """Run a scraper script and measure performance"""
    logging.info(f"🧪 Testing {script_name}...")
    
    start_time = time.time()
    try:
        result = subprocess.run(
            [sys.executable, script_name],
            capture_output=True,
            text=True,
            timeout=timeout
        )
        
        elapsed = time.time() - start_time
        
        # Parse output for metrics
        output = result.stdout + result.stderr
        articles_found = output.count("Successfully processed") + output.count("✅ Article")
        errors = output.count("ERROR") + output.count("❌")
        
        return {
            'script': script_name,
            'success': result.returncode == 0,
            'elapsed_time': elapsed,
            'articles_found': articles_found,
            'errors': errors,
            'output_lines': len(output.split('\n'))
        }
        
    except subprocess.TimeoutExpired:
        elapsed = time.time() - start_time
        logging.warning(f"⏰ {script_name} timed out after {timeout}s")
        return {
            'script': script_name,
            'success': False,
            'elapsed_time': elapsed,
            'articles_found': 0,
            'errors': 1,
            'timeout': True
        }
    except Exception as e:
        elapsed = time.time() - start_time
        logging.error(f"💥 Error running {script_name}: {e}")
        return {
            'script': script_name,
            'success': False,
            'elapsed_time': elapsed,
            'articles_found': 0,
            'errors': 1,
            'exception': str(e)
        }

def print_results(results: list):
    """Print formatted performance results"""
    print("\n" + "="*80)
    print("🏆 PERFORMANCE COMPARISON RESULTS")
    print("="*80)
    
    print(f"{'Script':<25} {'Time (s)':<10} {'Articles':<10} {'Errors':<8} {'Status':<10}")
    print("-" * 80)
    
    for result in results:
        status = "✅ SUCCESS" if result['success'] else "❌ FAILED"
        if result.get('timeout'):
            status = "⏰ TIMEOUT"
        
        print(f"{result['script']:<25} {result['elapsed_time']:<10.1f} {result['articles_found']:<10} "
              f"{result['errors']:<8} {status:<10}")
    
    # Find the winner
    successful = [r for r in results if r['success']]
    if successful:
        fastest = min(successful, key=lambda x: x['elapsed_time'])
        most_articles = max(successful, key=lambda x: x['articles_found'])
        
        print("\n🏅 WINNERS:")
        print(f"Fastest: {fastest['script']} ({fastest['elapsed_time']:.1f}s)")
        print(f"Most Articles: {most_articles['script']} ({most_articles['articles_found']} articles)")
        
        # Calculate efficiency score
        for result in successful:
            if result['elapsed_time'] > 0:
                result['efficiency'] = result['articles_found'] / result['elapsed_time']
        
        most_efficient = max(successful, key=lambda x: x.get('efficiency', 0))
        print(f"Most Efficient: {most_efficient['script']} "
              f"({most_efficient.get('efficiency', 0):.2f} articles/second)")

def main():
    """Run performance tests"""
    print("🚀 SCRAPER PERFORMANCE TESTING")
    print(f"📅 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # List of scrapers to test
    scrapers = [
        'news_scraper.py',        # Original optimized version
        'news_scraper_turbo.py',  # Ultra-fast version
    ]
    
    results = []
    
    for scraper in scrapers:
        try:
            result = run_scraper(scraper, timeout=180)  # 3 minute timeout
            results.append(result)
            
            # Brief pause between tests
            time.sleep(2)
            
        except KeyboardInterrupt:
            logging.info("⏹️ Testing interrupted by user")
            break
    
    # Print results
    if results:
        print_results(results)
        
        # Recommendations
        print("\n💡 RECOMMENDATIONS:")
        successful = [r for r in results if r['success']]
        
        if successful:
            fastest = min(successful, key=lambda x: x['elapsed_time'])
            if fastest['elapsed_time'] < 60:
                print(f"✅ Use {fastest['script']} for fastest results")
            
            most_productive = max(successful, key=lambda x: x['articles_found'])
            if most_productive['articles_found'] > 0:
                print(f"📊 Use {most_productive['script']} for most comprehensive results")
        else:
            print("❌ No scrapers completed successfully. Check configuration and network.")
    else:
        print("❌ No tests completed.")

if __name__ == "__main__":
    main()

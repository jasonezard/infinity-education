#!/usr/bin/env python3
"""
WebDriver Troubleshooting Script
This script helps diagnose and fix WebDriver issues on Windows systems.
"""

import os
import sys
import shutil
import platform
import subprocess
from pathlib import Path

def clear_webdriver_cache():
    """Clear the webdriver-manager cache"""
    cache_paths = [
        os.path.expanduser("~/.wdm"),
        os.path.expanduser("~/.cache/selenium"),
        os.path.join(os.environ.get('APPDATA', ''), 'webdriver-manager') if os.name == 'nt' else None
    ]
    
    for cache_path in cache_paths:
        if cache_path and os.path.exists(cache_path):
            try:
                shutil.rmtree(cache_path)
                print(f"✓ Cleared cache: {cache_path}")
            except Exception as e:
                print(f"✗ Failed to clear cache {cache_path}: {e}")

def check_chrome_installation():
    """Check if Chrome is installed and get version"""
    chrome_paths = [
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "/usr/bin/google-chrome",
        "/usr/bin/chromium-browser"
    ]
    
    for chrome_path in chrome_paths:
        if os.path.exists(chrome_path):
            try:
                result = subprocess.run([chrome_path, "--version"], 
                                      capture_output=True, text=True, timeout=10)
                if result.returncode == 0:
                    version = result.stdout.strip()
                    print(f"✓ Chrome found: {chrome_path}")
                    print(f"  Version: {version}")
                    return chrome_path, version
            except Exception as e:
                print(f"✗ Error checking Chrome at {chrome_path}: {e}")
    
    print("✗ Chrome not found in standard locations")
    return None, None

def test_webdriver_basic():
    """Test basic WebDriver functionality"""
    try:
        from selenium import webdriver
        from selenium.webdriver.chrome.options import Options
        
        print("Testing basic WebDriver initialization...")
        
        options = Options()
        options.add_argument('--headless')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-gpu')
        
        # Try without webdriver-manager first
        try:
            driver = webdriver.Chrome(options=options)
            print("✓ Chrome WebDriver initialized successfully (system PATH)")
            driver.quit()
            return True
        except Exception as e:
            print(f"✗ System PATH method failed: {e}")
        
        # Try with webdriver-manager
        try:
            from selenium.webdriver.chrome.service import Service
            from webdriver_manager.chrome import ChromeDriverManager
            
            service = Service(ChromeDriverManager().install())
            driver = webdriver.Chrome(service=service, options=options)
            print("✓ Chrome WebDriver initialized successfully (webdriver-manager)")
            driver.quit()
            return True
        except Exception as e:
            print(f"✗ webdriver-manager method failed: {e}")
        
        return False
        
    except ImportError as e:
        print(f"✗ Missing required packages: {e}")
        return False

def test_webdriver_with_fix():
    """Test WebDriver with architecture-specific fixes"""
    try:
        from selenium import webdriver
        from selenium.webdriver.chrome.options import Options
        from selenium.webdriver.chrome.service import Service
        from webdriver_manager.chrome import ChromeDriverManager
        
        print("Testing WebDriver with architecture fixes...")
        
        options = Options()
        options.add_argument('--headless')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-gpu')
        options.add_argument('--disable-blink-features=AutomationControlled')
        
        # Clear cache first
        clear_webdriver_cache()
        
        # Try with fresh download
        try:
            driver_path = ChromeDriverManager(version="latest").install()
            print(f"Downloaded driver to: {driver_path}")
            
            service = Service(driver_path)
            driver = webdriver.Chrome(service=service, options=options)
            print("✓ Chrome WebDriver initialized successfully with fresh download")
            driver.get("https://www.google.com")
            print("✓ Successfully navigated to Google")
            driver.quit()
            return True
        except Exception as e:
            print(f"✗ Fresh download method failed: {e}")
            return False
            
    except ImportError as e:
        print(f"✗ Missing required packages: {e}")
        return False

def main():
    """Main troubleshooting function"""
    print("WebDriver Troubleshooting Script")
    print("=" * 40)
    
    # System info
    print(f"OS: {platform.system()} {platform.release()}")
    print(f"Architecture: {platform.machine()}")
    print(f"Python: {sys.version}")
    print()
    
    # Check Chrome installation
    print("1. Checking Chrome installation...")
    chrome_path, chrome_version = check_chrome_installation()
    print()
    
    if not chrome_path:
        print("Please install Google Chrome first:")
        print("https://www.google.com/chrome/")
        return
    
    # Test basic WebDriver
    print("2. Testing basic WebDriver functionality...")
    if test_webdriver_basic():
        print("✓ WebDriver is working correctly!")
        return
    print()
    
    # Test with fixes
    print("3. Testing WebDriver with architecture fixes...")
    if test_webdriver_with_fix():
        print("✓ WebDriver is working with fixes!")
        print("\nThe main application should now work correctly.")
    else:
        print("✗ WebDriver still not working.")
        print("\nTroubleshooting suggestions:")
        print("1. Ensure Chrome is fully updated")
        print("2. Try running as administrator")
        print("3. Check Windows Defender/antivirus settings")
        print("4. Manually download ChromeDriver from:")
        print("   https://chromedriver.chromium.org/downloads")

if __name__ == "__main__":
    main()

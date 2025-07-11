#!/usr/bin/env python3
"""
Fix Teams webhook URL issues
"""

import os
import re

def fix_webhook_url():
    """Fix common webhook URL issues"""
    print("🔧 Teams Webhook URL Fixer")
    print("=" * 40)
    
    # Read current env file
    env_file = 'env'
    
    if not os.path.exists(env_file):
        print("❌ 'env' file not found!")
        print("Creating template env file...")
        with open(env_file, 'w') as f:
            f.write("TEAMS_WEBHOOK_URL=https://outlook.office.com/webhook/your-webhook-url-here\n")
        print("✅ Created 'env' file template")
        print("📝 Please update it with your actual Teams webhook URL")
        return
    
    # Read current content
    with open(env_file, 'r') as f:
        content = f.read()
    
    print("📄 Current env file content:")
    print(content)
    print()
    
    # Look for webhook URL
    webhook_pattern = r'TEAMS_WEBHOOK_URL\s*=\s*(.+)'
    match = re.search(webhook_pattern, content)
    
    if not match:
        print("❌ No TEAMS_WEBHOOK_URL found in env file")
        return
    
    webhook_url = match.group(1).strip()
    print(f"🔍 Found webhook URL: {webhook_url[:50]}...")
    
    # Check for common issues
    issues_found = []
    fixed_url = webhook_url
    
    # Fix 1: Remove quotes
    if webhook_url.startswith('"') and webhook_url.endswith('"'):
        fixed_url = webhook_url[1:-1]
        issues_found.append("Removed surrounding quotes")
    
    if webhook_url.startswith("'") and webhook_url.endswith("'"):
        fixed_url = webhook_url[1:-1]
        issues_found.append("Removed surrounding quotes")
    
    # Fix 2: Fix malformed https
    if fixed_url.startswith('https//'):
        fixed_url = fixed_url.replace('https//', 'https://', 1)
        issues_found.append("Fixed malformed https://")
    
    # Fix 3: Remove extra spaces
    if fixed_url != fixed_url.strip():
        fixed_url = fixed_url.strip()
        issues_found.append("Removed extra whitespace")
    
    # Fix 4: Check if it looks like a valid webhook
    if not fixed_url.startswith('https://'):
        issues_found.append("❌ URL should start with https://")
    
    if 'webhook' not in fixed_url.lower():
        issues_found.append("⚠️ URL doesn't contain 'webhook' - might be incorrect")
    
    if 'office.com' not in fixed_url.lower() and 'outlook.com' not in fixed_url.lower():
        issues_found.append("⚠️ URL doesn't contain office.com or outlook.com")
    
    # Report findings
    if issues_found:
        print("🔧 Issues found:")
        for issue in issues_found:
            print(f"  - {issue}")
        
        if fixed_url != webhook_url:
            print(f"\n✨ Suggested fix:")
            print(f"OLD: {webhook_url}")
            print(f"NEW: {fixed_url}")
            
            # Ask user if they want to apply fix
            response = input("\nApply fix? (y/n): ").lower().strip()
            if response == 'y':
                # Update the file
                new_content = content.replace(webhook_url, fixed_url)
                with open(env_file, 'w') as f:
                    f.write(new_content)
                print("✅ Fixed webhook URL in env file")
            else:
                print("❌ No changes made")
    else:
        print("✅ Webhook URL looks good!")
    
    # Test the webhook
    print("\n🧪 Testing webhook...")
    try:
        from teams_notifier import TeamsNotifier
        notifier = TeamsNotifier()
        success = notifier.test_webhook()
        if success:
            print("✅ Webhook test successful!")
        else:
            print("❌ Webhook test failed")
    except Exception as e:
        print(f"❌ Webhook test error: {e}")

if __name__ == "__main__":
    fix_webhook_url()

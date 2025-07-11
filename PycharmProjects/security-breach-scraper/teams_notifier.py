# teams_notifier.py
# Microsoft Teams webhook integration for posting security breach alerts

import json
import requests
import logging
import time
from datetime import datetime
from typing import Dict, List, Optional
import os
from dotenv import load_dotenv

# Load environment variables from '.env' file
load_dotenv()


class TeamsNotifier:
    """Handles sending rich, actionable notifications to Microsoft Teams via webhook."""

    def __init__(self):
        self.webhook_url = os.getenv('TEAMS_WEBHOOK_URL')
        self.logger = logging.getLogger(__name__)

        if not self.webhook_url:
            raise ValueError(
                "TEAMS_WEBHOOK_URL environment variable is not set. Please create a .env file with the webhook URL.")

        if self.webhook_url.startswith('https//'):
            self.webhook_url = self.webhook_url.replace('https//', 'https://', 1)
            self.logger.warning("Corrected a malformed TEAMS_WEBHOOK_URL.")

    def _send_message(self, card_payload: Dict) -> bool:
        """Sends a JSON payload to the configured Teams webhook."""
        try:
            response = requests.post(
                self.webhook_url,
                headers={'Content-Type': 'application/json'},
                data=json.dumps(card_payload),
                timeout=30
            )
            response.raise_for_status()
            return True
        except requests.exceptions.RequestException as e:
            self.logger.error(
                f"Failed to send Teams notification: {e}. Response: {e.response.text if e.response else 'No response'}")
            return False

    def _create_adaptive_card_for_prospect(self, prospect: Dict) -> Dict:
        """Creates a detailed Adaptive Card for a single business prospect."""

        is_repost = prospect.get('is_repost', False)
        card_main_title = "🔄 Last Processed Prospect (No New Alerts)" if is_repost else "🎯 New OWASP Top 10 Breach Prospect"

        decision_makers_block = []
        for dm in prospect.get('decision_makers', []):
            decision_makers_block.append(
                {"type": "TextBlock", "text": f"**{dm.get('name', 'N/A')}** - _{dm.get('title', 'Title not found')}_",
                 "wrap": True, "size": "Medium"})
            decision_makers_block.append({"type": "ActionSet", "actions": [
                {"type": "Action.OpenUrl", "title": "View on LinkedIn", "url": dm.get('linkedin_profile', '#')}]})

        if not decision_makers_block:
            decision_makers_block.append(
                {"type": "TextBlock", "text": "No specific contacts identified in the article.", "wrap": True,
                 "isSubtle": True})

        fit_rating = prospect.get('fit_rating', 0)
        fit_emoji = "🔥🔥🔥" if fit_rating >= 8 else "🔥🔥" if fit_rating >= 6 else "🔥" if fit_rating >= 4 else ""

        card_json = {
            "type": "message",
            "attachments": [{
                "contentType": "application/vnd.microsoft.card.adaptive",
                "content": {
                    "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
                    "type": "AdaptiveCard",
                    "version": "1.5",
                    "body": [
                                {"type": "TextBlock", "text": card_main_title, "weight": "Bolder", "size": "Large",
                                 "color": "Attention" if not is_repost else "Default"},
                                {"type": "TextBlock", "text": prospect.get('company_name', 'Unknown Company'),
                                 "weight": "Bolder", "size": "ExtraLarge", "wrap": True},
                                {
                                    "type": "FactSet",
                                    "facts": [
                                        {"title": "OWASP Category:",
                                         "value": prospect.get('vulnerability_type', 'N/A')},
                                        {"title": "Published:",
                                         "value": prospect.get('article', {}).get('published_formatted', 'N/A')},
                                        {"title": "Prospect Fit:", "value": f"**{fit_rating} / 10** {fit_emoji}"}
                                    ],
                                    "separator": True
                                },
                                {"type": "TextBlock", "text": "**Summary:**", "weight": "Bolder", "wrap": True,
                                 "separator": True},
                                {"type": "TextBlock", "text": prospect.get('summary', 'No summary was generated.'),
                                 "wrap": True},
                                {"type": "TextBlock", "text": "**Key Decision Makers:**", "wrap": True,
                                 "separator": True}
                            ] + decision_makers_block,
                    "actions": [
                        {"type": "Action.OpenUrl", "title": "Read Source Article",
                         "url": prospect.get('article', {}).get('url', '#')},
                        {"type": "Action.OpenUrl", "title": "Find Phone Number",
                         "url": prospect.get('phone_search_link', '#')}
                    ]
                }
            }]
        }
        return card_json

    def _create_summary_notification(self, prospect_count: int) -> Dict:
        """Creates a simple summary card to announce the batch of prospects."""
        return {
            "type": "message",
            "attachments": [{"contentType": "application/vnd.microsoft.card.adaptive",
                             "content": {"type": "AdaptiveCard", "version": "1.5", "body": [{"type": "TextBlock",
                                                                                             "text": f"📊 Daily OWASP Prospecting Report: **{prospect_count}** new potential lead(s) identified.",
                                                                                             "size": "Medium",
                                                                                             "wrap": True},
                                                                                            {"type": "TextBlock",
                                                                                             "text": "Detailed briefing cards for each prospect will follow this message.",
                                                                                             "wrap": True,
                                                                                             "isSubtle": True}]}}]
        }

    def send_prospect_notifications(self, prospects: List[Dict]):
        """Sends notifications for a list of prospects."""
        if not prospects:
            self.send_no_results_notification()
            return

        # If this is a repost of the last prospect, don't send the summary card.
        is_repost = prospects[0].get('is_repost', False)
        if not is_repost:
            self.logger.info(f"Sending notifications for {len(prospects)} new prospects to Teams.")
            summary_card = self._create_summary_notification(len(prospects))
            if self._send_message(summary_card):
                time.sleep(1)

        for prospect in prospects:
            try:
                adaptive_card = self._create_adaptive_card_for_prospect(prospect)
                if self._send_message(adaptive_card):
                    self.logger.info(f"  - Sent notification for {prospect.get('company_name')}")
                else:
                    self.logger.error(f"Failed to send detailed card for {prospect.get('company_name')}")
                time.sleep(2)
            except Exception as e:
                self.logger.error(f"Failed to create or send card for {prospect.get('company_name')}: {e}")

    def send_no_results_notification(self):
        """Sends a simple 'all clear' message to Teams."""
        self.logger.info("Sending 'No New Prospects' notification.")
        no_results_card = {"type": "message", "attachments": [{"contentType": "application/vnd.microsoft.card.adaptive",
                                                               "content": {"type": "AdaptiveCard", "version": "1.5",
                                                                           "body": [{"type": "TextBlock",
                                                                                     "text": "✅ Scan Complete: No new OWASP Top 10 breach prospects were identified.",
                                                                                     "wrap": True},
                                                                                    {"type": "TextBlock",
                                                                                     "text": f"Checked at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
                                                                                     "isSubtle": True,
                                                                                     "spacing": "small"}]}}]}
        self._send_message(no_results_card)
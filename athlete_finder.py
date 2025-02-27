import tweepy
import pandas as pd
from datetime import datetime
import json
import time

class AthleteScout:
    def __init__(self, bearer_token):
        self.client = tweepy.Client(bearer_token=bearer_token)
        
    def search_athletes(self, search_terms=None):
        if search_terms is None:
            search_terms = [
                '"high school athlete" -is:retweet',
                '"class of 2024" athlete -is:retweet',
                '"class of 2025" athlete -is:retweet',
                'recruiting highlight film -is:retweet'
            ]
        
        athletes_data = []
        
        for query in search_terms:
            try:
                tweets = self.client.search_recent_tweets(
                    query=query,
                    tweet_fields=['created_at', 'public_metrics', 'context_annotations', 'entities'],
                    user_fields=['description', 'location', 'public_metrics'],
                    expansions=['author_id'],
                    max_results=100
                )
                
                if not tweets.data:
                    continue
                    
                users = {u["id"]: u for u in tweets.includes['users']}
                
                for tweet in tweets.data:
                    user = users[tweet.author_id]
                    
                    # Check if user's bio suggests they're a high school athlete
                    if self._is_likely_athlete(user.description):
                        athlete_info = {
                            'username': user.username,
                            'description': user.description,
                            'location': user.location,
                            'followers': user.public_metrics['followers_count'],
                            'tweet_text': tweet.text,
                            'tweet_date': tweet.created_at,
                            'tweet_likes': tweet.public_metrics['like_count'],
                            'tweet_retweets': tweet.public_metrics['retweet_count']
                        }
                        athletes_data.append(athlete_info)
                
            except Exception as e:
                print(f"Error processing query '{query}': {str(e)}")
                continue
                
        return athletes_data
    
    def _is_likely_athlete(self, bio):
        if not bio:
            return False
            
        athlete_keywords = [
            'athlete', 'football', 'basketball', 'baseball',
            'soccer', 'track', 'field', 'recruiting',
            'committed', 'offers', 'varsity', 'stats',
            'highlights', 'class of', 'student athlete'
        ]
        
        bio_lower = bio.lower()
        return any(keyword in bio_lower for keyword in athlete_keywords)
    
    def export_to_csv(self, athletes_data, filename=None):
        if not filename:
            filename = f'athletes_data_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
        
        df = pd.DataFrame(athletes_data)
        df.to_csv(filename, index=False)
        return filename

def main():
    # You'll need to replace this with your actual bearer token
    BEARER_TOKEN = "YOUR_BEARER_TOKEN"
    
    scout = AthleteScout(BEARER_TOKEN)
    
    print("Searching for high school athletes...")
    athletes = scout.search_athletes()
    
    if athletes:
        filename = scout.export_to_csv(athletes)
        print(f"\nFound {len(athletes)} potential athletes!")
        print(f"Data exported to {filename}")
        
        # Print sample of the data
        print("\nSample athlete data:")
        for athlete in athletes[:3]:
            print(f"\nUsername: @{athlete['username']}")
            print(f"Location: {athlete['location']}")
            print(f"Bio: {athlete['description']}")
            print(f"Followers: {athlete['followers']}")
            print("-" * 50)
    else:
        print("No athletes found matching the criteria.")

if __name__ == "__main__":
    main() 
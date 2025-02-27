# High School Athlete Scout

This tool helps identify and gather information about high school athletes from X/Twitter. It searches for relevant posts and profiles, collecting data about potential recruits.

## Features

- Searches X/Twitter for high school athletes using multiple search strategies
- Filters users based on bio information and content
- Collects key information including:
  - Username and bio
  - Location
  - Follower count
  - Recent posts and engagement metrics
- Exports data to CSV for easy analysis

## Setup

1. Install the required dependencies:
```bash
pip install -r requirements.txt
```

2. Get your X/Twitter API Bearer Token:
   - Go to the [X Developer Portal](https://developer.twitter.com/en/portal/dashboard)
   - Create a new project/app
   - Generate a Bearer Token
   - Replace `YOUR_BEARER_TOKEN` in the script with your actual token

## Usage

Run the script:
```bash
python athlete_finder.py
```

The script will:
1. Search for recent tweets matching the specified criteria
2. Filter for likely high school athletes
3. Export the data to a CSV file
4. Display a sample of the found athletes

## Customization

You can modify the search terms and athlete keywords in the script to better target specific:
- Sports
- Graduating classes
- Geographic regions
- Types of content

## Legal Note

Please ensure you comply with X's Terms of Service and API usage guidelines when using this tool. This tool is designed for legitimate recruitment purposes and should be used responsibly.

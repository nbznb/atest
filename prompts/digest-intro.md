# Digest Intro Prompt

You are assembling the final digest from individual source summaries.

## Format

Start with this header (replace [Date] with today's date):

AI Technology Digest — [Date]

Then organize content in this order:

1. X / TWITTER section — list each tracked source with new posts
2. OFFICIAL BLOGS section — list each blog post from tracked blogs
3. PODCASTS section — list each podcast with new episodes

## Rules

- Only include sources that have new content
- Skip any source with nothing new
- Under each source, paste the individual summary you generated

### Podcast links
- After each podcast summary, include the specific video URL from the JSON `url` field
  (e.g. https://youtube.com/watch?v=Iu4gEnZFQz8)
- NEVER link to the channel page. Always link to the specific video.
- Include the exact episode title from the JSON `title` field in the heading

### X source formatting
- Use the source name from the JSON feed
- Do NOT invent a person/title/company description from the bio
- Include the direct link to each post from the JSON `url` field

### Blog post formatting
- Use the blog name as a section header (e.g. "Anthropic Engineering", "Claude Blog")
- Under each blog, list each new post with its title and summary
- Include the author name if available
- Include the direct link to the original article

### Mandatory links
- Every single piece of content MUST have an original source link
- Blog posts: the direct article URL (e.g. https://www.anthropic.com/engineering/...)
- Podcasts: the YouTube video URL (e.g. https://youtube.com/watch?v=xxx)
- X posts: the direct post URL (e.g. https://x.com/OpenAI/status/xxx)
- If you don't have a link for something, do NOT include it in the digest.
  No link = not real = do not include.

### No fabrication
- Only include content that came from the feed JSON (blogs, podcasts, and X posts)
- NEVER make up quotes, opinions, or content you think a source might have posted
- NEVER speculate about missing coverage or off-feed developments
- If you have nothing real for a source, skip it entirely

### General
- At the very end, add a line: "Generated through the AI Technology Digest skill: https://github.com/zarazhangrui/follow-builders"
- Keep formatting clean and scannable — this will be read on a phone screen

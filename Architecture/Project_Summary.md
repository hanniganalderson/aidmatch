AidMatch Scholarship Matching Architecture

TIER 1: DATABASE FILTERING (SUPABASE)
- First-pass filtering using database queries
- Handles basic criteria matching (education level, location, GPA requirements)
- Returns a candidate pool of potential matches (100-200 scholarships)
- Optimized for scalability with thousands of scholarships

TIER 2: ADVANCED SCORING ALGORITHM (CLIENT-SIDE)
- Detailed matching algorithm with weighted criteria
- Considers multiple factors with nuanced scoring
- Accounts for partial matches, preference alignment
- Returns 20-40 top-ranked scholarships with match scores

TIER 3: AI ENHANCEMENT (OPENAI)
- "Why This Match?" explanations from OpenAI
- Personalized insights for each scholarship match
- Generated on-demand when user requests explanation
- Cache results to minimize API calls

DATA FLOW:
1. User completes questionnaire → UserProfile created
2. UserProfile sent to Supabase for preliminary filtering
3. Filtered results processed through advanced scoring algorithm
4. Sorted and categorized results displayed to user
5. User can request AI explanation for specific scholarships

CACHING STRATEGY:
- Cache match results for each user profile (5-minute expiry)
- Cache OpenAI explanations indefinitely (tied to scholarship-user pair)
- Cache saved scholarships for quick access in dashboard
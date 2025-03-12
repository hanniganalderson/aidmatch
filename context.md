## Project Summary  
AidMatch is an AI-powered platform designed to match students with **high-ROI scholarships** based on **GPA, major, state, Pell eligibility, and education level**. It prioritizes **privacy, ease of use, and efficiency**, ensuring students find the best opportunities with minimal effort.

---

## Technical Requirements  
- **Supabase** for authentication and database.  
- **Next.js** frontend.  
- **Node.js Express API** for backend connections.  
- **OpenAI API** for AI-powered ranking of scholarships.  
- **Tailwind CSS** for frontend styling.  
- **Vercel** for deployment.  

---

## Documentation and Comments  
- Write meaningful comments and documentation only when necessary.  
- Don't use personal pronouns like "I" or "we" in comments or documentation.  
- Write documentation for all functions, classes, and modules.  
- Write meaningful docstrings that describe the **intention** and **behavior** of functions, classes, or modules, and explain assumptions.  
- Keep docstrings up to date and to the point.  

---

## Error Handling  
- Don't wrap code in `try-except` blocks unless catching a specific exception.  
- Use **Supabase error handling** to gracefully manage API failures.  
- Log and report **failed queries** to avoid silent failures.  

---

## Printing and Logging  
- Use a **logger** for all logging needs.  
- Supabase responses should be **logged properly** before returning errors.  

---

## Dependencies  
- Initialize all dependencies in the `dependencies.js` file.  
- Pass dependencies (Supabase, AI API, Express) to classes when they are initialized.  

---

## Configuration  
- Write configuration in the `config.js` file.  
- Store API keys, database URLs, and sensitive variables in **environment variables (`.env`)**.  
- Do not **hardcode secrets** into the project.  

---

## Naming Conventions  
- Use **camelCase** for function and variable names.  
- Use **UPPER_SNAKE_CASE** for constants.  
- Use **PascalCase** for React components.  

---

## Execution Flow  
- Always write **unit tests first** before implementing new features.  
- Run tests before pushing changes to production.  
- Ensure database queries are optimized before deploying to **Vercel**.  

---

## Clean Code  
- Write **clean, readable, and maintainable code**.  
- Keep functions **small and focused**.  
- Use **descriptive variable and function names**.  
- Keep comments **concise and meaningful**.  

---

## Development Flow  
- Write **tests before implementing features**.  
- Validate API queries in **Postman** before integrating them into the frontend.  
- Ensure the database structure aligns with **scholarship matching logic**.  

---

## File Structure  
- Keep **`init.py`** files empty.  
- Organize backend files into **controllers, services, and routes**.  
- Maintain a **clear folder structure** for React components.  

---

## Code Style  
- Always use **single quotes** for strings in JavaScript.  
- Format code with **Prettier** before commits.  

---

## Rewrite, Improve, and Refactor  
- Keep code **clean and easy to understand**.  
- Follow **DRY (Don't Repeat Yourself)** principles.  
- Ensure changes do **not break existing features**.  

---

## Tests  
- Write **unit tests** before writing production code.  
- Run tests in **a virtual environment** before deploying.  
- Keep **tests clean and up to date**.  

---

## Debugging  
- If unsure about a solution, **add debug logs** and test locally.  
- **Remove debug logs** before committing changes.  

---

## Async  
- Use **async functions** whenever possible for **database calls**.  
- Ensure **Supabase queries are asynchronous** to prevent blocking the main thread.  

---

## Memory  
- Store project-related information in `context.md` for **AI context** in Windsurf.  
- Keep database **schemas, API structures, and development notes** updated in this file.  

---

## Planning  
- **Plan code structure before implementation**.  
- Consider **how changes impact the database, API, and frontend**.  
- Think about **how the AI ranking system improves scholarship recommendations**.  

---

# AidMatch: AI-Powered Scholarship Matching Platform

## Project Overview

AidMatch is a web application designed to help students find and apply for scholarships that match their academic profile, interests, and background. The platform leverages AI to provide personalized scholarship recommendations, track application deadlines, and assist with scholarship essays.

## Core Features

### 1. User Profiles
- Students create profiles with their academic information:
  - Education level
  - School/university
  - Major/field of study
  - GPA
  - Location
  - Extracurricular activities
  - Demographic information

### 2. AI-Powered Scholarship Matching
- Analyzes user profiles to suggest relevant scholarships
- Scores and ranks scholarships based on match quality
- Provides personalized recommendations based on eligibility requirements

### 3. Scholarship Management
- Save scholarships to a personal dashboard
- Track application deadlines
- Set reminders for upcoming deadlines
- View scholarship details (amount, requirements, application process)

### 4. Premium Features (Plus Subscription)
- Unlimited saved scholarships (free users limited to 3)
- AI essay assistance for scholarship applications
- Deadline reminders via email/notifications
- Enhanced AI recommendations
- Priority access to new features

## Technical Architecture

### Frontend
- React for the UI framework
- TypeScript for type safety
- Tailwind CSS for styling
- Framer Motion for animations
- React Router for navigation
- Context API for state management

### Backend
- Supabase for database and authentication
- Tables include:
  - user_profiles
  - scholarships
  - saved_scholarships
  - subscription_data

### AI Components
- Natural language processing for matching students to scholarships
- Text generation for essay assistance
- Recommendation engine for scholarship suggestions

## User Journey

1. **Onboarding**
   - Sign up/login
   - Complete questionnaire for profile setup
   - Educational background
   - Demographic information
   - Interests and extracurriculars

2. **Dashboard Experience**
   - Overview of saved scholarships
   - Profile completion status
   - Upcoming deadlines
   - Financial resources (FAFSA information)
   - AI recommendation section

3. **Scholarship Discovery**
   - Browse AI-recommended scholarships
   - Search and filter scholarship database
   - Save interesting opportunities
   - View match percentage and eligibility

4. **Application Process**
   - Track application status
   - Receive deadline reminders
   - Essay assistance (Plus users)
   - Application requirement checklists

## Business Model

- **Freemium Model**:
  - Basic features available to all users
  - Premium features (Plus subscription) for paying users
  - Plus subscription unlocks unlimited saved scholarships, AI essay assistance, and enhanced features

## Target Audience

- High school students preparing for college
- Current undergraduate and graduate students
- Parents helping their children find financial aid
- School counselors and advisors
- First-generation college students
- International students seeking funding opportunities

## Value Proposition

AidMatch simplifies the overwhelming scholarship search process by providing:

1. **Personalization**: Matches students with scholarships they're actually eligible for
2. **Efficiency**: Saves time by filtering through thousands of scholarships
3. **Organization**: Keeps track of deadlines and application requirements
4. **Guidance**: Provides assistance with applications and essays
5. **Accessibility**: Makes scholarship information more accessible to all students

## Future Development Goals

- Mobile application
- Integration with college application platforms
- Community features for scholarship reviews and tips
- Direct application submission through the platform
- Expanded AI capabilities for college admissions assistance
- Partnerships with scholarship providers for exclusive opportunities

Make it fun, not boring. Use gamification, instant feedback, and visuals so it doesn’t feel like homework.
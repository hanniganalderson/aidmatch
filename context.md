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
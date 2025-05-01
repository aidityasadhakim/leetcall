# LeetCall - Master LeetCode Through Spaced Repetition

LeetCall is a sophisticated web application designed to help developers effectively learn and retain LeetCode problem solutions using the proven principles of spaced repetition learning.

## Features

- 🧠 **Smart Review Scheduling**: Automated review scheduling using the SM-2 spaced repetition algorithm
- 📊 **Centralized Problem Tracking**: Track your LeetCode problems, review history, and performance metrics in one place
- 🤝 **Progress Sharing**: Share your learning journey with peers or mentors while maintaining privacy control
- 🎯 **Personalized Learning**: Review intervals adapt to your performance and learning pace
- 🔄 **Flexible Review System**: Rate your problem-solving quality on a 0-3 scale to optimize review scheduling
- 🔐 **Role-based Access Control**: Share your workspace with different permission levels (Viewer, Reviewer, Editor)

## Tech Stack

- **Frontend/Backend**: [Next.js](https://nextjs.org/) (App Router)
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Supabase](https://supabase.com/)
- **Authentication**: Supabase Auth
- **Authorization**: [Permit.io](https://www.permit.io/)
- **Styling**: [TailwindCSS](https://tailwindcss.com/) with [Shadcn/ui](https://ui.shadcn.com/)
- **State Management**: [React Query](https://tanstack.com/query)
- **API Integration**: LeetCode Public GraphQL API

## Getting Started

### Prerequisites

- Node.js (LTS version)
- PostgreSQL database (Supabase account)
- Permit.io account

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd leetcall-app
```

2. Install dependencies:

```bash
npm install
```

3.  Set up environment variables:

    - Copy `.env.example` to `.env`:

    ```bash
    cp .env.example .env
    ```

    - Fill in the required environment variables:
      - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
      - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
      - `PERMIT_API_KEY`: Your Permit.io API key
      - `PERMIT_PDP`: Your Permit.io PDP URL

4.  Set up database and Permit IO authorization schema migration

        - First you can copy the `db-schema.sql` file and run it in your supabase
        - Second you have to follow below steps below for the Permit IO migration

        1. **Install Permit CLI**

    Check out the installation guides here [permitio/permit-cli: A command line utility from Permit.io to work with everything IAM and Authorization. A one-stop-shop to manage all your Authorization tools (OPA, OpenFGA, Cedar, OPAL, AVP...) as well as the Permit Service.](https://github.com/permitio/permit-cli) 2. **Setup Permit CLI**
    First you need to login to the permit cli by doing `permit login` and it will open up a browser to login to your application. 3. **Run Permit Policy Decision Point (PDP)**
    Since we need ReBAC policy, we need to run our own local PDP, if you want to deploy it in Heroku, consider read this article [Deploy PermitIO PDP to Heroku Under 5 Mins]().
    In this case, we can run it locally by doing `permit pdp run` and you will get the port where the pdp is running, by default the pdp runs at `http://localhost:7766` . 4. **Now lets initiate the schema**
    Make sure you already clone the LeetCall repository, you will find `permitio-migration.js` which consist of the schema initialization of LeetCall authorization. All you need to do is to run `node permitio-migration.js --permit_pdp="the default url or your deployed one" --permit_api_key="your api key"` 5. And if success you will see a couple initial check on the users permissions in the output.

5.  Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Features in Detail

### How Does LeetCall Works?

LeetCall uses a simplified spaced repetition algorithm — it's a minimal viable formula designed to launch quickly, yet effective enough to support meaningful review sessions. Here’s how we define the formula

- LeetCall scoring is range from 0-3 with
  - 0: Again(Blackout), complete blackout about the problem’s solution
  - 1: Hard, still need to peek for public solution
  - 2: Good, correct but with some difficulty
  - 3: Easy, perfect response
- Simplified Formula(SF)
  - SF(n) = round(n _ (score / 3) _ learningStep);
  - With n is repetition
  - 3 is maximum score
  - Learning Step is [1, 3, 7] in days
- If its your first time reviewing the problem — in this case we will use [Two Sum Problem](https://leetcode.com/problems/two-sum/description/). Then any score you pick you will still have to review it tomorrow.
- If its your second time reviewing the problem, then it will follow our Simplified Formula with learning step is 3 days.
- If its your third or more time reviewing the problem, then it will follow Simplified Formula with learning step 7 days.

### Workspace Sharing

Share your workspace with others using three permission levels:

- **Viewer**: Can only view problems and progress
- **Reviewer**: Can view and review problems
- **Editor**: Can add/remove problems and review them

### Problem Management

- Add problems from LeetCode's catalog
- Track review history and performance
- View upcoming and due reviews
- Rate solution quality on a 0-3 scale

## Contributing

We welcome contributions! Please feel free to submit a Pull Request.

## Acknowledgements

- [LeetCode](https://leetcode.com/) for their platform and API
- [Permit IO](https://permit.io) for the dev challenge that initiate me to start this project

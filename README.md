# AWS DVA-C02 Project Roadmap Tracker 🚀

A full-stack application designed to help you track your progress through 165 hands-on AWS projects mapped to the AWS Certified Developer Associate (DVA-C02) exam. 

This tracker replaces local browser storage with a persistent PostgreSQL database, allowing your progress to be saved securely in the cloud.

## 🛠️ Tech Stack

* **Frontend:** HTML5, CSS3, Vanilla JavaScript
* **Backend:** Node.js, Express.js
* **Database:** PostgreSQL (using `JSONB` for flexible progress storage)
* **Hosting (Recommended):** [Render](https://render.com)

## 📂 Project Structure

\`\`\`text
devops/
├── public/
│   └── index.html       # The main frontend UI and logic
├── server.js            # Node.js/Express API and database connection
├── package.json         # Project dependencies and scripts
└── .gitignore           # Ignored files (e.g., node_modules)
\`\`\`

## 💻 Running Locally

To run this project on your local machine, you will need [Node.js](https://nodejs.org/) installed.

1. **Clone the repository:**
   \`\`\`bash
   git clone https://github.com/Lifevs/devops.git
   cd devops
   \`\`\`

2. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

3. **Start the server:**
   \`\`\`bash
   npm start
   \`\`\`
   *Note: When you run `npm start`, the project will try to start a local PostgreSQL service using Homebrew before launching the server. If PostgreSQL is not installed or not available, the app still starts and falls back to local JSON storage in `data/db.json`.*

4. **View the app:**
   Open your browser and navigate to `http://localhost:3000`

## ☁️ Deploying to Render

This application is configured to deploy seamlessly on Render using a single Web Service and a managed PostgreSQL database.

1. **Create the Database:**
   * Log into Render and click **New +** -> **PostgreSQL**.
   * Give it a name and click **Create Database**.
   * Copy the **Internal Database URL** provided on the dashboard.

2. **Deploy the Web Service:**
   * Click **New +** -> **Web Service**.
   * Connect this GitHub repository.
   * Render will automatically detect it as a Node.js environment.
   * Scroll down to **Environment Variables** and add:
     * **Key:** `DATABASE_URL`
     * **Value:** *(Paste your Internal Database URL here)*
   * Click **Create Web Service**.

Render will install the dependencies, start the server, and automatically initialize the database table on the first run!

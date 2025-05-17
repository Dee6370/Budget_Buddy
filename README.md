# Budget Tracker Application

A comprehensive personal finance management application that allows users to track their income, expenses, and overall budget.

![Budget Tracker Screenshot](./frontend/src/WhatsApp%20Image%202025-05-17%20at%2015.25.17_4b749fd2.jpg)

## Features

- 👤 **User Authentication**: Register, login, and secure session management
- 📊 **Dashboard**: View financial summary with charts and recent transactions
- 💰 **Budget Management**: Set and track monthly budgets
- 💵 **Transaction Management**: Add, edit, and delete income and expense entries
- 🏷️ **Categorization**: Organize transactions into categories
- 🔍 **Filtering & Search**: Find transactions by date, type, category, or amount
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

- **Frontend**: HTML, CSS, JavaScript, Chart.js
- **Backend**: Node.js Express server serving static files
- **Database**: Browser localStorage (for simplicity)
- **Authentication**: Custom token-based authentication

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/budget-tracker.git
   cd budget-tracker
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Start the application
   ```
   node server.js
   ```

4. Open your browser and navigate to `http://localhost:5000`

## Usage

### Register/Login

- Create a new account or use the test credentials:
  - Username: testuser
  - Password: password123

### Dashboard

- View your financial summary
- Check budget usage
- See recent transactions

### Budget Management

- Set your monthly budget
- Track your spending against your budget

### Transaction Management

- Add new income or expense entries
- Categorize your transactions
- Filter and search your transaction history

## Project Structure

```
├── frontend/
│   ├── build/            # Static HTML/CSS/JS files
│   │   ├── index.html    # Main entry point
│   │   ├── login.html    # Login page
│   │   ├── register.html # Registration page
│   │   ├── dashboard.html # Dashboard page
│   │   ├── budget.html   # Budget management
│   │   └── add-transaction.html # Transaction management
│   └── src/              # Source files
├── server.js             # Express server
├── package.json          # Dependencies and scripts
└── README.md             # Project documentation
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built for the IIT Bombay Full Stack Developer coding round
- Icons from Font Awesome
- Charts powered by Chart.js

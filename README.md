# Expense Tracker

A full-stack expense tracking application built with React, Node.js, Express, and MongoDB. Track your income and expenses with beautiful visualizations and detailed analytics.

## Features

- 🔐 **User Authentication** - Secure signup/signin with JWT
- 💰 **Transaction Management** - Add, edit, and delete income/expense transactions
- 📊 **Interactive Dashboard** - View charts and graphs of your financial data
- 📅 **Flexible Time Periods** - Track by day, week, or month
- 🏷️ **Smart Categories** - Organize transactions with predefined categories
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile
- 🎨 **Modern UI** - Beautiful interface built with TailwindCSS

## Tech Stack

### Frontend
- React 18
- React Router DOM
- Recharts (for data visualization)
- Axios
- TailwindCSS
- Vite
- Lucide React (icons)
- date-fns

### Backend
- Node.js
- Express
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs
- express-validator
- CORS
- Rate limiting

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- MongoDB (running locally or connection to MongoDB Atlas)
- npm or yarn

## Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd expense
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/expense-tracker
JWT_SECRET=your_jwt_secret_key_change_in_production
NODE_ENV=development
```

**Important:** Change the `JWT_SECRET` to a secure random string in production!

### 3. Setup Frontend

```bash
cd ../frontend
npm install
```

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:5000/api
```

## Running the Application

### Start MongoDB

Make sure MongoDB is running on your system:

```bash
# If using MongoDB locally
mongod
```

### Start Backend Server

```bash
cd backend
npm run dev
```

The backend server will start on `http://localhost:5000`

### Start Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:3000`

## Usage

1. **Sign Up**: Create a new account with your name, email, and password
2. **Sign In**: Log in with your credentials
3. **Dashboard**: View your financial overview with charts and statistics
4. **Add Transactions**: Click "Add Transaction" to record income or expenses
5. **Filter by Period**: Switch between day, week, and month views
6. **Edit/Delete**: Manage your transactions with edit and delete options

## Project Structure

```
expense/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── transactionController.js
│   │   └── categoryController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── error.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Transaction.js
│   │   └── Category.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── transactionRoutes.js
│   │   └── categoryRoutes.js
│   ├── .env
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── PrivateRoute.jsx
    │   │   ├── TransactionForm.jsx
    │   │   └── TransactionList.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── About.jsx
    │   │   ├── SignIn.jsx
    │   │   ├── SignUp.jsx
    │   │   └── Dashboard.jsx
    │   ├── utils/
    │   │   └── api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── .env
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)

### Transactions
- `GET /api/transactions` - Get all transactions (protected)
- `GET /api/transactions/:id` - Get single transaction (protected)
- `POST /api/transactions` - Create transaction (protected)
- `PUT /api/transactions/:id` - Update transaction (protected)
- `DELETE /api/transactions/:id` - Delete transaction (protected)
- `GET /api/transactions/stats` - Get transaction statistics (protected)
- `GET /api/transactions/period/:period` - Get transactions by period (protected)

### Categories
- `GET /api/categories` - Get all categories (protected)

## Default Categories

### Expense Categories
- Food & Dining 🍔
- Transportation 🚗
- Shopping 🛍️
- Entertainment 🎬
- Healthcare ⚕️
- Bills & Utilities 📱
- Education 📚
- Travel ✈️
- Housing 🏠
- Personal Care 💄
- Fitness 💪
- Gifts 🎁
- Other 📌

### Income Categories
- Salary 💰
- Freelance 💼
- Business 🏢
- Investments 📈
- Rental 🏘️
- Gift 🎁
- Other 💵

## Security Features

- Password hashing with bcryptjs
- JWT token-based authentication
- Protected API routes
- Input validation with express-validator
- Rate limiting to prevent abuse
- CORS configuration
- XSS protection

## Best Practices Implemented

- **Code Organization**: Modular structure with separate concerns
- **Error Handling**: Comprehensive error handling middleware
- **Validation**: Input validation on both client and server
- **Security**: Industry-standard security practices
- **Responsive Design**: Mobile-first approach
- **Performance**: Optimized queries with MongoDB indexing
- **User Experience**: Loading states, error messages, and confirmations

## Production Deployment

### Backend Deployment (e.g., Heroku, Railway, Render)

1. Set environment variables on your hosting platform
2. Update `MONGO_URI` to your MongoDB Atlas connection string
3. Set `NODE_ENV=production`
4. Deploy the backend folder

### Frontend Deployment (e.g., Vercel, Netlify)

1. Update `VITE_API_URL` to your deployed backend URL
2. Build the project: `npm run build`
3. Deploy the `dist` folder

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check if the connection string in `.env` is correct
- Verify firewall/network settings

### CORS Issues
- Ensure the backend URL in frontend `.env` is correct
- Check CORS configuration in `server.js`

### Port Already in Use
- Change the PORT in backend `.env`
- Kill the process using the port: `lsof -ti:5000 | xargs kill -9`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the ISC License.

## Support

For support, please open an issue in the repository or contact the maintainers.

---

Built with ❤️ using modern web technologies

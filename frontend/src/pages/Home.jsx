import { Link } from 'react-router-dom';
import { TrendingUp, PieChart, BarChart3, Shield, Smartphone, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 dark:from-primary-800 dark:to-primary-950 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-300 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-slide-down">
              Take Control of Your Finances
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
              Track expenses, manage income, and visualize your financial journey with our intuitive expense tracker
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
              {user ? (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center justify-center px-8 py-3 text-lg font-semibold rounded-lg bg-white text-primary-600 hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
                >
                  View My Expenses
                </Link>
              ) : (
                <>
                  <Link
                    to="/signup"
                    className="inline-flex items-center justify-center px-8 py-3 text-lg font-semibold rounded-lg bg-white text-primary-600 hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
                  >
                    Get Started Free
                  </Link>
                  <Link
                    to="/signin"
                    className="inline-flex items-center justify-center px-8 py-3 text-lg font-semibold rounded-lg border-2 border-white text-white hover:bg-white hover:text-primary-600 transition-all duration-300 transform hover:scale-105"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need to Manage Money
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Powerful features designed to help you understand and optimize your spending habits
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card hover:shadow-lg transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Visualize Your Financial Health
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                Get instant insights into your spending patterns with beautiful, interactive charts and graphs. See where your money goes and make informed decisions.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-600 dark:bg-primary-500 text-white flex items-center justify-center text-sm font-bold mr-3 mt-1">
                      ✓
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Total Income</span>
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">$5,240</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Total Expenses</span>
                  <span className="text-2xl font-bold text-red-600 dark:text-red-400">$3,180</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Balance</span>
                  <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">$2,060</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 dark:bg-primary-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Take Control?
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Join thousands of users who are already managing their finances better
          </p>
          {!user && (
            <Link
              to="/signup"
              className="inline-flex items-center justify-center px-8 py-3 text-lg font-semibold rounded-lg bg-white text-primary-600 hover:bg-gray-100 transition"
            >
              Start Free Today
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

const features = [
  {
    icon: <PieChart className="h-6 w-6" />,
    title: 'Visual Analytics',
    description: 'Beautiful charts and graphs to visualize your spending patterns and financial trends over time.'
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: 'Smart Categories',
    description: 'Organize expenses into customizable categories to see exactly where your money goes.'
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: 'Real-time Tracking',
    description: 'Add transactions on the go and see your financial status update instantly.'
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: 'Secure & Private',
    description: 'Your financial data is encrypted and secure. We never share your information.'
  },
  {
    icon: <Smartphone className="h-6 w-6" />,
    title: 'Mobile Friendly',
    description: 'Access your expense tracker from any device - desktop, tablet, or mobile.'
  },
  {
    icon: <TrendingUp className="h-6 w-6" />,
    title: 'Monthly Reports',
    description: 'Get detailed monthly reports and insights to help you budget better.'
  }
];

const benefits = [
  'Track unlimited transactions with detailed categorization',
  'View expenses by day, week, or month for better insights',
  'Identify spending patterns and areas to save money',
  'Set financial goals and monitor your progress',
  'Export your data anytime for personal records'
];

export default Home;

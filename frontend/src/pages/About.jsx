import { TrendingUp, Target, Users, Shield, Linkedin, Instagram, Mail } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen py-12 bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            About ExpenseTracker
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            We're on a mission to help people take control of their financial lives through simple, powerful expense tracking tools.
          </p>
        </div>

        {/* Mission */}
        <div className="card mb-12">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                Financial wellness shouldn't be complicated. We believe everyone deserves access to powerful tools that make managing money simple and stress-free. ExpenseTracker was built to give you complete visibility into your finances, helping you make smarter decisions about your money.
              </p>
            </div>
          </div>
        </div>

        {/* What We Offer */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">What We Offer</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {offerings.map((offer, index) => (
              <div key={index} className="card hover-lift">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 mb-4">
                  {offer.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{offer.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{offer.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Values */}
        <div className="bg-gradient-to-br from-primary-600 to-primary-800 dark:from-primary-800 dark:to-primary-950 rounded-2xl p-8 md:p-12 text-white">
          <h2 className="text-3xl font-bold mb-8 text-center">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mx-auto mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                <p className="text-primary-100">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">{stat.value}</div>
              <div className="text-gray-600 dark:text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-16 card max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Get In Touch</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Have questions or feedback? We'd love to hear from you!
          </p>
          <div className="flex flex-col items-center gap-4">
            <a
              href="mailto:pandeymilan910@gmail.com"
              className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition"
            >
              <Mail className="h-5 w-5" />
              pandeymilan910@gmail.com
            </a>
            <div className="flex gap-4">
              <a
                href="https://www.linkedin.com/in/milan-pandey-606062179/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center hover:bg-primary-600 hover:text-white dark:hover:bg-primary-500 transition-all duration-300 transform hover:scale-110"
                title="Connect on LinkedIn"
              >
                <Linkedin className="h-6 w-6" />
              </a>
              <a
                href="https://www.instagram.com/iammilan_7/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 flex items-center justify-center hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white transition-all duration-300 transform hover:scale-110"
                title="Follow on Instagram"
              >
                <Instagram className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const offerings = [
  {
    icon: <TrendingUp className="h-6 w-6" />,
    title: 'Smart Tracking',
    description: 'Effortlessly track your income and expenses with our intuitive interface. Add transactions in seconds and watch your financial picture come into focus.'
  },
  {
    icon: <Target className="h-6 w-6" />,
    title: 'Insightful Analytics',
    description: 'Understand your spending patterns with detailed charts and reports. See trends, identify areas to save, and make data-driven financial decisions.'
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: 'User-Centric Design',
    description: 'Built with you in mind. Our clean, modern interface works seamlessly across all devices, making financial management accessible anywhere.'
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: 'Privacy First',
    description: 'Your financial data is personal. We use industry-standard encryption and never share your information with third parties.'
  }
];

const values = [
  {
    icon: <Shield className="h-8 w-8" />,
    title: 'Trust',
    description: 'Your privacy and security are our top priorities'
  },
  {
    icon: <TrendingUp className="h-8 w-8" />,
    title: 'Simplicity',
    description: 'Complex problems deserve simple, elegant solutions'
  },
  {
    icon: <Users className="h-8 w-8" />,
    title: 'Empowerment',
    description: 'We help you take control of your financial future'
  }
];

const stats = [
  { value: '10k+', label: 'Active Users' },
  { value: '500k+', label: 'Transactions Tracked' },
  { value: '99.9%', label: 'Uptime' },
  { value: '4.8/5', label: 'User Rating' }
];

export default About;

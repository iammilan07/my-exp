import { Github, Linkedin, Instagram, Mail, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About Section */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">ExpenseTracker</h3>
            <p className="text-sm text-gray-400">
              Your personal finance companion. Track expenses, manage income, and achieve your financial goals with ease.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/" className="hover:text-primary-400 transition">Home</a>
              </li>
              <li>
                <a href="/about" className="hover:text-primary-400 transition">About</a>
              </li>
              <li>
                <a href="/signin" className="hover:text-primary-400 transition">Sign In</a>
              </li>
              <li>
                <a href="/signup" className="hover:text-primary-400 transition">Sign Up</a>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Contact Us</h3>
            <div className="space-y-3">
              <a
                href="mailto:pandeymilan910@gmail.com"
                className="flex items-center gap-2 text-sm hover:text-primary-400 transition group"
              >
                <Mail className="h-4 w-4 group-hover:scale-110 transition-transform" />
                pandeymilan910@gmail.com
              </a>
              <div className="flex gap-4 mt-4">
                <a
                  href="https://www.linkedin.com/in/milan-pandey-606062179/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary-600 transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
                  title="LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
                <a
                  href="https://www.instagram.com/iammilan_7/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
                  title="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-sm text-gray-400 flex items-center justify-center gap-2">
            © {new Date().getFullYear()} ExpenseTracker. Made with
            <Heart className="h-4 w-4 text-red-500 animate-pulse" />
            by Milan Pandey. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

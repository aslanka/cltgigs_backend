import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import Mascot from '../assets/mascot.svg'; // Assuming you have mascot.svg
import { Mail, Rocket, Phone, Users, CheckCircle, Heart } from 'lucide-react';

const WaitingListPage = () => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [signupCount, setSignupCount] = useState(0); // Placeholder for signup count

  // In a real app, you'd fetch the signupCount from an API
  useEffect(() => {
    // Simulate fetching signup count (replace with API call)
    setTimeout(() => {
      setSignupCount(1257); // Example count - replace with actual data
    }, 1500); // Simulate loading time
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, send email and/or phone to your backend for waiting list
    console.log('Email:', email, 'Phone:', phone);
    alert('Thank you for signing up! You\'re on the waiting list.');
    setEmail('');
    setPhone('');
    // In a real app, you might want to update signupCount optimistically or after successful API call
  };

  const seoTitle = "Charlotte Gigs: Join the Waitlist for Your Local Gig Community!";
  const seoDescription = "Be the first to know when Charlotte Gigs launches! Connect with your Charlotte community for local gigs, services, and opportunities. Sign up for free updates.";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 text-gray-900 font-sans antialiased">
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:type" content="website" />
      </Helmet>

      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center">
            <img src={Mascot} alt="CharlotteGigs Mascot" className="h-10 w-10 mr-3" />
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-xl font-bold text-blue-600"
            >
              Charlotte Gigs
            </motion.h1>
          </div>
          <span className="text-sm text-gray-500">Beta - Waitlist</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-center mb-10"
        >
          <motion.h2
            className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-blue-700 mb-4"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            👋 Get Ready Charlotte! Your Local Gig Community is Coming Soon.
          </motion.h2>
          <motion.p
            className="mt-3 text-base text-gray-600 sm:text-lg md:text-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            Join the waitlist and be the first to access Charlotte's brand new platform connecting neighbors for local gigs, services, and opportunities. <strong className="font-semibold text-green-600">It's completely free!</strong>
          </motion.p>
        </motion.div>

        <div className="bg-white shadow-xl rounded-2xl p-8 md:p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="mb-8 text-center"
          >
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">
              Be the First to Know & Get Exclusive Early Access
            </h3>
            <p className="text-gray-500 text-sm">Limited spots available for our early community members.</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 sr-only">Email address</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="appearance-none block w-full px-10 py-3 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 sr-only">Phone number (optional)</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  className="appearance-none block w-full px-10 py-3 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Your phone number (optional)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Join the Waitlist!
              </button>
            </div>
          </form>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            className="mt-8 pt-8 border-t border-gray-200 text-center"
          >
            <p className="text-gray-500 text-sm">
              <Users className="inline-block w-5 h-5 mr-1 align-middle text-blue-500" aria-hidden="true" />
              <strong className="font-semibold text-blue-600">{signupCount} people</strong> have already signed up!
            </p>
          </motion.div>
        </div>

        {/* Value Proposition / "Secret Selling" - Community Focus */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.8 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <div>
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white mb-4">
              <CheckCircle className="h-6 w-6" />
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Support Local</h4>
            <p className="text-gray-600">Connect directly with people in your Charlotte neighborhood. Hire local talent and offer your skills within your community.</p>
          </div>
          <div>
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500 text-white mb-4">
              <Heart className="h-6 w-6" />
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Free to Use</h4>
            <p className="text-gray-600">Charlotte Gigs is and will always be free for basic use. We believe in building a strong, accessible community.</p>
          </div>
          <div>
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-yellow-500 text-white mb-4">
              <Rocket className="h-6 w-6" />
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Get Things Done</h4>
            <p className="text-gray-600">From quick errands to skilled services, find the help you need or offer your expertise to others nearby.</p>
          </div>
        </motion.div>
      </main>

      <footer className="bg-gray-100 border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500">
          <p>© {new Date().getFullYear()} Charlotte Gigs. All rights reserved.</p>
          <p className="mt-1">A community project for Charlotte, NC.</p>
        </div>
      </footer>
    </div>
  );
};

export default WaitingListPage;
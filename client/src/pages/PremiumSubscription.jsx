import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, BadgeCheck, Rocket, Star, Users, Gift, Share2, Award } from 'lucide-react';
import Mascot from '../assets/mascot.svg';
import { Helmet } from 'react-helmet';

const PremiumSubscription = () => {
  const premiumFeatures = [
    {
      icon: <Zap className="w-8 h-8 text-purple-600" />,
      title: "Ad-Free Experience",
      description: "Browse gigs without any advertisements"
    },
    {
      icon: <Rocket className="w-8 h-8 text-blue-600" />,
      title: "Featured Listings",
      description: "Priority placement in search results"
    },
    {
      icon: <Star className="w-8 h-8 text-amber-500" />,
      title: "Advanced Analytics",
      description: "Track your gig performance & views"
    },
    {
      icon: <Users className="w-8 h-8 text-green-600" />,
      title: "Profile Customization",
      description: "Custom colors, badges, and profile themes"
    }
  ];

  const referralSteps = [
    {
      step: 1,
      icon: <Share2 className="w-6 h-6" />,
      title: "Share Your Link",
      description: "Send your unique referral link to friends"
    },
    {
      step: 2,
      icon: <BadgeCheck className="w-6 h-6" />,
      title: "They Sign Up",
      description: "They get 500 XP when they join using your link"
    },
    {
      step: 3,
      icon: <Award className="w-6 h-6" />,
      title: "Earn Rewards",
      description: "Get 1000 XP when they post their first gig"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Helmet>
        <title>Premium & Referrals - CharlotteGigs</title>
      </Helmet>

      <header className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-6 mb-8 md:mb-0">
              <img 
                src={Mascot} 
                alt="Mascot" 
                className="h-24 w-24 animate-bounce"
                loading="lazy"
              />
              <div>
                <h1 className="text-4xl font-bold mb-2">CharlotteGigs Premium</h1>
                <p className="text-xl opacity-90">Unlock Powerful Features & Earn Rewards</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-2"
            >
              <Rocket className="w-6 h-6" />
              Upgrade Now - $15/mo
            </motion.button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Premium Features Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <Star className="w-8 h-8 text-amber-500" />
            Premium Benefits
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {premiumFeatures.map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Referral Program Section */}
        <section className="bg-purple-50 rounded-2xl p-8 mb-16">
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <Gift className="w-8 h-8 text-purple-600" />
            Referral Program
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {referralSteps.map((step) => (
              <motion.div
                key={step.step}
                whileHover={{ scale: 1.02 }}
                className="bg-white p-6 rounded-2xl shadow-lg"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    {step.icon}
                  </div>
                  <div className="text-2xl font-bold text-gray-500">0{step.step}</div>
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-xl font-bold mb-4">🎉 Referral Rewards Tier</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <BadgeCheck className="w-5 h-5 text-blue-600" />
                  <span className="font-bold">10 Referrals</span>
                </div>
                <p className="text-sm">Custom Profile Badge</p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Rocket className="w-5 h-5 text-purple-600" />
                  <span className="font-bold">25 Referrals</span>
                </div>
                <p className="text-sm">1 Week Featured Gig</p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-amber-500" />
                  <span className="font-bold">50+ Referrals</span>
                </div>
                <p className="text-sm">1 Month Free Premium</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-8 shadow-xl">
          <h2 className="text-3xl font-bold mb-4">Start Earning Today</h2>
          <p className="text-xl mb-8">Share your link and unlock rewards!</p>
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold flex items-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              Copy Referral Link
            </motion.button>
            <Link
              to="/leaderboard"
              className="bg-white/20 px-8 py-3 rounded-lg font-bold hover:bg-white/30 transition flex items-center gap-2"
            >
              <Award className="w-5 h-5" />
              View Leaderboard
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PremiumSubscription;
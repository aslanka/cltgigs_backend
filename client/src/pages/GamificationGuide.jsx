import { motion } from 'framer-motion';
import { Zap, Trophy, BadgeCheck, Shield, Clock, Star, Users, Rocket } from 'lucide-react';
import Mascot from '../assets/mascot.svg';

const GamificationGuide = () => {
  const features = [
    {
      icon: <Zap className="w-12 h-12 text-yellow-500" />,
      title: "XP System",
      content: [
        "Earn XP through platform participation:",
        "• +100 XP for completing a gig",
        "• +50 XP for having your bid accepted",
        "• +25 XP daily for logging in",
        "• +30 XP for leaving a review",
        "• +200 XP bonus for 5 completed gigs/week"
      ]
    },
    {
      icon: <Trophy className="w-12 h-12 text-amber-500" />,
      title: "Leaderboards",
      content: [
        "Compete in three categories:",
        "🏆 Weekly Champions (resets every Monday)",
        "🏅 Monthly Elite (resets first of month)",
        "🎖️ All-Time Legends (permanent record)",
        "Top 3 each week get exclusive badges"
      ]
    },
    {
      icon: <Star className="w-12 h-12 text-emerald-500" />,
      title: "CharlotteCoins",
      content: [
        "Earn coins redeemable for rewards:",
        "• 1 coin = 10 XP earned",
        "• Bonus coins for streaks:",
        "   - 3-day streak: +50 coins",
        "   - 7-day streak: +150 coins",
        "Redeem coins for profile boosts and perks"
      ]
    },
    {
      icon: <BadgeCheck className="w-12 h-12 text-purple-500" />,
      title: "Badges & Achievements",
      content: [
        "Collect achievements like:",
        "🚀 Gig Novice (Complete 5 gigs)",
        "💼 Hiring Pro (Post 10 gigs)",
        "⭐ Community Star (Get 10 5-star reviews)",
        "🏅 Top Performer (Reach #1 on any leaderboard)",
        "Badges display on your profile"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-6 mb-8 md:mb-0">
              <img src={Mascot} alt="Mascot" className="h-24 w-24 animate-bounce" />
              <div>
                <h1 className="text-4xl font-bold mb-2">CharlotteGigs Game Guide</h1>
                <p className="text-xl opacity-90">Earn Rewards • Climb Ranks • Build Your Reputation</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="bg-gray-100 p-3 rounded-xl">{feature.icon}</div>
                <div>
                  <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                  <ul className="space-y-2">
                    {feature.content.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span>•</span>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            Progression Strategy
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                Daily Engagement
              </h3>
              <p className="text-gray-600">
                Earn bonus XP for consistent daily activity. The longer your streak, the bigger the rewards!
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Users className="w-5 h-5 text-green-600" />
                Community Factor
              </h3>
              <p className="text-gray-600">
                Get XP boosts from user reviews and successful collaborations. Better ratings = faster progression!
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Rocket className="w-5 h-5 text-purple-600" />
                Seasonal Challenges
              </h3>
              <p className="text-gray-600">
                Participate in limited-time events for exclusive badges and bonus CharlotteCoins!
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 bg-blue-50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-6">FAQ</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-bold">Q: Do my coins expire?</h3>
              <p className="text-gray-600">A: Coins never expire! Use them whenever you're ready.</p>
            </div>
            <div>
              <h3 className="font-bold">Q: Can I lose XP?</h3>
              <p className="text-gray-600">A: XP can't be lost, but inactive users may drop on leaderboards.</p>
            </div>
            <div>
              <h3 className="font-bold">Q: How are leaderboard positions determined?</h3>
              <p className="text-gray-600">A: Positions are calculated using your total XP + bonus multipliers from badges.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GamificationGuide;
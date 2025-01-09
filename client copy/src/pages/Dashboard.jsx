import React from 'react';

function Dashboard() {
  return (
    <div>
      {/* Navbar */}
      <nav className="bg-blue-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Charlotte Gigs</h1>
          <div className="flex items-center space-x-4">
            {/* Notifications, user pic, etc. */}
            <span>John Doe</span>
          </div>
        </div>
      </nav>

      <div className="container mx-auto p-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-3">
            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              <div className="flex items-center space-x-3 mb-6">
                <img src="/api/placeholder/64/64" className="w-16 h-16 rounded-full" alt="Profile" />
                <div>
                  <h3 className="font-bold">John Doe</h3>
                  <p className="text-gray-500">Customer</p>
                </div>
              </div>
              <nav className="space-y-2">
                <a href="#" className="block p-3 bg-blue-50 text-blue-600 rounded">Dashboard</a>
                <a href="#" className="block p-3 text-gray-700 hover:bg-gray-50 rounded">My Gigs</a>
                <a href="#" className="block p-3 text-gray-700 hover:bg-gray-50 rounded">Messages</a>
                <a href="#" className="block p-3 text-gray-700 hover:bg-gray-50 rounded">Settings</a>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-9 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-500">Active Gigs</h3>
                <p className="text-3xl font-bold">4</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-500">Total Proposals</h3>
                <p className="text-3xl font-bold">12</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-500">Completed Gigs</h3>
                <p className="text-3xl font-bold">8</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-500">Total Spent</h3>
                <p className="text-3xl font-bold">$2,450</p>
              </div>
            </div>

            {/* Active Gigs */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold">Active Gigs</h2>
              </div>
              <div className="p-6">
                {/* Example active gigs */}
              </div>
            </div>

            {/* Recent Proposals */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold">Recent Proposals</h2>
              </div>
              <div className="p-6">
                {/* Example proposals */}
              </div>
            </div>

            {/* Messages Preview */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold">Recent Messages</h2>
                <a href="#" className="text-blue-600 hover:underline">View All</a>
              </div>
              <div className="p-6">
                {/* Example messages */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

import React, { useState } from 'react';
import { Plus, ArrowRight, FileText, Zap } from 'lucide-react';

const Dashboard = () => {
  // MOCK DATA - Replace this with axios.get() from your Flask backend later
  const [groups] = useState([
    { id: 1, name: 'Data Structures', members: 12, subject: 'CS', nextSession: 'Tomorrow 10 AM' },
    { id: 2, name: 'OS Kernels', members: 8, subject: 'CS', nextSession: 'Fri 2 PM' },
    { id: 3, name: 'Linear Algebra', members: 24, subject: 'Math', nextSession: 'Mon 9 AM' },
  ]);

  return (
    <div className="p-8 bg-gray-50 min-h-screen ml-64">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Welcome back! 👋</h2>
          <p className="text-gray-500">Ready to collaborate today?</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
          <Plus size={18} /> Create New Group
        </button>
      </div>

      {/* AI Stats Cards */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6 rounded-xl text-white shadow-lg">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">AI Flashcards Generated</h3>
            <Zap />
          </div>
          <p className="text-3xl font-bold mt-2">124</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 font-medium">Upcoming Sessions</h3>
          <p className="text-3xl font-bold mt-2 text-gray-800">3</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 font-medium">Active Groups</h3>
          <p className="text-3xl font-bold mt-2 text-gray-800">5</p>
        </div>
      </div>

      {/* Groups Grid */}
      <h3 className="text-xl font-bold text-gray-800 mb-4">Your Study Groups</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <div key={group.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded">{group.subject}</span>
              <span className="text-xs text-gray-400">{group.members} Members</span>
            </div>
            <h4 className="text-lg font-bold mb-2">{group.name}</h4>
            <p className="text-sm text-gray-500 mb-4 flex items-center gap-2">
              <FileText size={14} /> Next: {group.nextSession}
            </p>
            <button className="w-full border border-blue-600 text-blue-600 py-2 rounded-lg hover:bg-blue-50 flex justify-center items-center gap-2">
              Enter Room <ArrowRight size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
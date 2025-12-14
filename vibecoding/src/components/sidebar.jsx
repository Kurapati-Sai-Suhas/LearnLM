import React from 'react';
import { BookOpen, Users, BrainCircuit, Calendar, Settings } from 'lucide-react';

const Sidebar = ({ activePage, setActivePage }) => {
  const menuItems = [
    { name: 'Dashboard', icon: <BookOpen size={20} /> },
    { name: 'My Groups', icon: <Users size={20} /> },
    { name: 'AI Assistant', icon: <BrainCircuit size={20} /> },
    { name: 'Schedule', icon: <Calendar size={20} /> },
  ];

  return (
    <div className="w-64 h-screen bg-gray-900 text-white flex flex-col p-4 fixed">
      <h1 className="text-2xl font-bold mb-8 text-blue-400">StudyHive AI</h1>
      <nav className="flex-1">
        {menuItems.map((item) => (
          <button
            key={item.name}
            onClick={() => setActivePage(item.name)}
            className={`flex items-center gap-3 w-full p-3 rounded-lg mb-2 transition-all ${
              activePage === item.name ? 'bg-blue-600' : 'hover:bg-gray-800'
            }`}
          >
            {item.icon}
            <span>{item.name}</span>
          </button>
        ))}
      </nav>
      <div className="p-3 border-t border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">S</div>
          <div>
            <p className="text-sm font-medium">Student User</p>
            <p className="text-xs text-gray-400">student@univ.edu</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
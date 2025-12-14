import React, { useState } from 'react';
import Sidebar from 'vibecoding/src/components/sidebar.jsx';
import Dashboard from 'vibecoding/src/pages/dashboard.jsx';

function App() {
  const [activePage, setActivePage] = useState('Dashboard');

  return (
    <div className="flex">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <main className="flex-1">
        {activePage === 'Dashboard' && <Dashboard />}
        {activePage === 'AI Assistant' && (
          <div className="ml-64 p-8">
            <h2 className="text-2xl font-bold">AI Doubt Solver (Coming Day 3)</h2>
            <p>Connect your LLM API here.</p>
          </div>
        )}
        {/* Add other pages here */}
      </main>
    </div>
  );
}

export default App;
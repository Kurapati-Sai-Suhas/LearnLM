import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 1. Define the exact shape of your Django JSON response
interface Portal {
  id: number | string;
  name: string;
  description: string;
  is_active: boolean;
}

const CodingHub: React.FC = () => {
  // 2. Tell useState that it will hold an array of 'Portal' objects
  const [portals, setPortals] = useState<Portal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPortals = async () => {
      try {
        // 👇 THE FIX: Checking for both token names!
        const token = localStorage.getItem('authToken') || localStorage.getItem('access'); 
        
        const response = await fetch('http://127.0.0.1:8000/api/coding-portals/', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data: Portal[] = await response.json();
          setPortals(data);
        } else {
          console.error("Failed to fetch portals. Status:", response.status);
        }
      } catch (error) {
        console.error("Network error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPortals();
  }, []);

  return (
    <div className="min-h-screen bg-[#0d1117] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-400 mb-2">Global Coding Hub</h1>
        <p className="text-gray-400 mb-10">Select a masterclass to begin your adaptive learning journey.</p>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portals.map((portal) => (
              <div 
                key={portal.id} 
                className="bg-[#161b22] border border-gray-800 rounded-xl p-6 hover:border-blue-500 transition-all cursor-pointer group"
                onClick={() => navigate(`/coding-portal?portal_id=${portal.id}`)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  {portal.is_active && (
                    <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded-full border border-green-500/20">
                      Active
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-semibold mb-2">{portal.name}</h2>
                <p className="text-gray-400 text-sm line-clamp-3">
                  {portal.description || "Adaptive hierarchical problem set optimized by the PyTorch GNN engine."}
                </p>
              </div>
            ))}

            {portals.length === 0 && (
              <div className="col-span-full p-8 border border-dashed border-gray-700 rounded-xl text-center text-gray-500">
                No active portals found. Add some from the Django Admin!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CodingHub;
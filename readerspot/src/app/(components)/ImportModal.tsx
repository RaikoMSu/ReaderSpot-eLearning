import { useState } from 'react';

export default function ImportModal({ closeModal }) {
  const [selectedTab, setSelectedTab] = useState('Add Books');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-gray-800 p-8 rounded-lg w-2/3 max-w-3xl">
        <button onClick={closeModal} className="text-gray-400 hover:text-white float-right">X</button>
        
        <div className="mt-6">
          <div className="flex space-x-4 mb-4">
            <button 
              onClick={() => setSelectedTab('Add Books')}
              className={`px-4 py-2 rounded-lg ${selectedTab === 'Add Books' ? 'bg-yellow-500' : 'bg-gray-600'}`}
            >
              Add Books
            </button>
            <button 
              onClick={() => setSelectedTab('My Imports')}
              className={`px-4 py-2 rounded-lg ${selectedTab === 'My Imports' ? 'bg-yellow-500' : 'bg-gray-600'}`}
            >
              My Imports
            </button>
          </div>

          {/* Content based on selected tab */}
          {selectedTab === 'Add Books' && (
            <div>
              {/* Content for Add Books */}
              <input type="text" placeholder="Search books, series, authors, genres" className="w-full p-2 mb-4 rounded-lg" />
              <div className="flex justify-between">
                <div className="text-sm text-green-400">Free</div>
                <div className="text-sm text-red-400">Paid</div>
                <div className="text-sm text-yellow-400">Pending</div>
              </div>
              {/* Add books list here */}
            </div>
          )}

          {selectedTab === 'My Imports' && (
            <div>
              {/* Content for My Imports */}
              <ul className="space-y-4">
                <li className="flex justify-between items-center bg-gray-700 p-4 rounded-lg">
                  <span>Harry Potter and the Goblet of Fire</span>
                  <button className="text-yellow-400">Read</button>
                </li>
                {/* Add more imported books similarly */}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import AssetUploader from './components/AssetUploader';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-gray-100 flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-sm shadow-sm border-b border-gray-200">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 flex items-center">
          <img 
            src="https://images.media-outreach.com/Thumb/318x213/235286/Neuron+logo.jpg" 
            alt="Neuron Logo" 
            className="h-12 w-auto mr-3" 
          />
          <h1 className="text-2xl font-bold text-gray-900">Building Asset Information Viewer [Prototype] </h1>
        </div>
      </header>
      
      <main className="flex-grow w-full px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        <div className="bg-white/60 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Upload Asset Information</h2>
          <p className="text-gray-600 mb-6">Upload your asset information Excel file to view and organize the building assets.</p>
          <AssetUploader />
        </div>
      </main>
      
      <footer className="bg-white/70 backdrop-blur-sm border-t border-gray-200 mt-auto">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-sm text-gray-500 text-center">&copy; {new Date().getFullYear()} Neuron Building Asset Management. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
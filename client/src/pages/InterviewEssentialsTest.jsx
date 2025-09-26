import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaBrain, FaArrowLeft } from 'react-icons/fa';

const InterviewEssentialsTest = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <button
            onClick={() => navigate('/resources')}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors mb-6"
          >
            <FaArrowLeft className="text-sm" />
            Back to Resources
          </button>
          
          <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaBrain className="text-white text-3xl" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Interview Essentials Test
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Test page to check if the component loads correctly
          </p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <p className="text-xl text-center text-gray-800">
            ✅ Component is loading successfully!
          </p>
        </div>
      </div>
    </div>
  );
};

export default InterviewEssentialsTest;
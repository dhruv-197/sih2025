import React from 'react';

interface LandingPageProps {
  onEnter: () => void;
}

const EnterIcon = () => (
    <svg className="w-6 h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
);

export const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  return (
    // Removed the dark gradient overlay to make the new body background fully visible.
    <div className="h-screen w-screen flex flex-col items-center justify-center text-center p-4">
        <div className="bg-gray-900/80 dark:bg-gray-900/90 backdrop-blur-lg p-12 rounded-2xl border border-gray-700/50 dark:border-gray-600/50 shadow-2xl">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-4 tracking-tight text-white">
                MineSafe India
            </h1>
            <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto mb-8">
                Leveraging predictive AI to create a safer future for mining operations. Real-time monitoring and rockfall prediction at your fingertips.
            </p>
            <button 
                onClick={onEnter} 
                className="flex items-center justify-center mx-auto px-8 py-4 bg-gradient-to-r from-accent to-secondary-accent text-white font-bold rounded-lg text-lg hover:from-accent-hover hover:to-accent transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
                Enter National Oversight Map
                <EnterIcon />
            </button>
        </div>
    </div>
  );
};
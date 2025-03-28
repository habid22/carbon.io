import ProductCalculator from '@/components/ProductCalculator';
import { StarsBackground } from '@/components/star-background';
import Link from 'next/link';

export default function CalculatorPage() {
  return (
    <div className="min-h-screen bg-black relative">
      <StarsBackground />
      <div className="container mx-auto px-4 py-12">
        {/* Back Button positioned absolutely */}
        <div className="absolute top-4 left-4 z-10">
          <Link 
            href="/" 
            className="group bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 hover:from-emerald-500/30 hover:to-cyan-500/30 px-4 py-2 rounded-xl backdrop-blur-sm border border-emerald-400/30 hover:border-emerald-400/50 transition-all duration-300 flex items-center space-x-2"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 text-emerald-400 group-hover:text-cyan-300 transition-colors" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M10 19l-7-7m0 0l7-7m-7 7h18" 
              />
            </svg>
            <span className="text-sm font-medium bg-gradient-to-r from-emerald-400 to-cyan-300 bg-clip-text text-transparent">
              Back to Home
            </span>
          </Link>
        </div>
        
        <ProductCalculator />
      </div>
    </div>
  );
}
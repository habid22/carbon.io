import ProductCalculator from '@/components/ProductCalculator';
import { StarsBackground } from '@/components/star-background';
import Link from 'next/link';

export default function CalculatorPage() {
  return (
    <div className="min-h-screen">
      <StarsBackground />
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="text-emerald-500 hover:text-emerald-600 transition-colors">
            ← Back to Globe
          </Link>
        </div>
        <ProductCalculator />
      </div>
    </div>
  );
}
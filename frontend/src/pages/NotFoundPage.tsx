import { Link } from 'wouter';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-royal-900 via-royal-800 to-royal-900 flex items-center justify-center px-4">
      <div className="text-center">
        {/* 404 Animation */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-600 mb-4">
            404
          </h1>
          <div className="text-6xl mb-4">🎴</div>
        </div>

        {/* Message */}
        <h2 className="text-3xl font-bold text-white mb-4">
          Page Not Found
        </h2>
        <p className="text-royal-300 text-lg mb-8 max-w-md mx-auto">
          Oops! The page you're looking for seems to have wandered off. 
          Let's get you back to the game!
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-royal-900 font-semibold"
            >
              <Home className="mr-2 h-5 w-5" />
              Go Home
            </Button>
          </Link>
          
          <Button 
            size="lg" 
            variant="outline" 
            className="border-gold-500 text-gold-400 hover:bg-gold-500/10"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Go Back
          </Button>
        </div>

        {/* Additional Links */}
        <div className="mt-12 space-y-3">
          <p className="text-royal-400 text-sm">Looking for something specific?</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/games">
              <Button variant="link" className="text-gold-400 hover:text-gold-300">
                Browse Games
              </Button>
            </Link>
            <Link href="/help">
              <Button variant="link" className="text-gold-400 hover:text-gold-300">
                Help Center
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="link" className="text-gold-400 hover:text-gold-300">
                Contact Support
              </Button>
            </Link>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-16 text-royal-500 text-sm">
          <p>Error Code: 404 | Page Not Found</p>
        </div>
      </div>
    </div>
  );
}
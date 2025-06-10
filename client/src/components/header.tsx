import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";

export default function Header() {
  const { isAuthenticated, user } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/">
                <h1 className="text-2xl font-bold text-blue-600 cursor-pointer">Terrin</h1>
              </Link>
            </div>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link href="#how-it-works">
                <span className="text-slate-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors">
                  How it Works
                </span>
              </Link>
              <Link href="#contractors">
                <span className="text-slate-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors">
                  Find Contractors
                </span>
              </Link>
              <Link href="#professionals">
                <span className="text-slate-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors">
                  For Professionals
                </span>
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-slate-600">
                  Welcome, {user?.firstName || 'User'}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = '/api/logout'}
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = '/api/login'}
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  Sign In
                </Button>
                <Button
                  size="sm"
                  onClick={() => window.location.href = '/api/login'}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

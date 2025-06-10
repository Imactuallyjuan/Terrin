import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold text-orange-400 mb-4">Terrin</h3>
            <p className="text-gray-300 max-w-md">
              Connecting homeowners with trusted construction professionals. Get accurate estimates and find the right contractor for your project.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">For Homeowners</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link href="#post-project">
                  <span className="hover:text-orange-400 transition-colors cursor-pointer">Post a Project</span>
                </Link>
              </li>
              <li>
                <Link href="#cost-estimator">
                  <span className="hover:text-orange-400 transition-colors cursor-pointer">Get Estimates</span>
                </Link>
              </li>
              <li>
                <Link href="#match-trades">
                  <span className="hover:text-orange-400 transition-colors cursor-pointer">Find Contractors</span>
                </Link>
              </li>
              <li>
                <Link href="/gallery">
                  <span className="hover:text-orange-400 transition-colors cursor-pointer">Project Gallery</span>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">For Professionals</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link href="/join">
                  <span className="hover:text-orange-400 transition-colors cursor-pointer">Join Terrin</span>
                </Link>
              </li>
              <li>
                <Link href="/jobs">
                  <span className="hover:text-orange-400 transition-colors cursor-pointer">Find Jobs</span>
                </Link>
              </li>
              <li>
                <Link href="/profile">
                  <span className="hover:text-orange-400 transition-colors cursor-pointer">Build Profile</span>
                </Link>
              </li>
              <li>
                <Link href="/success-stories">
                  <span className="hover:text-orange-400 transition-colors cursor-pointer">Success Stories</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; 2024 Terrin. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

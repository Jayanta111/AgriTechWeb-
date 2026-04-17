import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { SignUp } from '@clerk/clerk-react';
import { 
  ArrowLeft, 
  Leaf, 
  Sprout, 
  Sun,
  Droplets,
  Tractor,
  Users,
  TrendingUp
} from 'lucide-react';

const SignUpPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/market';
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-200 rounded-full opacity-20"></div>
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-emerald-200 rounded-full opacity-20"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-yellow-200 rounded-full opacity-10"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Back Button */}
        <Link 
          to="/"
          className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        {/* Auth Container */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-green-500 p-3 rounded-full">
                <Sprout className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Join AgriTech
            </h1>
            <p className="text-gray-600">
              Create your account to start farming smarter
            </p>
          </div>

          {/* Benefits */}
          <div className="bg-green-50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-green-800 mb-3 text-sm">Why Join AgriTech?</h3>
            <div className="space-y-2">
              <div className="flex items-center text-xs text-green-700">
                <TrendingUp className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>Access live market prices and trends</span>
              </div>
              <div className="flex items-center text-xs text-green-700">
                <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>Connect with farmers and buyers</span>
              </div>
              <div className="flex items-center text-xs text-green-700">
                <Droplets className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>Get weather insights and forecasts</span>
              </div>
              <div className="flex items-center text-xs text-green-700">
                <Tractor className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>List and sell your products easily</span>
              </div>
            </div>
          </div>

          {/* Clerk SignUp Component */}
          <div className="mb-6">
            <SignUp 
              path="/sign-up"
              routing="path"
              afterSignUpUrl={redirectTo}
              redirectUrl={redirectTo}
              forceRedirectUrl={redirectTo}
            />
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-600">
            <p>
              Already have an account?{' '}
              <Link 
                to="/sign-in" 
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center">
              <Sun className="w-3 h-3 mr-1" />
              Secure
            </div>
            <div className="flex items-center">
              <Leaf className="w-3 h-3 mr-1" />
              Trusted
            </div>
            <div className="flex items-center">
              <Sprout className="w-3 h-3 mr-1" />
              Growing
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;

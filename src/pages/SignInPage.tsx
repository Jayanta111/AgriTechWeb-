import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { SignIn } from '@clerk/clerk-react';
import { 
  ArrowLeft, 
  Leaf, 
  Sprout, 
  Sun,
  Droplets,
  Tractor
} from 'lucide-react';

const SignInPage: React.FC = () => {
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
                <Leaf className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600">
              Sign in to access the AgriTech Marketplace
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="text-center">
              <div className="bg-blue-50 p-2 rounded-lg mb-2">
                <Droplets className="w-5 h-5 text-blue-600 mx-auto" />
              </div>
              <p className="text-xs text-gray-600">Weather</p>
            </div>
            <div className="text-center">
              <div className="bg-green-50 p-2 rounded-lg mb-2">
                <Sprout className="w-5 h-5 text-green-600 mx-auto" />
              </div>
              <p className="text-xs text-gray-600">Crops</p>
            </div>
            <div className="text-center">
              <div className="bg-yellow-50 p-2 rounded-lg mb-2">
                <Tractor className="w-5 h-5 text-yellow-600 mx-auto" />
              </div>
              <p className="text-xs text-gray-600">Market</p>
            </div>
          </div>

          {/* Clerk SignIn Component */}
          <div className="mb-6">
            <SignIn 
              path="/sign-in"
              routing="path"
              signInUrl="/sign-in"
              afterSignInUrl={redirectTo}
              redirectUrl={redirectTo}
              forceRedirectUrl={redirectTo}
            />
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-600">
            <p>
              Don't have an account?{' '}
              <Link 
                to="/sign-up" 
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Sign up
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

export default SignInPage;

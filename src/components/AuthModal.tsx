import React from 'react';
import { 
  SignIn, 
  SignUp, 
  useUser,
  ClerkProvider,
  SignInButton,
  SignUpButton
} from '@clerk/clerk-react';
import { X, LogIn, UserPlus } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'signin' | 'signup';
  onModeChange: (mode: 'signin' | 'signup') => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  mode, 
  onModeChange 
}) => {
  const { isSignedIn } = useUser();

  if (!isOpen) return null;

  const handleSuccess = () => {
    // User successfully signed in/up
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {mode === 'signin' ? 'Sign In' : 'Sign Up'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          {mode === 'signin' ? (
            <div>
              <SignIn 
                path="/sign-in"
                routing="path"
                afterSignInUrl="/"
                redirectUrl="/"
                forceRedirectUrl="/"
              />
            </div>
          ) : (
            <div>
              <SignUp 
                path="/sign-up"
                routing="path"
                afterSignUpUrl="/"
                redirectUrl="/"
                forceRedirectUrl="/"
              />
            </div>
          )}

          {/* Mode Switch */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {mode === 'signin' ? "Don't have an account?" : "Already have an account?"}
            </p>
            <button
              onClick={() => onModeChange(mode === 'signin' ? 'signup' : 'signin')}
              className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center space-x-1 mx-auto"
            >
              {mode === 'signin' ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Sign Up</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;

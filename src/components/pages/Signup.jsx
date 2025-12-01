import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/layouts/Root';
import { useSelector } from 'react-redux';

function Signup() {
  const { isInitialized } = useAuth();
  const { user } = useSelector(state => state.user);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isInitialized) {
      const { ApperUI } = window.ApperSDK;
      if(!user) {
        ApperUI.showSignup("#authentication");
      }else{
        const searchParams = new URLSearchParams(window.location.search);
        const redirectPath = searchParams.get('redirect');
        navigate(redirectPath ? redirectPath : "/");
      }
    }
  }, [isInitialized, user, navigate]);
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md space-y-8 p-8 bg-white rounded-2xl shadow-xl border border-blue-100">
        <div className="flex flex-col gap-6 items-center justify-center">
          <div className="w-16 h-16 shrink-0 rounded-xl flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-2xl font-bold shadow-lg">
            F
          </div>
          <div className="flex flex-col gap-1 items-center justify-center">
            <div className="text-center text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Create FlowTrack Account
            </div>
            <div className="text-center text-sm text-slate-500">
              Please create an account to continue
            </div>
          </div>
        </div>
        <div id="authentication" />
        <div className="text-center mt-6">
          <p className="text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setToken, fetchMe } from '../redux/slices/authSlice';

// This page handles the redirect from Google OAuth
// URL: /oauth/callback?token=xxx
const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error || !token) {
      navigate('/login?error=oauth_failed');
      return;
    }

    // Store token in Redux + fetch user profile
    dispatch(setToken(token));
    dispatch(fetchMe()).then(() => {
      navigate('/');
    });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-luxury-black">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-luxury-subtext text-sm tracking-widest uppercase">Signing you in...</p>
      </div>
    </div>
  );
};

export default OAuthCallback;

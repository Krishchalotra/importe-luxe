import { useSelector, useDispatch } from 'react-redux';
import { login, logout, register } from '../redux/slices/authSlice';

const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated, loading, error } = useSelector((state) => state.auth);

  return {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    isAdmin: user?.role === 'admin',
    login: (data) => dispatch(login(data)),
    logout: () => dispatch(logout()),
    register: (data) => dispatch(register(data)),
  };
};

export default useAuth;

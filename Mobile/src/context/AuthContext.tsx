// src/context/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole = 'Admin' | 'Owner' | 'Customer';

interface AuthState {
  userToken: string | null;
  userRole: UserRole | null;
  isLoading: boolean;        // true khi đang restore session từ AsyncStorage
}

interface AuthContextValue extends AuthState {
  signIn: (token: string, role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
}

// ─── Keys ─────────────────────────────────────────────────────────────────────

const STORAGE_TOKEN_KEY = '@auth_token';
const STORAGE_ROLE_KEY  = '@auth_role';

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    userToken: null,
    userRole:  null,
    isLoading: true,   // bắt đầu ở trạng thái đang load
  });

  // Restore token & role từ AsyncStorage khi khởi động ứng dụng
  useEffect(() => {
    async function restoreSession() {
      try {
        const [token, role] = await AsyncStorage.multiGet([
          STORAGE_TOKEN_KEY,
          STORAGE_ROLE_KEY,
        ]);

        const restoredToken = token[1]  ?? null;
        const restoredRole  = role[1]   ?? null;

        setState({
          userToken: restoredToken,
          userRole:  restoredRole as UserRole | null,
          isLoading: false,
        });
      } catch (error) {
        // Nếu lỗi đọc storage → coi như chưa đăng nhập
        console.warn('[AuthContext] Failed to restore session:', error);
        setState({ userToken: null, userRole: null, isLoading: false });
      }
    }

    restoreSession();
  }, []);

  // Đăng nhập: lưu token + role vào state và AsyncStorage
  const signIn = useCallback(async (token: string, role: UserRole) => {
    try {
      await AsyncStorage.multiSet([
        [STORAGE_TOKEN_KEY, token],
        [STORAGE_ROLE_KEY,  role],
      ]);
    } catch (error) {
      console.warn('[AuthContext] Failed to persist session:', error);
    }

    setState({ userToken: token, userRole: role, isLoading: false });
  }, []);

  // Đăng xuất: xóa token + role khỏi state và AsyncStorage
  const signOut = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove([STORAGE_TOKEN_KEY, STORAGE_ROLE_KEY]);
    } catch (error) {
      console.warn('[AuthContext] Failed to clear session:', error);
    }

    setState({ userToken: null, userRole: null, isLoading: false });
  }, []);

  const value: AuthContextValue = {
    ...state,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return ctx;
}

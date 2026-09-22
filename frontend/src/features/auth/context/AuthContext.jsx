import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  ambilToken,
  ambilUser,
  hapusSesi,
  mintaToken,
  simpanSesi,
  tokenMasihBerlaku,
} from '../../../config/sesi';

const AuthContext = createContext(null);

const USER_KOSONG = { id: '', username: '', nama: '', name: '', roles: [] };

function normalkan(user) {
  if (!user) return USER_KOSONG;
  return {
    id: user.id || '',
    userId: user.id || '',
    username: user.username || '',
    nama: user.nama || user.username || '',
    // Sebagian komponen lama membaca `user.name`.
    name: user.nama || user.username || '',
    roles: Array.isArray(user.roles) ? user.roles : [],
  };
}

export const AuthProvider = ({ children }) => {
  const [isAuth, setIsAuth] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(USER_KOSONG);

  useEffect(() => {
    const tersimpan = ambilToken();
    if (tokenMasihBerlaku(tersimpan)) {
      setToken(tersimpan);
      setUser(normalkan(ambilUser()));
      setIsAuth(true);
    } else if (tersimpan) {
      hapusSesi();
    }
    setIsReady(true);
  }, []);

  const masuk = useCallback(async (username, password) => {
    const data = await mintaToken(username, password);
    simpanSesi(data.token, data.user);
    setToken(data.token);
    setUser(normalkan(data.user));
    setIsAuth(true);
    return normalkan(data.user);
  }, []);

  const logout = useCallback(() => {
    hapusSesi();
    setToken(null);
    setUser(USER_KOSONG);
    setIsAuth(false);
    window.location.assign('/');
  }, []);

  // Dipertahankan agar tombol "Masuk" di halaman lama tetap berfungsi.
  const login = useCallback(() => {
    window.location.assign('/masuk');
  }, []);

  if (!isReady) return <div>Memuat Sistem...</div>;

  return (
    <AuthContext.Provider
      value={{ isAuth, masuk, login, logout, token, user, roles: user.roles }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

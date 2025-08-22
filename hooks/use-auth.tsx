'use client';

import type React from 'react';

import { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase-client';
import {
  findEmpleadoByUserId,
  findEmpleadosByEmail,
  createEmpleadoForUser,
  associateUserWithEmpleado,
  findPotentialRestaurantsForEmail,
} from '@/lib/database-service';

export interface Empleado {
  id: string;
  nombre: string;
  email: string;
  cargo: string;
  telefono?: string;
  fecha_contratacion: string;
  salario?: number;
  activo: boolean;
  permisos: {
    pos: boolean
    inventario: boolean
    empleados: boolean
    reportes: boolean
    configuracion: boolean
    reservas: boolean
    menus: boolean
  };
  restaurante_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, empleadoInfo?: EmpleadoSignUpInfo) => Promise<void>;
  signOut: () => Promise<void>;
}

export interface EmpleadoSignUpInfo {
  nombre: string;
  cargo?: string;
  telefono?: string;
  salario?: number;
  restaurante_id?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Función de login
  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      console.log('Attempting to sign in with email:', email);
      setLoading(true);


      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      console.log('Attempting to sign in with email:', data);
      if (error) {
        console.error('Supabase auth error:', error);
        throw error;
      }

      if (data.user) {
        setUser(data.user);
      }
    } catch (error) {
      console.error('Error in signIn:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Función de registro
  const signUp = async (email: string, password: string, empleadoInfo?: EmpleadoSignUpInfo): Promise<void> => {
    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombre: empleadoInfo?.nombre || email.split('@')[0],
            cargo: empleadoInfo?.cargo,
            telefono: empleadoInfo?.telefono,
          },
        },
      });

      if (error) {
        console.error('Supabase signup error:', error);
        throw error;
      }


    } catch (error) {
      console.error('Error in signUp:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Función de logout
  const signOut = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabase signout error:', error);
        throw error;
      }

      setUser(null);
    } catch (error) {
      console.error('Error in signOut:', error);
      throw error;
    }
  };

  // Efecto para manejar cambios de autenticación
  useEffect(() => {
    let mounted = true;

    // Obtener sesión inicial
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        console.log(session);
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setLoading(false);
          }
          return;
        }

        if (session?.user && mounted) {
          setUser(session.user);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);

      if (!mounted) return;

      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const contextValue: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

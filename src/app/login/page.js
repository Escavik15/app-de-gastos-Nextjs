'use client';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { FiLock, FiMail } from 'react-icons/fi';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email: e.target.email.value,
        password: e.target.password.value,
        redirect: false,
      });

      if (result?.error) {
        setError('Credenciales incorrectas');
      } else {
        window.location.href = '/dashboard';
      }
    } catch (err) {
      setError('Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-100 via-blue-100 to-blue-200 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-8 space-y-6 border border-blue-100">
        {/* Encabezado */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-blue-800">Bienvenido</h1>
          <p className="mt-2 text-sm text-blue-600">Inicia sesión en tu cuenta</p>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-md bg-red-100 text-red-700 p-3 text-sm border border-red-200">
            {error}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <label htmlFor="email" className="block text-sm font-medium text-blue-700 mb-1">
              Correo electrónico
            </label>
            <div className="flex items-center bg-sky-50 border border-sky-200 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-blue-400">
              <div className="px-3 text-blue-500">
                <FiMail size={18} />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full bg-transparent p-2.5 text-blue-900 placeholder-blue-300 focus:outline-none"
                placeholder="ejemplo@email.com"
              />
            </div>
          </div>

          <div className="relative">
            <label htmlFor="password" className="block text-sm font-medium text-blue-700 mb-1">
              Contraseña
            </label>
            <div className="flex items-center bg-sky-50 border border-sky-200 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-blue-400">
              <div className="px-3 text-blue-500">
                <FiLock size={18} />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full bg-transparent p-2.5 text-blue-900 placeholder-blue-300 focus:outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-blue-600">
              <input type="checkbox" className="accent-blue-500" />
              Recordarme
            </label>
            <a href="#" className="text-blue-500 hover:underline">¿Olvidaste tu contraseña?</a>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-xl font-semibold text-white shadow-md transition-all ${
              isLoading
                ? 'bg-blue-300 cursor-wait'
                : 'bg-gradient-to-r from-sky-500 to-blue-600 hover:brightness-110'
            }`}
          >
            {isLoading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <div className="text-center text-sm text-blue-600">
          ¿No tienes cuenta?{' '}
          <a href="/register" className="font-semibold text-blue-500 hover:underline">
            Regístrate
          </a>
        </div>
      </div>
    </main>
  );
}

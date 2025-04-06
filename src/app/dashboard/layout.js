'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiHome, FiUser, FiLogOut, FiX, FiMenu, FiBarChart2 } from 'react-icons/fi';
import { LuBadgeDollarSign } from 'react-icons/lu';
import { signOut, useSession } from 'next-auth/react';

export default function DashboardLayout({ children }) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const { data: session } = useSession();

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-sky-100 to-blue-200 relative">
      <button 
        onClick={toggleMobileMenu}
        className="md:hidden fixed bottom-6 left-4 z-40 p-3 rounded-full bg-white text-sky-700 shadow-xl hover:scale-105 transition-transform animate-[heartbeat_1.5s_ease-in-out_infinite]"
      >
        <FiMenu size={24} />
      </button>

      <aside className={`${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transform fixed md:static top-0 left-0 h-full w-64 bg-white shadow-2xl rounded-tr-3xl rounded-br-3xl z-30 transition-transform duration-300 ease-in-out overflow-hidden border-r-4 border-sky-300`}>
        <div className="bg-sky-400 p-6 text-white flex items-center justify-center shadow-md mt-6 md:mt-0">
          <h1 className="text-lg font-bold tracking-wider text-center">Hola, {session?.user?.name?.split(' ')[0] || 'Usuario'} 👋</h1>
        </div>

        <nav className="p-6 flex-1">
          <ul className="space-y-4">
            <MenuLink 
              href="/dashboard" 
              icon={<FiHome size={24} />} 
              label="Inicio" 
              onClick={toggleMobileMenu}
            />
            <MenuLink 
              href="/dashboard/gastos" 
              icon={<LuBadgeDollarSign size={24} />} 
              label="Gastos" 
              onClick={toggleMobileMenu}
            />
            <MenuLink 
              href="/dashboard/ingreso" 
              icon={<LuBadgeDollarSign size={24} />} 
              label="Ingresos" 
              onClick={toggleMobileMenu}
            />
            <MenuLink 
              href="/dashboard/resumen" 
              icon={<FiBarChart2 size={24} />} 
              label="Resumen" 
              onClick={toggleMobileMenu}
            />
            <MenuLink 
              href="/dashboard/perfil" 
              icon={<FiUser size={24} />} 
              label="Perfil" 
              onClick={toggleMobileMenu}
            />
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => {
              setShowLogoutModal(true);
              setMobileMenuOpen(false);
            }}
            className="flex items-center w-full px-4 py-3 text-red-600 font-semibold rounded-xl bg-red-100 hover:bg-red-200 transition-all"
          >
            <FiLogOut className="mr-3" size={20} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {mobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={toggleMobileMenu}
        />
      )}

      <main className="flex-1 overflow-y-auto p-6 md:p-10">
        {session?.user?.name && (
          <div className="mb-8 bg-white/80 p-6 rounded-2xl shadow-xl border border-blue-200">
            <p className="text-sm text-sky-700">Bienvenido de nuevo,</p>
            <h2 className="text-2xl font-bold text-sky-900 tracking-wide uppercase">
              {session.user.name} 👋
            </h2>
          </div>
        )}
        {children}
      </main>

      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md mx-4">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Confirmar cierre de sesión</h3>
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="p-6">
              <p className="text-gray-600 mb-6">¿Estás seguro que deseas cerrar tu sesión?</p>
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuLink({ href, icon, label, onClick }) {
  return (
    <li>
      <Link
        href={href}
        className="flex items-center justify-between gap-3 px-5 py-3 bg-white/90 border border-sky-300 rounded-2xl text-sky-900 hover:bg-sky-400 hover:text-white shadow-md hover:shadow-xl transition-all duration-300 font-semibold"
        onClick={onClick}
      >
        <span className="flex items-center gap-3">
          {icon}
          {label}
        </span>
        <span className="text-xs font-bold bg-sky-200 text-sky-700 px-2 py-0.5 rounded-full">›</span>
      </Link>
    </li>
  );
}
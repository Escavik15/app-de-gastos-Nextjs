'use client';
import { useEffect, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { FiDollarSign, FiArrowUpCircle, FiArrowDownCircle, FiTrendingUp } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function DashboardGlobal() {
  const [loading, setLoading] = useState(true);
  const [resumen, setResumen] = useState({ ingresos: 0, gastos: 0 });
  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/dashboard/global');
        const data = await res.json();
        setResumen(data.resumen || { ingresos: 0, gastos: 0 });
        setHistorial(data.historial || []);
      } catch (err) {
        console.error('Error al cargar datos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const balance = (resumen.ingresos || 0) - (resumen.gastos || 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800" />
      </div>
    );
  }

  const cards = [
    {
      title: 'Ingresos',
      value: resumen.ingresos,
      icon: <FiArrowUpCircle size={32} />,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Gastos',
      value: resumen.gastos,
      icon: <FiArrowDownCircle size={32} />,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      title: 'Balance',
      value: balance,
      icon: <FiTrendingUp size={32} />,
      color: balance >= 0 ? 'text-green-700' : 'text-red-700',
      bg: balance >= 0 ? 'bg-green-100' : 'bg-red-100',
    },
  ];

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Resumen Global</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`rounded-2xl p-5 shadow-md ${card.bg}`}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-500">{card.title}</p>
              <div className={`p-2 rounded-full bg-white shadow-inner ${card.color}`}>
                {card.icon}
              </div>
            </div>
            <p className={`text-3xl font-bold ${card.color}`}>
              <FiDollarSign className="inline mr-1" />
              {card.value.toLocaleString()}
            </p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white p-4 rounded-2xl border border-gray-200 shadow"
      >
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Historial Mensual</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={historial}>
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Bar dataKey="ingresos" fill="#34d399" name="Ingresos" radius={[4, 4, 0, 0]} />
              <Bar dataKey="gastos" fill="#f87171" name="Gastos" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}

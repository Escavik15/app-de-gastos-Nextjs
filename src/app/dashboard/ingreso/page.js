'use client';

import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';

export default function FormIngreso() {
  const [descripcion, setDescripcion] = useState('');
  const [valor, setValor] = useState('');
  const [fecha, setFecha] = useState('');
  const [ingresos, setIngresos] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchIngresos = async () => {
    const res = await fetch('/api/ingresos/usuario');
    const data = await res.json();
    setIngresos(data);
  };

  useEffect(() => {
    fetchIngresos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/ingresos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          descripcion,
          valor: parseFloat(valor),
          fecha
        })
      });

      const data = await res.json();
      if (res.ok) {
        setDescripcion('');
        setValor('');
        setFecha('');
        fetchIngresos();
      } else {
        alert(data.error || 'Error al agregar ingreso');
      }
    } catch (err) {
      console.error(err);
      alert('Error al enviar ingreso');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('¿Eliminar este ingreso?');
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/ingresos/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchIngresos();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">
      {/* FORMULARIO */}
      <form
        onSubmit={handleSubmit}
        className="p-6 rounded-2xl shadow-lg bg-gradient-to-tr from-green-50 via-white to-green-100 border border-green-300 space-y-5"
      >
        <h2 className="text-2xl font-bold text-green-700">Agregar Ingreso</h2>

        <div>
          <label className="block text-sm font-semibold text-green-800 mb-1">Descripción</label>
          <input
            type="text"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-lg bg-white border border-green-300 focus:ring-2 focus:ring-green-400 text-green-900 placeholder-green-400"
            placeholder="Ej: Sueldo, venta, regalo..."
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-green-800 mb-1">Monto</label>
          <input
            type="number"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-lg bg-white border border-green-300 focus:ring-2 focus:ring-green-400 text-green-900 placeholder-green-400"
            placeholder="Ej: 12000"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-green-800 mb-1">Fecha</label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-lg bg-white border border-green-300 focus:ring-2 focus:ring-green-400 text-green-900"
          />
          <p className="text-xs text-green-600 mt-1">
            Usá la fecha actual (hoy) como referencia para el ingreso.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold transition shadow"
        >
          {loading ? 'Guardando...' : 'Guardar Ingreso'}
        </button>
      </form>

      {/* TABLA */}
      <div className="bg-white p-6 rounded-2xl shadow-md border border-green-200">
        <h2 className="text-xl font-semibold text-green-700 mb-4">Mis Ingresos</h2>

        {ingresos.length === 0 ? (
          <p className="text-green-500">No hay ingresos registrados aún.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-green-900">
              <thead className="bg-green-100 text-green-700 border-b border-green-300">
                <tr>
                  <th className="text-left px-4 py-2">Descripción</th>
                  <th className="text-left px-4 py-2">Monto</th>
                  <th className="text-left px-4 py-2">Fecha</th>
                  <th className="text-right px-4 py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ingresos.map((ingreso) => (
                  <tr key={ingreso._id} className="border-b border-green-100 hover:bg-green-50">
                    <td className="px-4 py-2">{ingreso.descripcion}</td>
                    <td className="px-4 py-2 font-semibold text-green-600">
                      ${ingreso.valor.toLocaleString()}
                    </td>
                    <td className="px-4 py-2">{new Date(ingreso.fecha).toLocaleDateString()}</td>
                    <td className="px-4 py-2 text-right">
                      <button
                        onClick={() => handleDelete(ingreso._id)}
                        className="text-red-500 hover:text-red-700 transition font-medium"
                        title="Eliminar ingreso"
                      >
                        <Trash2 size={18} className="inline-block" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

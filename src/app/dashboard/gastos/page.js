'use client'
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function GastosPage() {
  const [gastos, setGastos] = useState([]);
  const [error, setError] = useState(null);
  const [gastoAEliminar, setGastoAEliminar] = useState({ id: null, concepto: '' }); // Estado para el gasto a eliminar
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false); // Estado para el modal

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/gastos');
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Error ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
          console.error("Los datos no son un array:", data);
          throw new Error('Formato de respuesta inválido: se esperaba un array');
        }

        setGastos(data);
      } catch (error) {
        setError(error.message);
        console.error("Error fetching gastos:", error);
      }
    };

    fetchData();
  }, []);

  // Función para eliminar gasto
  const eliminarGasto = async () => {
    try {
      const response = await fetch(`/api/gastos/${gastoAEliminar.id}`, {
        method: 'DELETE',
      });
  
      if (!response.ok) {
        throw new Error('Error al eliminar el gasto');
      }
  
      setGastos(prevGastos => prevGastos.filter(gasto => gasto._id !== gastoAEliminar.id));
      setMostrarConfirmacion(false);
      
    } catch (error) {
      console.error('Error al eliminar el gasto:', error);
      setError(error.message);
    }
  };

  // Función para mostrar confirmación
  const confirmarEliminacion = (gastoId, concepto) => {
    setGastoAEliminar(
      {
        id: gastoId,
        concepto: concepto
      }
    );
    setMostrarConfirmacion(true);
  };

  const pagarCuota = async (gastoId, cuotaId) => {
    try {
      const response = await fetch(`/api/gastos/pagar-cuota`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gastoId, cuotaId }),
      });

      if (!response.ok) {
        throw new Error('Error al pagar la cuota');
      }

      const updatedGasto = await response.json();
      setGastos((prevGastos) =>
        prevGastos.map((gasto) =>
          gasto._id === gastoId ? { ...updatedGasto } : gasto
        )
      );

    } catch (error) {
      console.error('Error al pagar la cuota:', error);
    }
  };

  if (error) return <div>Error: {error}</div>;

  const mesActual = new Date().getMonth() + 1;
  const añoActual = new Date().getFullYear();

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      {mostrarConfirmacion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full">
            <h3 className="text-xl font-semibold text-gray-700 mb-3">¿Eliminar gasto?</h3>
            <p className="text-gray-600 mb-6">
              Vas a eliminar <span className="font-bold">{gastoAEliminar.concepto}</span>. Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setMostrarConfirmacion(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
              >
                Cancelar
              </button>
              <button
                onClick={eliminarGasto}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
  
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-purple-800">💸 Mis Gastos</h1>
        <Link
          href="/dashboard/gastos/nuevo"
          className="px-4 py-2 bg-lime-500 hover:bg-lime-600 text-white font-semibold rounded-xl transition"
        >
          + Nuevo Gasto
        </Link>
      </div>
  
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gastos.map((gasto) => {
          const cuotasPendientes = gasto.cuotasPendientes || [];
          const deudaRestante = cuotasPendientes
            .filter(c => !c.pagada)
            .reduce((sum, cuota) => sum + (cuota.monto || 0), 0);
  
          return (
            <div
              key={gasto._id}
              className={`rounded-xl p-5 shadow-md transition-all hover:shadow-lg border-2 ${
                gasto.pagada ? 'bg-green-50 border-green-300' : 'bg-white border-purple-200'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-bold text-purple-800">{gasto.concepto}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(gasto.fecha).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <div className="flex gap-2 items-center">
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                    gasto.pagada
                      ? 'bg-green-200 text-green-800'
                      : 'bg-red-200 text-red-800'
                  }`}>
                    {gasto.pagada ? 'PAGADO' : 'PENDIENTE'}
                  </span>
                  <button
                    onClick={() => confirmarEliminacion(gasto._id, gasto.concepto)}
                    className="text-xs px-2 py-1 rounded bg-red-500 text-white hover:bg-red-600"
                    title="Eliminar gasto"
                  >
                    ✖
                  </button>
                </div>
              </div>
  
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <p className="text-gray-500">Cuotas restantes</p>
                  <p className="font-semibold text-gray-700">{cuotasPendientes.filter(c => !c.pagada).length}</p>
                </div>
                <div>
                  <p className="text-gray-500">Deuda total</p>
                  <p className="font-semibold text-gray-700">${deudaRestante}</p>
                </div>
              </div>
  
              <div className="border-t pt-3">
                <p className="text-gray-600 mb-2 font-semibold">📆 Cuotas:</p>
                <ul className="space-y-1 text-sm">
                  {cuotasPendientes.map(cuota => {
                    const fechaBase = new Date(gasto.fecha);
                    const fechaCuota = new Date(fechaBase);
                    fechaCuota.setMonth(fechaBase.getMonth() + cuota.numero);
                    const mesCuota = fechaCuota.getMonth() + 1;
                    const añoCuota = fechaCuota.getFullYear();
                    const esCuotaDelMes = mesCuota === mesActual && añoCuota === añoActual;
  
                    return (
                      <li key={cuota._id} className={`flex items-center justify-between ${
                        cuota.pagada ? 'text-green-700' : 'text-red-700'
                      }`}>
                        <span>
                          Cuota {cuota.numero}: ${cuota.monto} - {cuota.pagada ? 'Pagada' : 'Pendiente'}
                        </span>
                        {!cuota.pagada && esCuotaDelMes && (
                          <button
                            onClick={() => pagarCuota(gasto._id, cuota._id)}
                            className="ml-2 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                          >
                            Pagar
                          </button>
                        )}
                        {!cuota.pagada && !esCuotaDelMes && (
                          <span className="text-xs text-gray-400 ml-2">
                            Vence: {fechaCuota.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}  
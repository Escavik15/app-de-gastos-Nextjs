'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FiSave, FiTrash2, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';

export default function EditarGasto() {
  const router = useRouter();
  const params = useParams(); // Obtenemos los parámetros correctamente
  const [gasto, setGasto] = useState({
    concepto: '',
    valor: '',
    cuotas: '',
    pagado: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar datos cuando el componente se monta
  useEffect(() => {
    

    const fetchData = async () => {
      try {
        
        const response = await fetch(`/api/editar/${params.id}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al cargar el gasto');
        }

        const data = await response.json();
        
        setGasto({
          concepto: data.concepto,
          valor: data.valor,
          cuotas: data.cuotas,
          pagado: data.pagada || false
        });
        
      } catch (err) {
        console.error('Error al cargar gasto:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params?.id]); // Dependencia de params.id

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!params?.id) return; // Validación adicional
    
    setLoading(true);
    
    try {
      const response = await fetch(`/api/editar/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData: {
            concepto: gasto.concepto,
            valor: gasto.valor,
            cuotas: gasto.cuotas,
            pagada: gasto.pagado
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar');
      }

      router.push('/dashboard/gastos');
      
    } catch (err) {
      console.error('Error al guardar:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const handlePagar = () => {
    setGasto({ ...gasto, pagado: !gasto.pagado });
  };

  const handleEliminar = async () => {
    if (!params?.id) return;
    
    if (confirm("¿Eliminar este gasto permanentemente?")) {
      try {
        const response = await fetch(`/api/editar/${params.id}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al eliminar');
        }

        router.push('/dashboard/gastos');
        
      } catch (err) {
        console.error('Error al eliminar:', err);
        setError(err.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="p-4 max-w-md mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lime-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 max-w-md mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          <p className="font-medium">Error:</p>
          <p>{error}</p>
          <button 
            onClick={() => router.back()}
            className="mt-2 text-sm text-red-600 hover:text-red-800 flex items-center"
          >
            <FiArrowLeft className="mr-1" /> Volver
          </button>
        </div>
      </div>
    );
  }


return (
  <div className="p-4 max-w-md mx-auto">
    {/* Botón de volver */}
    <button 
      onClick={() => router.back()}
      className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
      disabled={loading}
    >
      <FiArrowLeft className="mr-2" /> Volver
    </button>

    {/* Card del formulario */}
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Editar Gasto</h2>
        <button
          onClick={handleEliminar}
          className="text-red-500 hover:text-red-700 flex items-center"
          disabled={loading}
        >
          <FiTrash2 className="mr-1" /> Eliminar
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Concepto <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={gasto.concepto}
            onChange={(e) => setGasto({...gasto, concepto: e.target.value})}
            required
            disabled={loading}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-lime-500 focus:border-lime-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Valor ($) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={gasto.valor}
            onChange={(e) => setGasto({...gasto, valor: e.target.value})}
            min="0"
            step="0.01"
            required
            disabled={loading}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-lime-500 focus:border-lime-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cuotas <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={gasto.cuotas}
            onChange={(e) => setGasto({...gasto, cuotas: e.target.value})}
            min="1"
            required
            disabled={loading}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-lime-500 focus:border-lime-500"
          />
        </div>

        {/* Botón de pagar */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handlePagar}
            disabled={loading}
            className={`w-full py-2 px-4 rounded-md flex items-center justify-center ${
              gasto.pagado
                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            <FiCheckCircle className="mr-2" />
            {gasto.pagado ? 'Pagado ✓' : 'Marcar como Pagado'}
          </button>
        </div>

        {/* Botón de guardar */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full mt-6 py-2 px-4 text-white rounded-md flex items-center justify-center ${
            loading ? 'bg-gray-400' : 'bg-lime-500 hover:bg-lime-600'
          }`}
        >
          {loading ? (
            'Guardando...'
          ) : (
            <>
              <FiSave className="mr-2" /> Guardar Cambios
            </>
          )}
        </button>

        {error && (
          <div className="text-red-500 text-sm mt-2">
            {error}
          </div>
        )}
      </form>
    </div>
  </div>
);
}
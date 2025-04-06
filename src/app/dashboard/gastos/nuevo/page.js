'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { FiSave, FiArrowLeft } from 'react-icons/fi';

export default function NuevoGasto() {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  const [formData, setFormData] = useState({
    concepto: '',
    valor: '',
    cuotas: 0
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Modificación específica para el campo 'valor'
    if (name === 'valor') {
      // Permitir cadena vacía o valores numéricos (incluyendo 0)
      if (value === '' || (!isNaN(value) && Number(value) >= 0)) {
        setFormData({
          ...formData,
          [name]: value
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    // Validaciones mejoradas
    if (!formData.concepto.trim()) {
      setError("El concepto es requerido");
      setIsSubmitting(false);
      return;
    }

    if (formData.valor === '' || isNaN(Number(formData.valor))) {
      setError("El valor debe ser un número válido");
      setIsSubmitting(false);
      return;
    }

    // Convertir a número y aceptar 0
    const valorNumerico = Number(formData.valor);
    if (valorNumerico < 0) {
      setError("El valor no puede ser negativo");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/gasto-nuevo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData: {
            ...formData,
            valor: valorNumerico // Enviamos el valor convertido a número
          },
          userId: session?.user?.id
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al guardar el gasto');
      }

      router.push('/dashboard/gastos');
    } catch (err) {
      setError(err.message || "Error al guardar el gasto");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
      >
        <FiArrowLeft className="mr-2" /> Volver
      </button>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Nuevo Gasto</h2>

        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Concepto <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="concepto"
              value={formData.concepto}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-lime-500 focus:border-lime-500 text-gray-700"
              placeholder="Ej: Cuota del gimnasio"
            />
          </div>

          <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Valor ($) <span className="text-red-500">*</span>
  </label>
  <input
    type="number"
    name="valor"
    value={formData.valor}
    onChange={handleChange}
    min="0"
    step="0.01"
    required
    className="w-full p-2 border border-gray-300 rounded-md focus:ring-lime-500 focus:border-lime-500 text-gray-700"
    placeholder="0.00"
  />
  <p className="text-xs text-gray-500 mt-1">
    Si el gasto es en cuotas, ingresá el valor de <strong>cada cuota</strong>.
  </p>
</div>

<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Cuotas <span className="text-red-500">*</span>
  </label>
  <input
    type="number"
    name="cuotas"
    value={formData.cuotas}
    onChange={handleChange}
    min="0"
    required
    className="w-full p-2 border border-gray-300 rounded-md focus:ring-lime-500 focus:border-lime-500 text-gray-700"
  />
  <p className="text-xs text-gray-500 mt-1">
    Si el pago fue inmediato, dejá este campo en <strong>0</strong>.
  </p>
</div>


          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full mt-8 py-2 px-4 text-white rounded-md flex items-center justify-center ${isSubmitting ? 'bg-lime-400' : 'bg-lime-500 hover:bg-lime-600'}`}
          >
            <FiSave className="mr-2" />
            {isSubmitting ? 'Guardando...' : 'Guardar Gasto'}
          </button>
        </form>
      </div>
    </div>
  );
}
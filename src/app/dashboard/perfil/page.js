'use client';
import { useState, useEffect } from 'react';
import { FiEdit, FiSave } from 'react-icons/fi';

export default function PerfilPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    telefono: '',
    updatedAt: ''
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch('/api/user');
        if (!res.ok) throw new Error('Error al obtener los datos');
        const data = await res.json();
        console.log('user data: ', data);
        setFormData(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Solo permitir números en el campo "telefono"
    if (name === 'telefono' && !/^\d*$/.test(value)) {
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsEditing(false);
    try {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Error al actualizar los datos');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-sky-900 mb-6">👤 Mi Perfil</h2>

      <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-md border border-sky-200 p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-6">
          <div className="w-24 h-24 rounded-full bg-sky-100 flex items-center justify-center text-4xl text-sky-500 shadow-inner">
            👤
          </div>
          <div className="text-center sm:text-left">
            <h3 className="text-xl font-semibold text-sky-800">
              {formData.username || 'Cargando...'}
            </h3>
            <p className="text-sky-600 text-sm">{formData.email || 'Cargando...'}</p>
            <p className="text-gray-500 text-xs">
              Última actualización:{' '}
              {formData.updatedAt ? new Date(formData.updatedAt).toLocaleString() : '---'}
            </p>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="mt-2 text-sm text-white bg-sky-500 hover:bg-sky-600 px-3 py-1 rounded-md shadow flex items-center justify-center mx-auto sm:mx-0 transition"
            >
              {isEditing ? (
                <>
                  <FiSave className="mr-2" />
                  Guardar cambios
                </>
              ) : (
                <>
                  <FiEdit className="mr-2" />
                  Editar perfil
                </>
              )}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField label="Nombre de usuario" name="username" type="text" value={formData.username} onChange={handleChange} editable={isEditing} />
          <FormField label="Correo electrónico" name="email" type="email" value={formData.email} onChange={handleChange} editable={isEditing} />
          <FormField label="Teléfono" name="telefono" type="tel" value={formData.telefono} onChange={handleChange} editable={isEditing} />

          {isEditing && (
            <div className="pt-4 flex gap-4 justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition-colors flex items-center shadow"
              >
                <FiSave className="mr-2" />
                Guardar
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

function FormField({ label, name, type, value, onChange, editable }) {
  return (
    <div>
      <label className="block text-sm font-medium text-sky-700 mb-1">{label}</label>
      {editable ? (
        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          className="w-full p-3 border border-sky-200 rounded-lg focus:ring-sky-500 focus:border-sky-500 text-sm bg-white/90 shadow-inner"
        />
      ) : (
        <div className="w-full p-3 text-gray-800 bg-white/80 border border-gray-200 rounded-md shadow-inner">
          {value || 'No especificado'}
        </div>
      )}
    </div>
  );
}
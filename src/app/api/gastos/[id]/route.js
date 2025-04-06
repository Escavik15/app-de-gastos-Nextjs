// app/api/gastos/[id]/route.js
import { NextResponse } from 'next/server';
import  connectDB  from '../../../lib/connectDB'; // Asegúrate de tener tu conexión a MongoDB
import Gastos from '../../../models/Gastos'; // Asegúrate de tener tu modelo de Gastos
import { ObjectId } from 'mongodb'; // Importación necesaria


export async function DELETE(request) {
  try {
      // Extraer el ID de la URL
      const pathParts = request.url.split('/');
      console.log("estos son los pathParts : ",pathParts)
      let id = pathParts[pathParts.length - 1];

      console.log("esta id pathParts : ",pathParts[pathParts.length - 1])
      // Limpiar parámetros de query si existen (ej: ?param=value)
      
      
      // Validación del ID
      if (!id || !ObjectId.isValid(id)) {
          return NextResponse.json(
              { success: false, message: 'ID de gasto no válido' },
              { status: 400 }
          );
      }
  
      await connectDB();
  
      // Convertir a ObjectId y eliminar
      const result = await Gastos.deleteOne({ _id :id });
      
      if (result.deletedCount === 0) {
          return NextResponse.json(
              { success: false, message: 'Gasto no encontrado' },
              { status: 404 }
          );
      }
  
      return NextResponse.json(
          { success: true, message: 'Gasto eliminado correctamente' },
          { status: 200 }
      );
  
  } catch (error) {
      console.error('Error al eliminar gasto:', error);
      return NextResponse.json(
          { 
              success: false,
              message: error.message.includes('Cast to ObjectId failed') 
                  ? 'Formato de ID inválido' 
                  : 'Error interno del servidor'
          },
          { status: 500 }
      );
  }
}
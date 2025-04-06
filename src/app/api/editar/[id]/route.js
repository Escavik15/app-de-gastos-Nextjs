import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectDB from '../../../lib/connectDB';
import Gasto from '../../../models/Gastos';
import mongoose from 'mongoose';

export async function PUT(request, { params }) {
    const session = await getServerSession(authOptions);
    
    // Verificar autenticación
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
  
    try {
      await connectDB();
      const { formData } = await request.json();
        
      // Validación de campos requeridos
      if (!formData?.concepto || !formData?.valor || !formData?.cuotas) {
        return NextResponse.json(
          { error: 'Faltan campos requeridos: concepto, valor o cuotas' },
          { status: 400 }
        );
      }
  
      // Convertir y validar tipos
      const valor = Number(formData.valor);
      const cuotas = Number(formData.cuotas);
  
  
      // Actualizar el gasto con los nuevos datos
      const updatedGasto = await Gasto.findOneAndUpdate(
        {
          _id: params.id,
          user: session.user.id // Solo el dueño puede editar
        },
        {
          concepto: formData.concepto.trim(),
          valor: valor,
          cuotas: cuotas,
          pagada: formData.pagada
          //deudaTotal: valor * cuotas,
          //deudaRestante: valor * (cuotas - 1),
          //Actualizar cuotaActual si es necesario
          //cuotaActual: formData.cuotaActual || 1
        },
        { new: true } // Devuelve el documento actualizado
      );
  
      if (!updatedGasto) {
        return NextResponse.json(
          { error: 'Gasto no encontrado o no tienes permisos para editarlo' },
          { status: 404 }
        );
      }
  
      return NextResponse.json({
        success: true,
        gasto: updatedGasto
      }, { status: 200 });
  
    } catch (error) {
      console.error('Error al actualizar gasto:', error);
      return NextResponse.json(
        { error: 'Error interno al actualizar el gasto: ' + error.message },
        { status: 500 }
      );
    }
  }

  export async function GET(request, context) {
    const params = await context.params; // ⚡️ Asegurar que params está disponible
    console.log("params del context : " , params)
    if (!params?.id) {
        return NextResponse.json(
            { error: 'ID requerido' },
            { status: 400 }
        );
    }

    const session = await getServerSession(authOptions);

    // 1. Verificar autenticación
    if (!session?.user?.id) {
        return NextResponse.json(
            { error: 'No autorizado. Por favor inicia sesión.' },
            { status: 401 }
        );
    }

    try {
        await connectDB();

     /*   // 2. Validar formato del ID
        if (!mongoose.Types.ObjectId.isValid(params.id)) {
            return NextResponse.json(
                { error: 'Formato de ID no válido' },
                { status: 400 }
            );
        }
*/
        // 3. Buscar el gasto en la base de datos
        const gasto = await Gasto.findOne({
            _id: params.id,
            user: session.user.id,
        }).lean();
       
        // 4. Verificar si se encontró el gasto
        if (!gasto) {
            return NextResponse.json(
                { error: 'Gasto no encontrado o no tienes permisos para verlo' },
                { status: 404 }
            );
        }

        // 5. Formatear la respuesta
        const responseData = {
            _id: gasto._id.toString(),
            concepto: gasto.concepto,
            valor: gasto.valor,
            cuotas: gasto.cuotas,
            cuotaActual: gasto.cuotaActual,
            fecha: gasto.fecha.toISOString().split('T')[0],
            deudaTotal: gasto.deudaTotal,
            deudaRestante: gasto.deudaRestante,
            pagada: gasto.pagada
        };

        return NextResponse.json(responseData, { status: 200 });

    } catch (error) {
        console.error('Error al obtener gasto:', error);
        return NextResponse.json(
            { error: 'Error interno al obtener el gasto: ' + error.message },
            { status: 500 }
        );
    }
}

/*
export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await request.json();

    // Validación básica
    if (!body.concepto || !body.valor || !body.cuotas) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    const updatedGasto = await Gasto.findOneAndUpdate(
      {
        _id: params.id,
        user: session.user.id // Asegura que solo el dueño pueda editar
      },
      {
        concepto: body.concepto.trim(),
        valor: Number(body.valor),
        cuotas: Number(body.cuotas),
        // Actualiza deudaTotal y deudaRestante si es necesario
        deudaTotal: Number(body.valor) * Number(body.cuotas),
        deudaRestante: Number(body.valor) * (Number(body.cuotas) - 1)
      },
      { new: true } // Devuelve el documento actualizado
    );

    if (!updatedGasto) {
      return NextResponse.json(
        { error: 'Gasto no encontrado o no autorizado' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedGasto, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al actualizar el gasto: ' + error.message },
      { status: 500 }
    );
  }
}
*/
export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    await connectDB();
    
    const deletedGasto = await Gasto.findOneAndDelete({
      _id: params.id,
      user: session.user.id
    });

    if (!deletedGasto) {
      return NextResponse.json(
        { error: 'Gasto no encontrado o no autorizado' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Gasto eliminado correctamente' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al eliminar el gasto: ' + error.message },
      { status: 500 }
    );
  }
}
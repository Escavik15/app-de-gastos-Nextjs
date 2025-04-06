import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectDB from '../../../lib/connectDB';
import Ingreso from '../../../models/Ingreso';

export async function GET() {
  await connectDB();
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const ingresos = await Ingreso.find({ userId: session.user.id }).sort({ fecha: -1 }).lean();
    return NextResponse.json(ingresos);
  } catch (error) {
    console.error('Error al obtener ingresos del usuario:', error);
    return NextResponse.json({ error: 'Error al obtener ingresos' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
    await connectDB();
    const session = await getServerSession(authOptions);
  
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
  
    try {
      const ingreso = await Ingreso.findOneAndDelete({
        _id: params.id,
        userId: session.user.id
      });
  
      if (!ingreso) {
        return NextResponse.json({ error: 'Ingreso no encontrado o no autorizado' }, { status: 404 });
      }
  
      return NextResponse.json({ message: 'Ingreso eliminado' });
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error: 'Error al eliminar ingreso' }, { status: 500 });
    }
  }
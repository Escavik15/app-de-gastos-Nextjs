import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import connectDB from '../../lib/connectDB';
import Ingreso from '../../models/Ingreso';

export async function POST(req) {
  await connectDB();
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const userId = session.user.id;
  const { descripcion, valor, fecha } = await req.json();

  if (!descripcion || !valor || !fecha) {
    return NextResponse.json({ error: 'Todos los campos son obligatorios' }, { status: 400 });
  }

  try {
    const ingreso = await Ingreso.create({
      userId,
      descripcion,
      valor,
      fecha: new Date(fecha)
    });

    return NextResponse.json(ingreso);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Error al guardar ingreso' }, { status: 500 });
  }
}

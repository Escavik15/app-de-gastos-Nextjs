import { NextResponse } from 'next/server';
import connectToDB  from '../../lib/connectDB';
import User from '../../models/User';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(req) {
  try {
    await connectToDB();

    const session = await getServerSession(authOptions);
    
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    
    const user = await User.findById(session.user.id).select('username email updatedAt telefono');
 
    if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await connectToDB();
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    
    const { username, email, telefono } = await req.json();


const updatedUser = await User.findByIdAndUpdate(
  session.user.id,
  { username, email, telefono },
  { new: true }
).select('username email telefono');
    
    if (!updatedUser) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

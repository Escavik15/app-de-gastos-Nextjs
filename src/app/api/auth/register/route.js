import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import User from '../../../models/User';
import  connectDB  from '../../../lib/connectDB';

export async function POST(request) {
  const { username,  telefono, email, password } = await request.json();

  console.log('Datos recibidos:', { username,  telefono, email, password });

  if (!username  || !telefono || !email || !password) {
    console.log('Faltan campos');
    return NextResponse.json(
      { error: 'Todos los campos son requeridos' },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    console.log('Contraseña demasiado corta');
    return NextResponse.json(
      { error: 'La contraseña debe tener al menos 6 caracteres' },
      { status: 400 }
    );
  }

  try {
    await connectDB();
    console.log('Conectado a la base de datos');

    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log('Correo ya registrado:', email);
      return NextResponse.json(
        { error: 'El correo ya está registrado' },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(password, 12);
    console.log('Contraseña hasheada');

    const newUser = new User({
      username,
      telefono : Number(telefono),
      email,
      password: hashedPassword,
    });

    await newUser.save();
    console.log('Usuario creado exitosamente:', newUser);

    return NextResponse.json(
      { success: true },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error en registro:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

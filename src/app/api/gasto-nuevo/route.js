// app/api/gastos/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import  Gasto  from "../../models/Gastos";
import connectDB from "../../lib/connectDB";

export async function POST(request) {
  const session = await getServerSession(authOptions);
  
  try {
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { formData } = await request.json();
    console.log("Datos recibidos:", formData);
    await connectDB();
    
    const cuotas = Number(formData.cuotas);
    const montoCuota = Number(formData.valor);
    const cuotasArray = [];
    
    // Determinar si es pago inmediato (0 cuotas)
    const esPagoInmediato = cuotas === 0;
    
    // Solo generar cuotas si no es pago inmediato
    if (!esPagoInmediato) {
      for (let i = 1; i <= cuotas; i++) {
        cuotasArray.push({
          numero: i,
          monto: montoCuota,
          pagada: false,
          fechaPago: null,
        });
      }
    }

    const nuevoGasto = new Gasto({
      user: session.user.id,
      concepto: formData.concepto.trim(),
      valor: montoCuota,
      cuotas: cuotas,
      cuotasPendientes: cuotasArray,
      pagada: esPagoInmediato, // true si es 0 cuotas, false si tiene cuotas
      fechaPago: esPagoInmediato ? new Date() : null // Opcional: registrar fecha si es pago inmediato
    });

    console.log("Nuevo gasto creado:", nuevoGasto);
    await nuevoGasto.save();
    
    return NextResponse.json(nuevoGasto, { status: 201 });

  } catch (error) {
    console.error("Error al crear gasto:", error);
    return NextResponse.json(
      { error: "Error al guardar: " + error.message },
      { status: 500 }
    );
  }
}




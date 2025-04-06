// app/api/gastos/route.js
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import connectDB from "../../lib/connectDB";
import Gasto from "@/app/models/Gastos";


export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json(
          { message: "No autorizado" },
          { status: 401 }
        );
      }
    try {
      await connectDB();
      const user = session.user.id
      const gastos = await Gasto.find({ user }).lean();
      
      
      return NextResponse.json(gastos, { status: 200 });
  
    } catch (error) {
      return NextResponse.json(
        { message: "Error al obtener gastos: " + error.message },
        { status: 500 }
      );
    }
  }


  /************************************************************************************************************* */

  export async function PATCH(req, res) {
    try {
      // Conectamos a la base de datos
      await connectDB();
  
      // Obtenemos el cuerpo de la solicitud
      const { gastoId, cuotaId } = await req.json();
  
      // Buscamos el gasto por su ID
      const gasto = await Gasto.findById(gastoId);
  
      if (!gasto) {
        return res.status(404).json({ error: 'Gasto no encontrado' });
      }
  
      // Buscamos la cuota en el arreglo de cuotasPendientes
      const cuota = gasto.cuotasPendientes.id(cuotaId);
  
      if (!cuota) {
        return res.status(404).json({ error: 'Cuota no encontrada' });
      }
  
      // Si la cuota no está pagada, la marcamos como pagada
      if (!cuota.pagada) {
        cuota.pagada = true;
        cuota.fechaPago = new Date(); // Fecha de pago actual
      } else {
        return res.status(400).json({ error: 'La cuota ya está pagada' });
      }
  
      // Guardamos el gasto actualizado
      await gasto.save();
  
      // Respondemos con el gasto actualizado
      res.status(200).json(gasto);
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al procesar la solicitud' });
    }
  }
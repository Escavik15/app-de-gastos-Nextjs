import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import connectDB from "../../lib/connectDB";
import Gasto from "../../models/Gastos";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ error: "No autorizado" }), { status: 401 });
  }

  await connectDB();

  const userId = session.user.id;

  const fechaInicio = new Date();
  fechaInicio.setDate(1);
  fechaInicio.setHours(0, 0, 0, 0);

  const fechaFin = new Date(fechaInicio);
  fechaFin.setMonth(fechaInicio.getMonth() + 1);
  fechaFin.setDate(0);
  fechaFin.setHours(23, 59, 59, 999);

  // Traer todos los gastos del usuario
  const gastos = await Gasto.find({ user: userId });
  
  const gastosSimples = [];
  const cuotasDelMes = [];

  for (const gasto of gastos) {
    console.log("gasto: ", gasto);
    if (gasto.cuotas === 0 && gasto.fecha >= fechaInicio && gasto.fecha <= fechaFin){ 
      gastosSimples.push({
        _id: gasto._id,
        concepto: gasto.concepto,
        valor: gasto.valor,
      });
    } else {
      gasto.cuotasPendientes.forEach((cuota) => {
        if (
          cuota.pagada &&
          cuota.fechaPago &&
          cuota.fechaPago >= fechaInicio &&
          cuota.fechaPago <= fechaFin
        ) {
          cuotasDelMes.push({
            concepto: gasto.concepto,
            monto: cuota.monto,
            numero: cuota.numero,
            fechaPago: cuota.fechaPago,
            idGasto: gasto._id
          });
        }
      });
    }
  }

  const totalGastos = [
    ...cuotasDelMes.map((c) => c.monto),
    ...gastosSimples.map((g) => g.valor)
  ].reduce((acc, val) => acc + val, 0);
  
  console.log("mes: ", gastosSimples, cuotasDelMes, totalGastos);
  return Response.json({
    mes: fechaInicio.toLocaleString('es-ES', { month: 'long', year: 'numeric' }),
    gastosSimples,
    cuotasDelMes,
    totalGastos,
  });
}

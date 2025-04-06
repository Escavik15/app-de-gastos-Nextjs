import { NextResponse } from 'next/server';
import  connectDB  from '../../../lib/connectDB'; // tu función personalizada para conectar
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import Ingreso from '../../../models/Ingreso';
import Gasto from '../../../models/Gastos'; // tu modelo de gasto
import { getToken } from 'next-auth/jwt';



export async function GET(req) {
  await connectDB();
  const session = await getServerSession(authOptions);

  if (!session) {
    console.log('⛔ Usuario no autenticado');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const hoy = new Date();
  const mesActual = hoy.getMonth();
  const añoActual = hoy.getFullYear();

  let totalGastos = 0;
  let totalIngresos = 0;
  const meses = {};

  try {
    console.log('🔄 Obteniendo gastos del usuario...');
    const gastos = await Gasto.find({ user : userId }).lean();
    console.log('📦 Gastos encontrados:', gastos.length);

    for (const gasto of gastos) {
      if (gasto.cuotasPendientes?.length > 0) {
        console.log('➡️ Gasto en cuotas:', gasto.nombre || gasto.descripcion || gasto._id);
        for (const cuota of gasto.cuotasPendientes) {
          if (cuota.pagada && cuota.fechaPago) {
            const fecha = new Date(cuota.fechaPago);
            if (fecha.getMonth() === mesActual && fecha.getFullYear() === añoActual) {
              const key = `${fecha.toLocaleString('default', { month: 'short' })} ${fecha.getFullYear()}`;
              if (!meses[key]) meses[key] = { mes: key, ingresos: 0, gastos: 0 };
              totalGastos += cuota.monto;
              meses[key].gastos += cuota.monto;
              console.log(`✅ Cuota pagada agregada (${key}): $${cuota.monto}`);
            }
          }
        }
      } else {
        // Gasto inmediato
        const fecha = new Date(gasto.fecha);
        if (fecha.getMonth() === mesActual && fecha.getFullYear() === añoActual) {
          const key = `${fecha.toLocaleString('default', { month: 'short' })} ${fecha.getFullYear()}`;
          if (!meses[key]) meses[key] = { mes: key, ingresos: 0, gastos: 0 };
          totalGastos += gasto.valor;
          meses[key].gastos += gasto.valor;
          console.log(`💸 Gasto inmediato agregado (${key}): $${gasto.valor}`);
        } else {
          console.log(`📅 Gasto fuera del mes actual: ${gasto.fecha}`);
        }
      }
    }

    console.log('🔄 Obteniendo ingresos del usuario...');
    const ingresos = await Ingreso.find({ userId }).lean();
    console.log('📦 Ingresos encontrados:', ingresos.length);

    for (const ingreso of ingresos) {
      const fecha = new Date(ingreso.fecha);
      if (fecha.getMonth() === mesActual && fecha.getFullYear() === añoActual) {
        const key = `${fecha.toLocaleString('default', { month: 'short' })} ${fecha.getFullYear()}`;
        if (!meses[key]) meses[key] = { mes: key, ingresos: 0, gastos: 0 };
        totalIngresos += ingreso.valor;
        meses[key].ingresos += ingreso.valor;
        console.log(`💰 Ingreso agregado (${key}): $${ingreso.valor}`);
      } else {
        console.log(`📅 Ingreso fuera del mes actual: ${ingreso.fecha}`);
      }
    }

    const resumen = {
      ingresos: totalIngresos,
      gastos: totalGastos,
    };

    const historial = Object.values(meses).sort((a, b) => {
      const [mesA, añoA] = a.mes.split(' ');
      const [mesB, añoB] = b.mes.split(' ');
      const dateA = new Date(`${mesA} 1, ${añoA}`);
      const dateB = new Date(`${mesB} 1, ${añoB}`);
      return dateA - dateB;
    });

    console.log('📊 Resumen final:', resumen);
    console.log('📈 Historial:', historial);

    return NextResponse.json({ resumen, historial });
  } catch (err) {
    console.error('❌ Error en /api/dashboard/global:', err);
    return NextResponse.json({ error: 'Error al obtener datos del dashboard' }, { status: 500 });
  }
}
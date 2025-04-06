import Gasto from '../../../models/Gastos'; // Ajusta el path si es necesario
import connectDB from '../../../lib/connectDB' // Asumiendo que tienes esta función de conexión a DB




export async function PATCH(req) {
  // Verificamos si el método es PATCH
  if (req.method !== 'PATCH') {
    return new Response('Método no permitido', { status: 405 });
  }

  const { gastoId, cuotaId } = await req.json();  // Obtener los datos del body de la solicitud

  console.log("GASTOID: ", gastoId);
  console.log("CUOTAID: ", cuotaId);

  try {
    // Conectamos a la base de datos
    await connectDB();

    // Buscamos el gasto por su ID
    const gasto = await Gasto.findById(gastoId);
    if (!gasto) {
      return new Response(JSON.stringify({ error: 'Gasto no encontrado' }), { status: 404 });
    }

    // Buscamos la cuota en el array de cuotasPendientes
    const cuota = gasto.cuotasPendientes.id(cuotaId);
    if (!cuota) {
      return new Response(JSON.stringify({ error: 'Cuota no encontrada' }), { status: 404 });
    }

    // Si la cuota ya está pagada, no hacemos nada
    if (cuota.pagada) {
      return new Response(JSON.stringify({ error: 'La cuota ya está pagada' }), { status: 400 });
    }

    // Marcamos la cuota como pagada y asignamos la fecha de pago
    cuota.pagada = true;
    cuota.fechaPago = new Date();

    // Guardamos los cambios en el gasto
    await gasto.save();

    // Retornamos el gasto actualizado
    return new Response(JSON.stringify(gasto), { status: 200 });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Error al procesar la solicitud' }), { status: 500 });
  }
}

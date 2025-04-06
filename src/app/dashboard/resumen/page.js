'use client';
import { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ResumenPage() {
  const [resumen, setResumen] = useState({ gastosSimples: [], cuotasDelMes: [], totalGastos: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResumen = async () => {
      try {
        const res = await fetch('/api/resumen');
        const data = await res.json();
        console.log('resumen : ', data);
        setResumen(data);
      } catch (error) {
        console.error('Error cargando resumen:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchResumen();
  }, []);

  if (loading) return <p className="text-center text-gray-500">Cargando resumen...</p>;

  const handleGeneratePDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Resumen de Servicios', 14, 20);

    doc.setFontSize(12);
    doc.text(`Mes: ${resumen.mes || 'Actual'}`, 14, 30);
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, 14, 38);

    let y = 50;

    if (resumen.gastosSimples.length > 0) {
      autoTable(doc, {
        startY: y,
        head: [['Tipo', 'Concepto', 'Monto']],
        body: resumen.gastosSimples.map(g => ['Gasto Simple', g.concepto, `$${g.valor}`]),
        theme: 'grid'
      });
      y = doc.lastAutoTable.finalY + 10;
    }

    if (resumen.cuotasDelMes.length > 0) {
      autoTable(doc, {
        startY: y,
        head: [['Tipo', 'Concepto', 'Cuota Nº', 'Monto', 'Fecha de Pago']],
        body: resumen.cuotasDelMes.map(c => ['Cuota', c.concepto, c.numero, `$${c.monto}`, new Date(c.fechaPago).toLocaleDateString()]),
        theme: 'grid'
      });
      y = doc.lastAutoTable.finalY + 10;
    }

    doc.setFontSize(14);
    doc.text(`Total de Gastos del Mes: $${resumen.totalGastos}`, 14, y);

    doc.save('resumen-servicio.pdf');
  };

  return (
    <div className="space-y-8">
      <div>
        <button
          onClick={handleGeneratePDF}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Generar PDF del Resumen
        </button>
      </div>

      <section>
        <h2 className="text-xl font-bold text-sky-900 mb-4">Gastos Simples</h2>
        {resumen.gastosSimples.length > 0 ? (
          <ul className="space-y-2 mb-4">
            {resumen.gastosSimples.map((gasto) => (
              <li
                key={gasto._id}
                className="flex justify-between items-center p-3 bg-blue-50 rounded-lg shadow-sm"
              >
                <span>{gasto.concepto}</span>
                <span className="text-red-600 font-semibold">${gasto.valor}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No hay gastos simples este mes.</p>
        )}
      </section>

      <section>
        <h2 className="text-xl font-bold text-sky-900 mb-4">Cuotas del Mes</h2>
        {resumen.cuotasDelMes.length > 0 ? (
          <ul className="space-y-4">
            {resumen.cuotasDelMes.map((cuotaInfo, index) => (
              <li key={index} className="bg-yellow-50 p-4 rounded-xl shadow">
                <h3 className="font-semibold text-yellow-800">{cuotaInfo.concepto}</h3>
                <div className="flex justify-between text-sm text-yellow-700">
                  <span>Cuota {cuotaInfo.numero}</span>
                  <span>${cuotaInfo.monto}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No hay cuotas para este mes.</p>
        )}
      </section>

      <section>
        <h2 className="text-xl font-bold text-sky-900 mb-4">Total de Gastos</h2>
        <p className="text-2xl font-bold text-green-700">${resumen.totalGastos}</p>
      </section>
    </div>
  );
}

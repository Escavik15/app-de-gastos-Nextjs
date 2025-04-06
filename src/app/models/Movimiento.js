import mongoose from 'mongoose';

const MovimientoSchema = new mongoose.Schema({
  tipo: { type: String, enum: ['ingreso', 'gasto'], required: true },
  monto: { type: Number, required: true },
  fecha: { type: Date, required: true },
});

const Movimiento = mongoose.models.Movimiento || mongoose.model('Movimiento', MovimientoSchema);

export default Movimiento;
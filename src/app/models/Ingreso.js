import mongoose from 'mongoose';

const ingresoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  descripcion: {
    type: String,
    required: true
  },
  valor: {
    type: Number,
    required: true
  },
  fecha: {
    type: Date,
    required: true
  }
}, { timestamps: true });

export default mongoose.models.Ingreso || mongoose.model('Ingreso', ingresoSchema);
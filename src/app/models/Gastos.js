import mongoose from "mongoose";


const CuotaSchema = new mongoose.Schema({
    numero: {
        type: Number,
        required: true,
    },
    monto: {
        type: Number,
        required: true,
    },
    pagada: {
        type: Boolean,
        default: false,
    },
    fechaPago: {
        type: Date,
        default: null,
    }
});



const gastosSchema = new mongoose.Schema({
    concepto: {
        type: String,
        required: true,
        
    },
    cuotas: {
        type: Number,
        required: true,
        min: 0, 
    },
    cuotasPendientes: [CuotaSchema], // Lista de cuotas individuales
    valor: {
        type: Number,
        required: true,
        min: 0,
    },
    deudaTotal: {
        type: Number,
    },
    deudaRestante: {
        type: Number,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',  
        required: true,
      },
    fecha: {
        type: Date,
        default: Date.now,
    },
    pagada:{
        type: Boolean,
        default: false
    }
    });
// Verifica si el modelo ya existe antes de crearlo
const Gasto = mongoose.models.Gasto || mongoose.model('Gasto', gastosSchema);

export default  Gasto
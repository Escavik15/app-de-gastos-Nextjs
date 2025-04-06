import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    trim: true,
    required: true,
  },
 
  telefono: {
    type: Number,
    trim: true,
    required: true,
  },
  email: {
    type: String,
    required: true,
    match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
 
}, {
  timestamps: true // Esto agrega createdAt y updatedAt automáticamente
});

// Verifica si el modelo ya existe antes de crearlo
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
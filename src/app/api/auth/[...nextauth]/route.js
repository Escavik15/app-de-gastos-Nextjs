import NextAuth from 'next-auth';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import clientPromise from '../../../lib/mongodb';
import CredentialsProvider from 'next-auth/providers/credentials';
import {compareSync} from 'bcryptjs';

export const authOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // 1. Conectar a MongoDB
        const client = await clientPromise;
        const db = client.db(); // Nombre de tu DB (si no es el default)
        const usersCollection = db.collection('users');

        // 2. Buscar usuario
        const user = await usersCollection.findOne({ 
          email: credentials.email 
        });

        // 3. Verificar contraseña (si usas bcrypt)
        if (user && compareSync(credentials.password, user.password)) {
          return {
            id: user._id.toString(),
            name: user.username,
            email: user.email,
            role: user.role // Si tienes roles
          };
        }
        return null;
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role; // Agregar datos adicionales al token
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub;
        session.user.role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/auth/error'
  },
  secret: process.env.NEXTAUTH_SECRET
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
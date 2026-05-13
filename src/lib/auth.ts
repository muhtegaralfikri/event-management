import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { getPrisma } from "./prisma";
import { verifyPassword } from "./password";
import { UserRole } from "@/generated/prisma/enums";

const googleClientId = process.env.AUTH_GOOGLE_ID?.trim();
const googleClientSecret = process.env.AUTH_GOOGLE_SECRET?.trim();

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(getPrisma()),
  session: { strategy: "jwt" },
  providers: [
    ...(googleClientId && googleClientSecret
      ? [
          GoogleProvider({
            clientId: googleClientId,
            clientSecret: googleClientSecret,
            profile(profile) {
              return {
                id: profile.sub,
                name: profile.name,
                email: profile.email,
                image: profile.picture,
                role: UserRole.ORGANIZER,
              };
            },
          }),
        ]
      : []),
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const prisma = getPrisma();
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await verifyPassword(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        const role =
          user.role === UserRole.ATTENDEE
            ? (
                await getPrisma().user.update({
                  where: { id: user.id },
                  data: { role: UserRole.ORGANIZER },
                  select: { role: true },
                })
              ).role
            : user.role;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }

      if (!user && token.id && token.role === UserRole.ATTENDEE) {
        const existingUser = await getPrisma().user.findUnique({
          where: { id: token.id as string },
          select: { password: true, role: true },
        });

        if (existingUser?.password) {
          const updatedUser = await getPrisma().user.update({
            where: { id: token.id as string },
            data: { role: UserRole.ORGANIZER },
            select: { role: true },
          });

          token.role = updatedUser.role;
        } else if (existingUser?.role) {
          token.role = existingUser.role;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as UserRole;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});

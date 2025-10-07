import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'

// Export authOptions so server code (getServerSession) can import the same config
export const authOptions = {
  providers: [
    // Google for regular user authentication
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    // Credentials provider used only for admin login (loginType: 'admin')
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
          // credentials.loginType should be either 'admin' or 'user'
          const type = credentials?.loginType || 'user'

          // Admin authentication: only allow when correct admin creds provided
          if (type === 'admin') {
            if (credentials?.username === 'admin' && credentials?.password === process.env.ADMIN_PASSWORD) {
              return {
                id: '1',
                name: 'Admin',
                email: 'admin@nyxora.ro',
                role: 'admin'
              }
            }
            return null
          }

          // User authentication: demo fallback - accept any non-empty username.
          // In production, replace this with a proper user lookup.
          if (type === 'user') {
            const username = credentials?.username;
            if (username && username.trim()) {
              return {
                id: `user:${username}`,
                name: username,
                email: `${username}@example.com`,
                role: 'user'
              }
            }
          }

          return null
        }
    })
  ],
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      // On first sign-in, `user` will be present. Default role to 'user' for OAuth logins.
      if (user) {
        token.role = user.role ?? 'user'
      }
      return token
    },
    async session({ session, token }) {
      // Ensure session always exposes a role (default to 'user')
      if (token) {
        session.user.role = token.role ?? 'user'
      } else {
        session.user.role = session.user?.role ?? 'user'
      }
      return session
    },
    async signIn({ user, account, profile, email, credentials }) {
      return true
    },
    async redirect({ url, baseUrl }) {
      // Redirect to admin after successful login
      if (url.startsWith('/')) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return `${baseUrl}/admin`
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
import 'next-auth';
import 'next-auth/jwt';

// Declare and extend the built-in modules
declare module 'next-auth' {
  /**
   * Extends the built-in session.user type to include id and role.
   */
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession['user']; // Keep the default properties like name, email, image
  }

  /**
   * Extends the built-in user model to include the role.
   * This is used when a new user is created or updated.
   */
  interface User {
    role: string;
  }
}

declare module 'next-auth/jwt' {
  /** Extends the JWT token to include id and role */
  interface JWT {
    id: string;
    role: string;
  }
}
import type { User } from "../../drizzle/schema";
import { supabaseServer } from "../supabaseServer";

export type TrpcContext = {
  req: any;
  res: any;
  user: User | null;
  userId: string | null;
};

export async function createContext(opts: { req: any; res: any }): Promise<TrpcContext> {
  let user: User | null = null;
  let userId: string | null = null;

  try {
    // Extract authorization header
    const authHeader = opts.req.headers?.authorization || opts.req.headers?.Authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      // Verify the JWT token with Supabase
      const { data: { user: authUser }, error } = await supabaseServer.auth.getUser(token);
      
      if (!error && authUser) {
        userId = authUser.id;
        
        // Fetch user from our users table
        const { data: userData } = await supabaseServer
          .from('users')
          .select('*')
          .eq('open_id', authUser.id)
          .single();
        
        if (userData) {
          user = userData as User;
        }
      }
    }
  } catch (error) {
    console.error('Auth error:', error);
    user = null;
    userId = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
    userId,
  };
}

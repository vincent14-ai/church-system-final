import supabase from "../config/db.js"; // your Supabase client
import bcrypt from "bcryptjs";
import { generateToken } from "../config/jwt.js";

export async function loginUser(email, password) {
  // Fetch user by email
  const { data: users, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .limit(1)
    .single(); // get single record directly

  if (error || !users) return null;

  const user = users;

  // Validate password
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) return null;

  // Generate JWT using your config utility
  const token = generateToken(user.id);

  // Return both user info and token
  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    token,
  };
}

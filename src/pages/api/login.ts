import type { APIRoute } from 'astro';
import { supabaseAdmin } from '../../lib/supabase';
import { createSessionToken } from '../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return new Response(
        JSON.stringify({ error: 'Usuario y contraseña son obligatorios.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('username, password')
      .eq('username', username)
      .maybeSingle();

    if (error) {
      console.error('[login] Error al consultar usuarios:', error);
      return new Response(
        JSON.stringify({ error: 'Error interno del servidor.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!user || user.password !== password) {
      return new Response(
        JSON.stringify({ error: 'Usuario o contraseña incorrectos.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const token = createSessionToken();

    cookies.set('session', token, {
      path: '/',
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
    });

    return new Response(
      JSON.stringify({ message: 'Inicio de sesión correcto.' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('[login] Error inesperado:', err);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

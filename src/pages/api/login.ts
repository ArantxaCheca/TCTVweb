import type { APIRoute } from 'astro';
import { createSessionToken } from '../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const { usuario, contrasena } = body;

    const adminUser = import.meta.env.ADMIN_USER;
    const adminPassword = import.meta.env.ADMIN_PASSWORD;

    if (!adminUser || !adminPassword) {
      return new Response(
        JSON.stringify({ error: 'Error de configuración del servidor.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (usuario !== adminUser || contrasena !== adminPassword) {
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
  } catch {
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

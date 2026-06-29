import type { APIRoute } from 'astro';
import { supabaseAdmin } from '../../lib/supabase';
import { verifySessionToken } from '../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const session = cookies.get('session');
    if (!session || !session.value || !verifySessionToken(session.value)) {
      return new Response(
        JSON.stringify({ error: 'No autorizado.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { email, currentPassword, newPassword, confirmPassword } = await request.json();

    if (!email || !currentPassword || !newPassword || !confirmPassword) {
      return new Response(
        JSON.stringify({ error: 'Todos los campos son obligatorios.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (newPassword.length < 8) {
      return new Response(
        JSON.stringify({ error: 'La nueva contraseña debe tener al menos 8 caracteres.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (newPassword !== confirmPassword) {
      return new Response(
        JSON.stringify({ error: 'Las nuevas contraseñas no coinciden.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('email, password')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      console.error('[change-password] Error al consultar usuarios:', error);
      return new Response(
        JSON.stringify({ error: 'Error interno del servidor.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'El email no existe.' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (user.password !== currentPassword) {
      return new Response(
        JSON.stringify({ error: 'La contraseña actual no es correcta.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ password: newPassword })
      .eq('email', email);

    if (updateError) {
      console.error('[change-password] Error al actualizar contraseña:', updateError);
      return new Response(
        JSON.stringify({ error: 'Error al actualizar la contraseña.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ message: 'Contraseña actualizada correctamente.' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('[change-password] Error inesperado:', err);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

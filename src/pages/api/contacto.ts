import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    const nombre = String(body.nombre || '').trim();
    const email = String(body.email || '').trim();
    const telefono = String(body.telefono || '').trim();
    const tipoVehiculo = String(body.tipo_vehiculo || '').trim();
    const vehiculoDescripcion = String(body.vehiculo_descripcion || '').trim();

    if (!nombre || !email || !telefono || !tipoVehiculo || !vehiculoDescripcion) {
      return new Response(
        JSON.stringify({ error: 'Todos los campos son obligatorios.' }),
        { status: 400 }
      );
    }

    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!emailValido) {
      return new Response(
        JSON.stringify({ error: 'Introduce un correo electrónico válido.' }),
        { status: 400 }
      );
    }

    const { error } = await supabase.from('leads').insert({
      nombre,
      email,
      telefono,
      tipo_vehiculo: tipoVehiculo,
      vehiculo_descripcion: vehiculoDescripcion,
    });

    if (error) {
  console.error('Error de Supabase:', error);

  return new Response(
    JSON.stringify({ error: error.message }),
    { status: 500 }
  );
}

    return new Response(
      JSON.stringify({ message: 'Solicitud recibida correctamente.' }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor.' }),
      { status: 500 }
    );
  }
};
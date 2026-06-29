import type { APIRoute } from 'astro';
import { supabaseAdmin } from '../../lib/supabase';
import { verifySessionToken } from '../../lib/auth';
import * as XLSX from 'xlsx';

export const prerender = false;

export const GET: APIRoute = async ({ cookies }) => {
  try {
    const session = cookies.get('session');
    if (!session || !session.value || !verifySessionToken(session.value)) {
      return new Response(
        JSON.stringify({ error: 'No autorizado.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('[export-leads] Consultando Supabase...');
    const { data, error } = await supabaseAdmin
      .from('leads')
      .select('created_at, nombre, email, telefono, tipo_vehiculo, vehiculo_descripcion, estado, observaciones')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[export-leads] Error leyendo leads:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('[export-leads] Leads encontrados:', data);

    const headerRow = {
      Fecha: 'Fecha',
      Nombre: 'Nombre',
      Email: 'Email',
      Teléfono: 'Teléfono',
      'Tipo de vehículo': 'Tipo de vehículo',
      'Descripción': 'Descripción',
      Estado: 'Estado',
      Observaciones: 'Observaciones',
    };

    let rows: Record<string, string>[];

    if (!data || data.length === 0) {
      rows = [headerRow, {
        Fecha: '',
        Nombre: 'No hay leads registrados',
        Email: '',
        Teléfono: '',
        'Tipo de vehículo': '',
        Descripción: '',
        Estado: '',
        Observaciones: '',
      }];
    } else {
      rows = [headerRow, ...data.map((lead: Record<string, unknown>) => ({
        Fecha: lead.created_at
          ? new Date(lead.created_at as string).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })
          : '',
        Nombre: String(lead.nombre ?? ''),
        Email: String(lead.email ?? ''),
        Teléfono: String(lead.telefono ?? ''),
        'Tipo de vehículo': String(lead.tipo_vehiculo ?? ''),
        Descripción: String(lead.vehiculo_descripcion ?? ''),
        Estado: String(lead.estado ?? ''),
        Observaciones: String(lead.observaciones ?? ''),
      }))];
    }

    const worksheet = XLSX.utils.json_to_sheet(rows, { skipHeader: true });

    worksheet['!cols'] = [
      { wch: 18 },
      { wch: 25 },
      { wch: 30 },
      { wch: 15 },
      { wch: 20 },
      { wch: 40 },
      { wch: 15 },
      { wch: 30 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    console.log('[export-leads] Excel generado, tamaño:', buffer.byteLength, 'bytes');

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="historial-leads.xlsx"',
      },
    });
  } catch (err) {
    console.error('[export-leads] Error inesperado:', err);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

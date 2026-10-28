'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function agregarNino(data: { nombres: string; apellidos: string; codigo_secreto: string }) {
    const supabase = await createClient()
    const { error } = await supabase.from('ninos').insert({
        nombres: data.nombres,
        apellidos: data.apellidos,
        codigo_secreto: data.codigo_secreto.toUpperCase(),
    })
    if (error) return { exito: false, mensaje: error.message }
    revalidatePath('/dashboard/ninos')
    return { exito: true, mensaje: 'Niño agregado' }
}

export async function toggleActivoNino(id: string, activo: boolean) {
    const supabase = await createClient()
    const { error } = await supabase.from('ninos').update({ activo }).eq('id', id)
    if (error) return { exito: false, mensaje: error.message }
    revalidatePath('/dashboard/ninos')
    return { exito: true, mensaje: 'Estado actualizado' }
}

export async function editarNino(id: string, data: { nombres: string; apellidos: string; codigo_secreto: string }) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('ninos')
        .update({
            nombres: data.nombres,
            apellidos: data.apellidos,
            codigo_secreto: data.codigo_secreto.toUpperCase(),
        })
        .eq('id', id)

    if (error) return { exito: false, mensaje: error.message }
    revalidatePath('/dashboard/ninos')
    return { exito: true, mensaje: 'Niño actualizado correctamente' }
}
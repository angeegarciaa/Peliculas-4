
const clienteSeries = window.supabaseClient;

const formSerie = document.getElementById('form-serie');

// COMPROBAR CONEXIÓN
if (!clienteSeries) {
    alert('No se pudo conectar con Supabase.');
}

// PUBLICAR UNA SERIE Y SUBIR SU IMAGEN
if (formSerie && clienteSeries) {
    formSerie.addEventListener('submit', async (e) => {
        e.preventDefault();

        try {
            const { data: usuarioData, error: usuarioError } =
                await clienteSeries.auth.getUser();

            if (usuarioError || !usuarioData.user) {
                alert('Tenés que iniciar sesión para publicar una serie.');
                window.location.href = 'login.html';
                return;
            }

            const usuario = usuarioData.user;
            const archivo = document.getElementById('imagen').files[0];

            if (!archivo) {
                alert('Tenés que seleccionar una imagen.');
                return;
            }

            if (!archivo.type.startsWith('image/')) {
                alert('El archivo debe ser una imagen.');
                return;
            }

            const nombreArchivo = archivo.name.replace(
                /[^a-zA-Z0-9._-]/g,
                '_'
            );

            const rutaImagen =
                usuario.id + '/' + Date.now() + '_' + nombreArchivo;

            // SUBIR IMAGEN A STORAGE
            const { error: errorImagen } = await clienteSeries
                .storage
                .from('portadas')
                .upload(rutaImagen, archivo, {
                    contentType: archivo.type,
                    upsert: false
                });

            if (errorImagen) {
                alert('Error al subir la imagen: ' + errorImagen.message);
                return;
            }

            // OBTENER URL PÚBLICA
            const { data: imagenData } = clienteSeries
                .storage
                .from('portadas')
                .getPublicUrl(rutaImagen);

            // PREPARAR DATOS DE LA SERIE
            const nuevaSerie = {
                titulo: document.getElementById('titulo').value,
                genero: document.getElementById('genero').value,
                plataforma: document.getElementById('plataforma').value,
                temporadas: parseInt(
                    document.getElementById('temporadas').value
                ),
                puntuacion: parseFloat(
                    document.getElementById('puntuacion').value
                ),
                resena: document.getElementById('resena').value,
                url: imagenData.publicUrl,
                user_id: usuario.id
            };

            // GUARDAR EN LA BASE DE DATOS
            const { error } = await clienteSeries
                .from('peliculas')
                .insert([nuevaSerie]);

            if (error) {
                alert('Error al guardar la serie: ' + error.message);
                return;
            }

            alert('¡Serie e imagen guardadas correctamente!');

            formSerie.reset();

            if (window.cargarSeries) {
                await window.cargarSeries();
            }

        } catch (error) {
            alert('Ocurrió un error: ' + error.message);
        }
    });
}

// EDITAR UNA SERIE
window.editarSerie = async function (serie) {
    const titulo = prompt('Título:', serie.titulo);
    if (titulo === null) return;

    const genero = prompt('Género:', serie.genero);
    if (genero === null) return;

    const plataforma = prompt('Plataforma:', serie.plataforma);
    if (plataforma === null) return;

    const temporadas = prompt(
        'Cantidad de temporadas:',
        serie.temporadas
    );
    if (temporadas === null) return;

    const puntuacion = prompt(
        'Puntuación del 1 al 10:',
        serie.puntuacion
    );
    if (puntuacion === null) return;

    const resena = prompt('Reseña:', serie.resena);
    if (resena === null) return;

    if (
        !titulo.trim() ||
        !genero.trim() ||
        !plataforma.trim() ||
        !resena.trim() ||
        !Number.isInteger(Number(temporadas)) ||
        Number(temporadas) < 1 ||
        isNaN(Number(puntuacion)) ||
        Number(puntuacion) < 1 ||
        Number(puntuacion) > 10
    ) {
        alert('Revisá los datos ingresados.');
        return;
    }

    const { error } = await clienteSeries
        .from('peliculas')
        .update({
            titulo: titulo.trim(),
            genero: genero.trim(),
            plataforma: plataforma.trim(),
            temporadas: Number(temporadas),
            puntuacion: Number(puntuacion),
            resena: resena.trim()
        })
        .eq('id', serie.id);

    if (error) {
        alert('Error al editar: ' + error.message);
        return;
    }

    alert('¡Serie editada correctamente!');

    if (window.cargarSeries) {
        await window.cargarSeries();
    }
};

// ELIMINAR UNA SERIE
window.eliminarSerie = async function (id) {
    const confirmar = confirm(
        '¿Seguro que querés eliminar esta serie?'
    );

    if (!confirmar) return;

    const { error } = await clienteSeries
        .from('peliculas')
        .delete()
        .eq('id', id);

    if (error) {
        alert('Error al eliminar: ' + error.message);
        return;
    }

    alert('¡Serie eliminada correctamente!');

    if (window.cargarSeries) {
        await window.cargarSeries();
    }
};

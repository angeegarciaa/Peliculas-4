
const clienteMain = window.supabaseClient;
const listaSeriesMain = document.getElementById('lista-series');

let usuarioActualId = null;

// CARGAR CATÁLOGO
window.cargarSeries = async function () {
    if (!clienteMain || !listaSeriesMain) return;

    // OBTENER USUARIO ACTUAL
    const { data: usuarioData, error: errorUsuario } =
        await clienteMain.auth.getUser();

    if (errorUsuario) {
        console.error('Error al obtener usuario:', errorUsuario);
    }

    usuarioActualId = usuarioData?.user?.id || null;

    // MOSTRAR U OCULTAR FORMULARIO
    const seccionFormulario = document.getElementById('seccion-formulario');

    if (seccionFormulario) {
        seccionFormulario.style.display =
            usuarioActualId ? 'block' : 'none';
    }

    // OBTENER SERIES
    const { data: series, error } = await clienteMain
        .from('peliculas')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        listaSeriesMain.innerHTML = '<p>Error al cargar las series.</p>';
        console.error(error);
        return;
    }

    // OBTENER COMENTARIOS
    const { data: comentarios, error: errorComentarios } =
        await clienteMain
            .from('comentarios')
            .select('*')
            .order('created_at', { ascending: true });

    if (errorComentarios) {
        console.error('Error al cargar comentarios:', errorComentarios);
    }

    listaSeriesMain.innerHTML = '';

    if (!series || series.length === 0) {
        listaSeriesMain.innerHTML =
            '<p>Todavía no hay series publicadas.</p>';
        return;
    }

    // MOSTRAR SERIES
    series.forEach((serie) => {
        const tarjeta = document.createElement('div');
        tarjeta.className = 'tarjeta-serie';

        const imagen = document.createElement('img');
        imagen.src = serie.url;
        imagen.alt = 'Portada de ' + serie.titulo;
        imagen.className = 'imagen-serie';

        const titulo = document.createElement('h2');
        titulo.textContent = serie.titulo;

        const genero = document.createElement('p');
        genero.textContent = 'Género: ' + serie.genero;

        const plataforma = document.createElement('p');
        plataforma.textContent = 'Plataforma: ' + serie.plataforma;

        const temporadas = document.createElement('p');
        temporadas.textContent = 'Temporadas: ' + serie.temporadas;

        const puntuacion = document.createElement('p');
        puntuacion.textContent = 'Puntuación: ' + serie.puntuacion + '/10';

        const resena = document.createElement('p');
        resena.textContent = 'Reseña: ' + serie.resena;

        tarjeta.append(
            imagen,
            titulo,
            genero,
            plataforma,
            temporadas,
            puntuacion,
            resena
        );

        // BOTONES DE EDICIÓN Y ELIMINACIÓN
        if (usuarioActualId && serie.user_id === usuarioActualId) {
            const botonEditar = document.createElement('button');
            botonEditar.textContent = 'Editar';

            botonEditar.addEventListener('click', () => {
                window.editarSerie(serie);
            });

            const botonEliminar = document.createElement('button');
            botonEliminar.textContent = 'Eliminar';

            botonEliminar.addEventListener('click', () => {
                window.eliminarSerie(serie.id);
            });

            tarjeta.append(botonEditar, botonEliminar);
        }

        // COMENTARIOS
        const tituloComentarios = document.createElement('h3');
        tituloComentarios.textContent = 'Comentarios';

        tarjeta.appendChild(tituloComentarios);

        const comentariosSerie = (comentarios || []).filter(
            comentario => Number(comentario.pelicula_id) === Number(serie.id)
        );

        comentariosSerie.forEach((comentario) => {
            const textoComentario = document.createElement('p');
            textoComentario.textContent = comentario.contenido;
            tarjeta.appendChild(textoComentario);
        });

        // PUBLICAR COMENTARIOS
        if (usuarioActualId) {
            const formularioComentario = document.createElement('form');

            const campoComentario = document.createElement('textarea');
            campoComentario.placeholder = 'Escribí tu comentario...';
            campoComentario.required = true;

            const botonComentario = document.createElement('button');
            botonComentario.type = 'submit';
            botonComentario.textContent = 'Publicar comentario';

            formularioComentario.append(
                campoComentario,
                botonComentario
            );

            formularioComentario.addEventListener('submit', async (e) => {
                e.preventDefault();

                const contenido = campoComentario.value.trim();

                if (!contenido) return;

                const { error } = await clienteMain
                    .from('comentarios')
                    .insert([{
                        pelicula_id: serie.id,
                        user_id: usuarioActualId,
                        contenido: contenido
                    }]);

                if (error) {
                    alert('Error al publicar comentario: ' + error.message);
                    return;
                }

                await window.cargarSeries();
            });

            tarjeta.appendChild(formularioComentario);

        } else {
            const aviso = document.createElement('p');
            aviso.textContent =
                'Iniciá sesión para publicar un comentario.';
            tarjeta.appendChild(aviso);
        }

        listaSeriesMain.appendChild(tarjeta);
    });
};

// CARGAR CATÁLOGO AL ABRIR LA PÁGINA
if (listaSeriesMain) {
    window.cargarSeries();
}


const cliente = window.supabaseClient;

// REGISTRO
const formularioRegistro = document.getElementById('form-registro');

if (formularioRegistro) {
    formularioRegistro.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!cliente) {
            alert('No se pudo conectar con Supabase.');
            return;
        }

        const email = document.getElementById('email-registro').value;
        const password = document.getElementById('password-registro').value;

        try {
            const { data, error } = await cliente.auth.signUp({
                email,
                password
            });

            if (error) {
                alert('Error al registrarse: ' + error.message);
                return;
            }

            alert('Registro realizado correctamente.');

            if (data.session) {
                window.location.href = 'catalogo.html';
            } else {
                alert('Ya podés iniciar sesión.');
                window.location.href = 'login.html';
            }

        } catch (error) {
            alert('Error de conexión: ' + error.message);
        }
    });
}

// INICIO DE SESIÓN
const formularioLogin = document.getElementById('form-login');

if (formularioLogin) {
    formularioLogin.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!cliente) {
            alert('No se pudo conectar con Supabase.');
            return;
        }

        const email = document.getElementById('email-login').value;
        const password = document.getElementById('password-login').value;

        try {
            const { error } = await cliente.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                alert('Error al iniciar sesión: ' + error.message);
                return;
            }

            window.location.href = 'catalogo.html';

        } catch (error) {
            alert('Error de conexión: ' + error.message);
        }
    });
}

// CERRAR SESIÓN
const botonCerrar = document.getElementById('cerrar-sesion');

if (botonCerrar) {
    botonCerrar.addEventListener('click', async () => {
        if (!cliente) {
            alert('No se pudo conectar con Supabase.');
            return;
        }

        const { error } = await cliente.auth.signOut();

        if (error) {
            alert('Error al cerrar sesión: ' + error.message);
            return;
        }

        window.location.href = 'index.html';
    });
}

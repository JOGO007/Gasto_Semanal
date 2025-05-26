// Selectores
const formulario = document.querySelector('#agregar-gasto');
const listaGastos = document.querySelector('#gastos ul');

// Variables globales
let presupuesto;

// Eventos
document.addEventListener('DOMContentLoaded', solicitarPresupuesto);
formulario.addEventListener('submit', agregarGasto);

// Clases
class Presupuesto {
    constructor(monto) {
        this.presupuestoInicial = Number(monto);
        this.presupuestoDisponible = Number(monto);
        this.gastos = [];
    }

    agregarGasto(gasto) {
        this.gastos = [...this.gastos, gasto];
        this.calcularRestante();
    }

    calcularRestante() {
        const totalGastado = this.gastos.reduce((total, gasto) => total + gasto.monto, 0);
        this.presupuestoDisponible = this.presupuestoInicial - totalGastado;
    }

    eliminarGasto(id) {
        this.gastos = this.gastos.filter(gasto => gasto.id !== id);
        this.calcularRestante();
    }
}

class UI {
    mostrarPresupuesto({ presupuestoInicial, presupuestoDisponible }) {
        document.querySelector('#total').textContent = presupuestoInicial;
        document.querySelector('#restante').textContent = presupuestoDisponible;
    }

    mostrarAlerta(mensaje, tipo) {
        const divMensaje = document.createElement('div');
        divMensaje.classList.add('text-center', 'alert', tipo === 'error' ? 'alert-danger' : 'alert-success');
        divMensaje.textContent = mensaje;

        document.querySelector('.primario').insertBefore(divMensaje, formulario);

        setTimeout(() => divMensaje.remove(), 3000);
    }

    mostrarGastos(gastos) {
        this.limpiarHTML();

        gastos.forEach(({ nombre, monto, id }) => {
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center';
            li.dataset.id = id;
            li.innerHTML = `${nombre} <span class="badge badge-primary badge-pill">$ ${monto}</span>`;

            const btnBorrar = document.createElement('button');
            btnBorrar.classList.add('btn', 'btn-danger', 'borrar-gasto');
            btnBorrar.innerHTML = 'Borrar &times;';
            btnBorrar.onclick = () => eliminarGasto(id);

            li.appendChild(btnBorrar);
            listaGastos.appendChild(li);
        });
    }

    limpiarHTML() {
        while (listaGastos.firstChild) {
            listaGastos.removeChild(listaGastos.firstChild);
        }
    }

    actualizarRestante(restante) {
        document.querySelector('#restante').textContent = restante;
    }

    comprobarPresupuesto({ presupuestoInicial, presupuestoDisponible }) {
        const restanteUI = document.querySelector('.restante');

        if (presupuestoDisponible <= presupuestoInicial / 4) {
            restanteUI.className = 'restante alert alert-danger';
        } else if (presupuestoDisponible <= presupuestoInicial / 2) {
            restanteUI.className = 'restante alert alert-warning';
        } else {
            restanteUI.className = 'restante alert alert-success';
        }

        if (presupuestoDisponible <= 0) {
            this.mostrarAlerta('El presupuesto se ha agotado', 'error');
            formulario.querySelector('button[type="submit"]').disabled = true;
        }
    }
}

const ui = new UI();

// Funciones
function solicitarPresupuesto() {
    const ingreso = prompt('¿Cuál es tu presupuesto semanal?');

    if (!ingreso || isNaN(ingreso) || ingreso <= 0) {
        window.location.reload();
    }

    presupuesto = new Presupuesto(ingreso);
    ui.mostrarPresupuesto(presupuesto);
}

function agregarGasto(e) {
    e.preventDefault();

    const nombre = document.querySelector('#gasto').value.trim();
    const monto = Number(document.querySelector('#cantidad').value.trim());

    if (nombre === '' || monto === '') {
        ui.mostrarAlerta('Ambos campos son obligatorios', 'error');
        return;
    }

    if (monto <= 0 || isNaN(monto)) {
        ui.mostrarAlerta('El monto no es válido', 'error');
        return;
    }

    const gasto = { nombre, monto, id: Date.now() };
    presupuesto.agregarGasto(gasto);
    ui.mostrarAlerta('Gasto agregado correctamente', 'success');

    const { gastos, presupuestoDisponible } = presupuesto;
    ui.mostrarGastos(gastos);
    ui.actualizarRestante(presupuestoDisponible);
    ui.comprobarPresupuesto(presupuesto);

    formulario.reset();
}

function eliminarGasto(id) {
    presupuesto.eliminarGasto(id);

    const { gastos, presupuestoDisponible } = presupuesto;
    ui.mostrarGastos(gastos);
    ui.actualizarRestante(presupuestoDisponible);
    ui.comprobarPresupuesto(presupuesto);
}

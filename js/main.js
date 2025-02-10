let listaSupermercado = [];

function agregarProducto() {
    let producto = prompt("Ingrese el nombre del producto:");
    if (producto) {
        listaSupermercado.push(producto);
        alert(`"${producto}" fue agregado a la lista.`);
    } else {
        alert("Debe ingresar un producto válido.");
    }
}

function eliminarProducto() {
    let producto = prompt("Ingrese el nombre del producto a eliminar:");
    let index = listaSupermercado.indexOf(producto);
    if (index !== -1) {
        listaSupermercado.splice(index, 1);
        alert(`"${producto}" fue eliminado de la lista.`);
    } else {
        alert("El producto no se encuentra en la lista.");
    }
}

function mostrarLista() {
    if (listaSupermercado.length === 0) {
        alert("La lista de supermercado está vacía.");
    } else {
        alert("Lista de Supermercado:\n" + listaSupermercado.join("\n"));
    }
}

function menuLista() {
    let opcion;
    do {
        opcion = prompt("Lista de Supermercado\n1 Agregar Producto\n2 Eliminar Producto\n3 Mostrar Lista\n4 Salir\nSeleccione una opción:");
        if (opcion === "1") agregarProducto();
        else if (opcion === "2") eliminarProducto();
        else if (opcion === "3") mostrarLista();
        else if (opcion !== "4") alert("Opción no válida. Intente de nuevo.");
    } while (opcion !== "4");
    alert("Gracias por usar la lista de supermercado.");
}

menuLista();
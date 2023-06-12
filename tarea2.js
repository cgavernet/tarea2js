/*
En el archivo tarea2.js podemos encontrar un código de un supermercado que vende productos.
El código contiene
    - una clase Producto que representa un producto que vende el super
    - una clase Carrito que representa el carrito de compras de un cliente
    - una clase ProductoEnCarrito que representa un producto que se agrego al carrito
    - una función findProductBySku que simula una base de datos y busca un producto por su sku
El código tiene errores y varias cosas para mejorar / agregar
​
Ejercicios
1) Arreglar errores existentes en el código
  x a) Al ejecutar agregarProducto 2 veces con los mismos valores debería agregar 1 solo producto con la suma de las cantidades.
  x b) Al ejecutar agregarProducto debería actualizar la lista de categorías solamente si la categoría no estaba en la lista.
  x c) Si intento agregar un producto que no existe debería mostrar un mensaje de error.
​
2) Agregar la función eliminarProducto a la clase Carrito
  x a) La función eliminarProducto recibe un sku y una cantidad (debe devolver una promesa)
  x b) Si la cantidad es menor a la cantidad de ese producto en el carrito, se debe restar esa cantidad al producto
  x c) Si la cantidad es mayor o igual a la cantidad de ese producto en el carrito, se debe eliminar el producto del carrito
  x d) Si el producto no existe en el carrito, se debe mostrar un mensaje de error
  x e) La función debe retornar una promesa
​
3) Utilizar la función eliminarProducto utilizando .then() y .catch()
​   :-(
*/


// Cada producto que vende el super es creado con esta clase
class Producto {
    sku;            // Identificador único del producto
    nombre;         // Su nombre
    categoria;      // Categoría a la que pertenece este producto
    precio;         // Su precio
    stock;          // Cantidad disponible en stock

    constructor(sku, nombre, precio, categoria, stock) {
        this.sku = sku;
        this.nombre = nombre;
        this.categoria = categoria;
        this.precio = precio;

        // Si no me definen stock, pongo 10 por default
        if (stock) {
            this.stock = stock;
        } else {
            this.stock = 10;
        }
    }
}


// Creo todos los productos que vende mi super
const queso = new Producto('KS944RUR', 'Queso', 10, 'lacteos', 4);
const gaseosa = new Producto('FN312PPE', 'Gaseosa', 5, 'bebidas');
const cerveza = new Producto('PV332MJ', 'Cerveza', 20, 'bebidas');
const arroz = new Producto('XX92LKI', 'Arroz', 7, 'alimentos', 20);
const fideos = new Producto('UI999TY', 'Fideos', 5, 'alimentos');
const lavandina = new Producto('RT324GD', 'Lavandina', 9, 'limpieza');
const shampoo = new Producto('OL883YE', 'Shampoo', 3, 'higiene', 50);
const jabon = new Producto('WE328NJ', 'Jabon', 4, 'higiene', 3);

// Genero un listado de productos. Simulando base de datos
const productosDelSuper = [queso, gaseosa, cerveza, arroz, fideos, lavandina, shampoo, jabon];

// Cada cliente que venga a mi super va a crear un carrito
class Carrito {
    productos;      // Lista de productos agregados
    categorias;     // Lista de las diferentes categorías de los productos en el carrito
    precioTotal;    // Lo que voy a pagar al finalizar mi compra

    // Al crear un carrito, empieza vació
    constructor() {
        this.precioTotal = 0;
        this.productos = [];
        this.categorias = [];
    }

    /**
     * función que agrega @{cantidad} de productos con @{sku} al carrito
     */
    async agregarProducto(sku, cantidad) {
        console.log(`Agregando ${cantidad} ${sku}`);
        try{
            // Busco el producto en la "base de datos"
            const producto = await this.findProductBySku(sku);
            console.log(`Producto ${producto.nombre} encontrado con ${producto.stock} unidades`);
            //Verifico si el styock es suficiente
            if (cantidad <= producto.stock){ 
                //Verifico si el producto ya fué cargado al carrito
                const productoEnCarrito = this.productos.find(product => product.sku === sku);
                if (productoEnCarrito) {
                    //Actualizo el valor de la cantidad de unidades
                    productoEnCarrito.cantidad += cantidad;
                } else{
                    // Creo un producto nuevo
                    const nuevoProducto = new ProductoEnCarrito(sku, producto.nombre, cantidad);
                    this.productos.push(nuevoProducto);
                    // Compruebo si existe la categoria, sino la ingreso
                    // const existeCategoria = this.categorias.includes(producto.categoria);
                    // if (!existeCategoria) {this.categorias.push(producto.categoria);}
                    this.agregarCategoria(producto.categoria);
                }
                //Actualizo el importe total del carrito con el producto ingresado
                this.precioTotal += producto.precio * cantidad;
                //Actualizao el stock del producto
                await this.restoStock(sku, cantidad);
                console.log(`${cantidad} unidades de ${producto.nombre} se agregaron al carrito`);
            }else{
                console.log(`El producto ${producto.nombre} no tiene suficiente stock para agregarlo al carrito`);
            }
        }
        catch (error) {
            console.log(`El producto ${sku} no fué encontrado`);
        }
    }

    async eliminarProducto(sku, cantidad){
        try{
            return new Promise((resolve, reject) => {
                //Obtengo el indice del producto dentro del array productos
                const index = this.productos.findIndex(producto => producto.sku === sku)
                 //Obtengo la cantidad del producto en el carrito
                const productoEnCarrito = this.productos.find(producto => producto.sku === sku)
                setTimeout( async () => {
                    if(productoEnCarrito){
                        if (cantidad < productoEnCarrito.cantidad){
                            console.log("Resto los productos al carrito");
                            resolve(productoEnCarrito.cantidad -= cantidad);
                        } else {
                            console.log("Se quitó el producto ", sku, "del carrito");
                            resolve(this.productos.splice(index,1));
                             //Reviso si debo quitar la categoria
                             this.actualizarCategorias()
                        }
                        //llamo a la función que recalcula el precioTotal del carrito
                        //recalcularPrecioTotalCarrito()
                        //await this.actualizarStock(sku, cantidad, '+');
                        await this.sumoStock(sku, cantidad);
                        await this.recalcularPrecioTotalCarrito();
                    }else{
                        reject(`El producto ${sku} no existe en el carrito`)
                    }
                },2000);
            })
        }
        catch(error){
            console.log(`Se produjo el siguiente error ${error}`);
        }
    }

    // Función que busca un producto por su sku en "la base de datos" 
    findProductBySku(sku) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const foundProduct = productosDelSuper.find(product => product.sku === sku);
                if (foundProduct) {
                    resolve(foundProduct);
                } else {
                    reject(`Product ${sku} not found`);
                }
            }, 1500);
        });
    }

    // Función que agrega unidades al producto seleccionado
    async sumoStock(sku, cantidad){
        const producto = await this.findProductBySku(sku);
        if (producto){
            if (cantidad > 0){
                //console.log("Incremento stock");
                //console.log(`Stock Actual: ${producto.stock}`);
                producto.stock += cantidad;
                //console.log(`Stock Final: ${producto.stock}`);
            } else {
                console.log("La cantidad ingresada no puede ser 0 o menor");
            }
        }else{
            console.log(`Producto ${sku} no encontrado`)
        }
    }

    // Funcion que quita unidades al producto seleccionado
    async restoStock(sku, cantidad){
        const producto = await this.findProductBySku(sku);
        if (producto){
            if (cantidad > 0){
                //console.log("Resto stock");
                //console.log(`Stock Actual: ${producto.stock}`);
                producto.stock -= cantidad;
                //console.log(`Stock Final: ${producto.stock}`);
            } else {
                console.log("La cantidad ingresada no puede ser 0 o menor");
            }
        }else{
            console.log(`Producto ${sku} no encontrado`)
        }
    }
    
    recalcularPrecioTotalCarrito(){
        let importeTotalproducto = 0
        this.productos.forEach(async (productoenCarrito)=>{
            const producto = await this.findProductBySku(productoenCarrito.sku);
            importeTotalproducto += (productoenCarrito.cantidad * producto.precio);
            //console.log(producto);
            this.precioTotal = importeTotalproducto;    
        }); 
    }

    mostrarCarrito(){
        console.log("Productos en el carrito:");
        this.productos.forEach((producto, index)=>{
            console.log(`${index}: ${producto.sku} - ${producto.cantidad} unidade/s de ${producto.nombre}`);
        });
        console.log("Categorias de los productos:");
        this.categorias.forEach((categorias,index)=>{
            console.log(`${index}: ${categorias}`);
        })
        console.log(`El importe total del carrito es de: $${this.precioTotal}`);
    } 

    agregarCategoria(categoria){
        const existeCategoria = this.categorias.includes(categoria);
        if (!existeCategoria) {this.categorias.push(categoria);}
    }
    
    actualizarCategorias(){
        let cat=[];
        this.categorias = [];
        this.productos.map(function(producto) {
            const pdelsuper = productosDelSuper.find(p=> p.sku === producto.sku);
            //console.log(producto.nombre, pdelsuper.categoria);
            if(!cat.includes(pdelsuper.categoria)){
                cat.push(pdelsuper.categoria);
            }
        });
        this.categorias = cat;
    }
    
}



// Cada producto que se agrega al carrito es creado con esta clase
class ProductoEnCarrito {
    sku;       // Identificador único del producto
    nombre;    // Su nombre
    cantidad;  // Cantidad de este producto en el carrito

    constructor(sku, nombre, cantidad) {
        this.sku = sku;
        this.nombre = nombre;
        this.cantidad = cantidad;
    }

}

// Funcion para simular la carga de productos
async function main(){
    const carrito = new Carrito();
    //Producto inexistente 
    await carrito.agregarProducto('ROOM101', 2);
    //Producto Existente 'KS944RUR', 'Queso', 10, 'lacteos', 4 ($30)
    await carrito.agregarProducto('KS944RUR', 3);
    //Producto Existente XX92LKI', 'Arroz', 7, 'alimentos', 20 ($14)
    await carrito.agregarProducto('XX92LKI', 2);
    //Producto con categoria existente 'UI999TY', 'Fideos', 5, 'alimentos' default stock 10 ($15)
    await carrito.agregarProducto('UI999TY', 3);
    // Producto sin stock suficiente 'RT324GD', 'Lavandina', 9, 'limpieza' default stock 10
    await carrito.agregarProducto('RT324GD', 23);
     //Producto Existente XX92LKI', 'Arroz', 7, 'alimentos', 20 ($7)
    await carrito.agregarProducto('XX92LKI', 1);

    // Una vez cargados los productos en el carrito, elimino uno utilizando .then() .catch()
    //await carrito.eliminarProducto('UI999TY', 3)
    await carrito.eliminarProducto('KS944RUR', 3)
    .then(() => {
        console.log("El producto fué quitado correctamente");
        //console.log(carrito);
    }).catch((err) => {
        console.log(err);
    })
    // Muestro el carrito luego de todas las operaciones
    setTimeout(()=>{
        carrito.mostrarCarrito();
    },5000);
    
}
main();
//(async()=>{})();


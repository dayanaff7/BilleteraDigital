# 💳 Billetera Digital

Proyecto de **Billetera Digital** desarrollado como ejercicio práctico de Front-End, que simula el funcionamiento básico de una aplicación bancaria moderna, con foco en experiencia de usuario, organización de estilos y manejo de datos en el navegador.

---

## 🧩 Descripción general

La aplicación permite a un usuario:
- Acceder a la plataforma mediante inicio de sesión
- Visualizar su saldo disponible
- Realizar depósitos
- Enviar dinero a contactos
- Revisar el historial de movimientos
- Navegar por una interfaz clara, responsiva y con identidad visual propia

El proyecto utiliza **LocalStorage** para simular persistencia de datos, sin necesidad de backend.

---

## 🚀 Funcionalidades

- 🔐 **Inicio de sesión** con validaciones (email y contraseña)
- 🏠 **Página principal (index)** con:
  - Carrusel informativo
  - Cards de servicios: Hazte Cliente, Crédito Hipotecario, Inversiones
  - Acceso rápido a clientes mediante Offcanvas
- 💰 **Menú principal** con saldo disponible
- ➕ **Depósitos** a la cuenta
- 💸 **Envío de dinero** a contactos (con agenda)
- 📋 **Últimos movimientos** con filtro por tipo
- 🧠 Persistencia de:
  - Saldo
  - Movimientos
  - Contactos
- 🎨 Estilos personalizados con tema **morado (wallet)**

---

## 🛠️ Tecnologías utilizadas

- **HTML5**
- **CSS3**
- **Bootstrap 5**
- **JavaScript**
- **jQuery**
- **LocalStorage**
- **Git & GitHub**

---

## 🎨 Estilos y diseño

- Fondo claro para mejorar legibilidad
- Navbar morado con texto blanco
- Botones personalizados (`btn-wallet`)
- Formularios centrados y reutilizables
- Estilos centralizados en `estilos.css`

---

## 📂 Estructura del proyecto

├── index.html

├── login.html

├── menu.html

├── deposit.html

├── sendmoney.html

├── transactions.html

├── estilos.css

├── script.js

├── img/

│ ├── slider1.jpg

│ ├── slider2.jpg

│ ├── slider3.jpg

│ ├── images1.jpg

│ ├── images2.jpg

│ └── images3.jpg

└── README.md

# Network Traffic History Patcher (Portfolio Edition)

![Project Status](https://img.shields.io/badge/status-portfolio_ready-success)
![Tech Stack](https://img.shields.io/badge/stack-React_|_TypeScript_|_Vite_|_Firebase-blue)
[![Live View](https://img.shields.io/badge/demo-live_view-orange?logo=firebase)](https://sispro-data-patcher.web.app/)

## 📋 Descripción General

Herramienta web profesional de nivel empresarial diseñada para asistir a Ingenieros de Redes y DBAs en la generación automatizada y segura de scripts SQL para la **reparación ("Time Shift")** y **clonación** de datos históricos de tráfico de red.

Este proyecto resuelve la problemática de "huecos" en gráficas de monitoreo causados por fallas en el poleo SNMP, permitiendo reconstruir la integridad histórica de los datos mediante proyecciones matemáticas de periodos adyacentes.

> **Nota:** Esta versión está configurada en **"Modo Portafolio"**. Utiliza un motor de generación de datos simulados (_Mock Data_) de alta fidelidad para demostrar la funcionalidad completa sin requerir conexión a una base de datos corporativa real.

## 🚀 Características Principales

- **Asistente de Flujo de Trabajo (Wizard Pattern)**: Interfaz guiada paso a paso que asegura la integridad de los datos de entrada antes de proceder.
- **Algoritmo "Time Shift"**: Lógica compleja para proyectar datos de periodos pasados o futuros sobre un rango de fechas específico ("hueco"), ajustando timestamps milimétricamente.
- **Visualización de Datos Interactiva**: Integración con **amCharts 5** para visualizar patrones de tráfico y detectar anomalías o huecos visualmente.
- **Generación SQL Segura**: Construcción automática de sentencias `INSERT`, `UPDATE` y `DELETE` sanitizadas y optimizadas para bases de datos SQL masivas.
- **Validación de Datos**: Reglas de negocio estrictas para prevenir errores humanos (ej. validación de rangos de fechas, coherencia de IPs y Alias).
- **Historial de Auditoría**: Integración con **Firebase Firestore** para registrar cada operación de generación de scripts (Logs de Inyección).
- **Diseño Responsivo y Moderno**: UI construida con **Tailwind CSS**, soportando modo claro y oscuro.

## 🛠️ Stack Tecnológico

- **Frontend Core**: React 19, TypeScript, Vite.
- **Runtime & Tooling**: **Bun** (Gestor de paquetes y Runtime optimizado).
- **Estado Global**: Zustand.
- **Estilos**: Tailwind CSS.
- **Visualización**: amCharts 5.
- **Backend as a Service**: Firebase (Firestore para logging).
- **Fechas**: Utilidades nativas optimizadas para manipulación de timestamps.

## 📂 Estructura del Proyecto

```
├── 📁 public
│   └── 🖼️ Excel_format_friendly.png
├── 📁 src
│   ├── 📁 components
│   │   ├── 📁 common
│   │   │   ├── 📄 IdentificationSection.tsx
│   │   │   ├── 📄 QueryForm.tsx
│   │   │   └── 📄 SqlDisplay.tsx
│   │   ├── 📁 layout
│   │   │   └── 📄 Sidebar.tsx
│   │   ├── 📁 ui
│   │   │   ├── 📄 Button.tsx
│   │   │   ├── 📄 DateTimeSliderPicker.tsx
│   │   │   ├── 📄 DeviceInfoCard.tsx
│   │   │   ├── 📄 FormField.tsx
│   │   │   ├── 📄 Modal.tsx
│   │   │   ├── 📄 SqlCanvas.tsx
│   │   │   ├── 📄 SqlCanvasCopyButton.tsx
│   │   │   └── 📄 SqlTable.tsx
│   │   └── 📁 wizard
│   │       ├── 📁 source
│   │       │   └── 📄 SourceDeviceForm.tsx
│   │       ├── 📄 BandwidthChartModal.tsx
│   │       ├── 📄 StepExecution.tsx
│   │       ├── 📄 StepSource.tsx
│   │       ├── 📄 StepTarget.tsx
│   │       └── 📄 WizardStepper.tsx
│   ├── 📁 pages
│   │   ├── 📄 RecentActivity.tsx
│   │   └── 📄 SisproDataPatcher.tsx
│   ├── 📁 routes
│   │   └── 📄 AppRoutes.tsx
│   ├── 📁 services
│   │   └── 📄 injectionLogService.ts
│   ├── 📁 store
│   │   └── 📄 wizardStore.ts
│   ├── 📁 types
│   │   └── 📄 wizard.ts
│   ├── 📁 utils
│   │   ├── 📄 dateUtils.ts
│   │   ├── 📄 sisproApi.ts
│   │   ├── 📄 sqlGenerator.ts
│   │   └── 📄 validators.ts
│   ├── 📄 App.tsx
│   ├── 📄 firebase.ts
│   ├── 🎨 index.css
│   └── 📄 main.tsx
├── ⚙️ .env.example
├── ⚙️ .gitignore
├── 📝 README.md
├── 📄 bun.lock
├── 📄 eslint.config.js
├── 🌐 index.html
├── ⚙️ package-lock.json
├── ⚙️ package.json
├── 📄 postcss.config.js
├── 📄 tailwind.config.js
├── ⚙️ tsconfig.app.json
├── ⚙️ tsconfig.json
├── ⚙️ tsconfig.node.json
└── 📄 vite.config.ts
```

## ⚙️ Instalación y Configuración

Sigue estos pasos para ejecutar el proyecto en tu entorno local:

### 1. Clonar el repositorio

```bash
git clone https://github.com/victorZamoraBarbosa97/sql-patcher-assistant.git

cd sql-patcher-assistant
```

### 2. Instalar dependencias

```bash
npm install
# o
yarn install
# o
bun install
```

### 3. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto. Necesitarás una configuración de Firebase para que funcione el módulo de "Actividad Reciente".

```env
VITE_FIREBASE_API_KEY=tu_api_key_real
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```

> _Si solo deseas ver la UI sin el guardado de logs, la aplicación funcionará correctamente, aunque verás errores en la consola al intentar guardar._

### 4. Ejecutar el servidor de desarrollo

```bash
npm run dev
```

Abre tu navegador en `http://localhost:5173`.

## 📖 Guía de Uso Rápida

1.  **Identificación (Paso 1)**:
    - Ingresa los datos del dispositivo o usa el botón **"Insertar Datos de Prueba"** para simular una búsqueda real.
    - El sistema validará la coherencia entre la IP y el Proyecto.

2.  **Configuración de Fuente (Paso 2)**:
    - Define el rango de fechas donde ocurrió la falla (el hueco).
    - Haz clic en **"Visualizar Gráfica Original"** para ver los datos simulados y confirmar el hueco.
    - Selecciona la estrategia de reparación: usar datos previos ("Pasado") o posteriores ("Futuro").

3.  **Ejecución y Generación (Paso 3)**:
    - El sistema genera el script SQL final y una previsualización tabular de los datos que se inyectarán.
    - Haz clic en **"Guardar y Copiar"** para registrar la acción y llevar el SQL al portapapeles.

## 🛡️ Seguridad y Confidencialidad

Para fines de publicación en este portafolio:

- Todos los nombres de tablas, esquemas y proyectos reales han sido reemplazados por identificadores genéricos (ej. `TRAFFIC_HISTORY_PARTITION`, `PROYECTO_ALPHA`).
- No se exponen direcciones IP públicas ni topologías de red sensibles.
- El código no contiene lógica de conexión a bases de datos corporativas; todo el procesamiento SQL es generación de texto puro (String Building) validado.

## 📄 Licencia

Este proyecto es para fines demostrativos de portafolio.

---

**Desarrollado con ❤️ y ☕ por Victor Zamora**
[\[Mi perfil de LinkedIn\]](https://www.linkedin.com/in/victor-ernesto-zamora-8217b8323/) | web personal en desarrollo

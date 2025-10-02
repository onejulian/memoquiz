# Arquitectura de MemoQuiz - Refactorización POO

## Descripción General

La aplicación MemoQuiz ha sido refactorizada siguiendo principios de Programación Orientada a Objetos (POO) y dividida en módulos independientes para mejorar la mantenibilidad, escalabilidad y organización del código.

## Estructura de Carpetas

```
memoquiz/
├── models/              # Modelos de datos
│   ├── Paragraph.js     # Modelo de párrafo
│   ├── QuizSession.js   # Modelo de sesión de quiz
│   └── Result.js        # Modelo de resultado
│
├── services/            # Servicios de lógica de negocio
│   ├── StorageService.js    # Manejo de localStorage
│   ├── TextProcessor.js     # Procesamiento de texto
│   └── RankCalculator.js    # Cálculo de rangos
│
├── views/               # Vistas y manejo de UI
│   ├── ScreenManager.js         # Gestión de pantallas
│   ├── NotificationManager.js   # Notificaciones
│   ├── ModalManager.js          # Gestión de modales
│   ├── StartView.js             # Vista de inicio
│   ├── QuizView.js              # Vista del quiz
│   └── ResultsView.js           # Vista de resultados
│
├── controllers/         # Controladores
│   └── AppController.js # Controlador principal
│
├── app.js              # Punto de entrada
├── index.html          # HTML principal
└── styles.css          # Estilos
```

## Arquitectura MVC

La aplicación sigue el patrón Modelo-Vista-Controlador (MVC):

### Modelos (`models/`)

**`Paragraph.js`**
- Representa un párrafo memorizable
- Métodos: `fromJSON()`, `toJSON()`, `getPreview()`, `getSentenceCount()`

**`QuizSession.js`**
- Maneja el estado de una sesión de quiz en curso
- Métodos: `getCurrentSentence()`, `recordReview()`, `recordError()`, `nextSentence()`, `isComplete()`

**`Result.js`**
- Representa el resultado de un quiz completado
- Métodos: `fromJSON()`, `toJSON()`, `getFormattedDate()`, `getRankOrder()`

### Servicios (`services/`)

**`StorageService.js`**
- Maneja la persistencia de datos en localStorage
- Métodos: `saveParagraphs()`, `loadParagraphs()`, `saveResults()`, `loadResults()`

**`TextProcessor.js`**
- Procesamiento y normalización de texto
- Métodos estáticos: `splitIntoSentences()`, `normalizeText()`, `compareTexts()`

**`RankCalculator.js`**
- Calcula rangos y resultados del quiz
- Métodos estáticos: `calculateResults()`, `calculateRank()`, `getResultsForParagraph()`

### Vistas (`views/`)

**`ScreenManager.js`**
- Gestiona la navegación entre pantallas
- Métodos: `showScreen()`, `hideElement()`, `showElement()`

**`NotificationManager.js`**
- Muestra notificaciones temporales
- Método estático: `show()`

**`ModalManager.js`**
- Gestiona modales (errores, historial)
- Métodos: `showErrorModal()`, `hideErrorModal()`, `showHistoryModal()`, `hideHistoryModal()`

**`StartView.js`**
- Maneja la interfaz de la pantalla de inicio
- Métodos: `setupEventListeners()`, `renderSavedParagraphs()`, `getParagraphText()`

**`QuizView.js`**
- Maneja la interfaz de la pantalla de quiz
- Métodos: `setupEventListeners()`, `showStudySection()`, `showWritingSection()`, `getUserInput()`

**`ResultsView.js`**
- Maneja la interfaz de la pantalla de resultados
- Métodos: `setupEventListeners()`, `showResults()`

### Controlador (`controllers/`)

**`AppController.js`**
- Controlador principal que coordina toda la aplicación
- Inicializa servicios, vistas y gestores
- Maneja todos los eventos de la aplicación
- Coordina la comunicación entre modelos, vistas y servicios

## Flujo de Datos

```
Usuario → Vista → AppController → Servicios/Modelos → AppController → Vista → Usuario
```

### Ejemplo: Agregar un Párrafo

1. Usuario escribe texto y hace clic en "Agregar Párrafo"
2. `StartView` captura el evento y llama a `onAddParagraph()` del `AppController`
3. `AppController` obtiene el texto de `StartView`
4. `TextProcessor` divide el texto en frases
5. Se crea un nuevo `Paragraph` (modelo)
6. `AppController` agrega el párrafo a su lista y llama a `StorageService.saveAll()`
7. `StartView` actualiza la interfaz con `renderSavedParagraphs()`

### Ejemplo: Quiz

1. Usuario inicia un quiz desde `StartView`
2. `AppController` crea una nueva `QuizSession`
3. `QuizView` muestra la frase actual
4. Usuario escribe y envía su respuesta
5. `TextProcessor.compareTexts()` verifica la respuesta
6. Si es correcta: avanza a la siguiente frase
7. Si es incorrecta: `ModalManager` muestra modal de error
8. Al completar: `RankCalculator` calcula resultados
9. Se crea un `Result` y se guarda con `StorageService`
10. `ResultsView` muestra los resultados

## Ventajas de esta Arquitectura

1. **Separación de responsabilidades**: Cada clase tiene una responsabilidad única y bien definida
2. **Reutilización**: Los servicios y modelos son independientes y reutilizables
3. **Mantenibilidad**: Es fácil localizar y modificar funcionalidad específica
4. **Testabilidad**: Cada clase puede ser probada de forma independiente
5. **Escalabilidad**: Fácil agregar nuevas funcionalidades sin afectar el código existente
6. **Modularidad**: Uso de módulos ES6 para importar/exportar

## Principios de Diseño Aplicados

- **Single Responsibility Principle (SRP)**: Cada clase tiene una única razón para cambiar
- **Separation of Concerns**: Lógica de negocio separada de la presentación
- **Dependency Injection**: Las dependencias se pasan al constructor
- **Encapsulación**: Los datos y métodos están agrupados en clases
- **DRY (Don't Repeat Yourself)**: Código reutilizable en servicios y utilidades

## Uso de Módulos ES6

La aplicación utiliza módulos ES6 (`import`/`export`) lo que permite:
- Carga asíncrona de código
- Mejor organización del código
- Evitar contaminación del scope global
- Dependencias explícitas

## Migración desde el Código Original

El código original (`script.js.backup`) tenía todas las funciones y estado en un único archivo de 715 líneas. La refactorización:

- Dividió el código en **16 archivos** organizados en 4 carpetas
- Convirtió funciones en **métodos de clases**
- Separó el **estado de la aplicación** en modelos específicos
- Extrajo **lógica de negocio** a servicios
- Aisló **manipulación del DOM** en vistas

## Siguiente Pasos Sugeridos

1. Agregar tests unitarios para cada clase
2. Implementar sistema de routing más robusto
3. Agregar TypeScript para tipado estático
4. Implementar patrón Observer para comunicación entre componentes
5. Agregar build system (webpack/vite) para optimización


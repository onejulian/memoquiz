# MemoQuiz - Aplicación para Entrenar la Memoria

MemoQuiz es una aplicación web diseñada para ayudarte a mejorar tu memoria mediante la memorización de párrafos completos. La aplicación divide los párrafos en frases individuales y te guía a través de un proceso de memorización sistemático.

## Características

### 🎯 Funcionalidades Principales
- **Memorización por frases**: Los párrafos se dividen automáticamente en frases terminadas en punto
- **Proceso guiado**: Estudia cada frase individualmente antes de escribirla de memoria
- **Sistema de rangos**: Obtén calificaciones basadas en tu rendimiento (S, A, B, C)
- **Prevención de trampas**: No se permite pegar texto, debes escribir de memoria
- **Historial de resultados**: Guarda tus mejores puntuaciones para cada párrafo

### 🎨 Diseño
- **Modo oscuro moderno**: Interfaz profesional y fácil de usar
- **Completamente responsive**: Funciona en escritorio, tablet y móvil
- **Animaciones suaves**: Transiciones fluidas entre pantallas
- **Notificaciones intuitivas**: Feedback visual inmediato

### 💾 Almacenamiento
- **localStorage**: Los párrafos y resultados se guardan localmente
- **Sin registro requerido**: Todo funciona offline después del primer uso
- **Progreso temporal**: El progreso del quiz no se guarda (evita trampas)

## Cómo Usar

### 1. Agregar Párrafos
- En la pantalla de inicio, escribe o pega un párrafo en el área de texto
- Haz clic en "Agregar Párrafo" o presiona Ctrl+Enter
- El párrafo se dividirá automáticamente en frases

### 2. Realizar el Quiz
- Selecciona un párrafo guardado y haz clic en "Comenzar Quiz"
- **Fase de estudio**: Lee la primera frase cuidadosamente
- **Fase de escritura**: Haz clic en "Estoy listo para escribir"
- Escribe la frase de memoria (no puedes pegar texto)
- **Si te equivocas**: Aparecerá un diálogo profesional con dos opciones:
  - **Ver frase y estudiar nuevamente**: Puedes revisar la frase (cuenta como intento)
  - **Intentar escribir sin ver la frase**: Puedes cambiar de opinión y verla cuando quieras

### 3. Sistema de Puntuación
- **Rango S** (0 revisiones y 0 errores): ¡Perfecto! Acertaste todas las frases a la primera sin revisiones
- **Rango A** (0 revisiones pero con errores): ¡Excelente! Acertaste eventualmente pero cometiste algunos errores
- **Rango B** (1-3 revisiones): Buen trabajo, pero puedes mejorar
- **Rango C** (4+ revisiones): Necesitas más práctica

### 4. Gestión de Párrafos
- **Eliminar**: Puedes eliminar párrafos y sus resultados asociados
- **Historial**: Ve tus mejores puntuaciones para cada párrafo
- **Múltiples sesiones**: Los datos persisten entre sesiones

## Consejos para Memorizar

1. **Lee activamente**: No solo leas, trata de visualizar y entender cada frase completa con su puntuación
2. **Presta atención a los detalles**: Mayúsculas, tildes, comas son importantes - memorízalos exactamente
3. **Punto opcional**: Puedes escribir con o sin punto final, ambas formas son válidas
4. **Repite en voz alta**: Decir las frases en voz alta ayuda a la memorización precisa
5. **Toma tu tiempo**: No hay límite de tiempo, estudia hasta sentirte seguro de cada detalle
6. **Practica regularmente**: Usa diferentes párrafos para mejorar tu capacidad de memorización precisa
7. **Sé honesto**: El sistema requiere precisión exacta para fomentar el verdadero aprendizaje
8. **Apunta al rango S**: Intenta acertar todas las frases a la primera sin revisiones para obtener el rango perfecto

## Instalación

1. Clona o descarga los archivos
2. Abre `index.html` en tu navegador web
3. ¡Comienza a memorizar!

### Desarrollo Local
```bash
# Servir localmente (opcional)
python3 -m http.server 8000
# Luego abre http://localhost:8000
```

## Tecnologías Usadas

- **HTML5**: Estructura semántica y accesible
- **CSS3**: Diseño moderno con variables CSS y modo oscuro
- **JavaScript ES6+**: Lógica de la aplicación con módulos modernos y POO
- **localStorage**: Persistencia de datos sin servidor
- **Responsive Design**: Compatible con todos los dispositivos
- **Arquitectura MVC**: Separación clara entre modelos, vistas y controladores

## Arquitectura

La aplicación ha sido refactorizada siguiendo principios de **Programación Orientada a Objetos (POO)** y el patrón **MVC (Model-View-Controller)**:

```
📁 memoquiz/
├── 📁 models/           # Modelos de datos (Paragraph, QuizSession, Result)
├── 📁 services/         # Servicios de lógica de negocio (Storage, TextProcessor, RankCalculator)
├── 📁 views/            # Vistas y gestión de UI (ScreenManager, Modals, Views)
├── 📁 controllers/      # Controlador principal (AppController)
└── app.js              # Punto de entrada de la aplicación
```

**Beneficios de esta arquitectura:**
- ✅ Código modular y organizado
- ✅ Fácil mantenimiento y escalabilidad
- ✅ Separación de responsabilidades
- ✅ Reutilización de código
- ✅ Mayor testabilidad

📖 **Para más detalles sobre la arquitectura, consulta [ARCHITECTURE.md](ARCHITECTURE.md)**

## Características Técnicas

### Procesamiento de Texto
- **Comparación 100% exacta**: Mayúsculas, minúsculas, tildes, comas, todo debe coincidir perfectamente
- **Solo normaliza comillas**: Convierte comillas curvas (") a comillas planas (") para facilitar la escritura
- **Auto-agrega punto final**: Si el párrafo no termina con punto, ? o !, automáticamente se agrega un punto
- **Detección precisa de límites de frases**: Solo frases terminadas en punto, interrogación o exclamación
- **Punto final opcional**: El usuario puede escribir con o sin punto final, ambas formas son válidas

### Sistema de Seguimiento
- **Rastreo de errores**: Cuenta cuántas veces se equivoca el usuario en cada frase
- **Rastreo de revisiones**: Cuenta cuántas veces necesita ver la frase nuevamente
- **Estadísticas detalladas**: Muestra errores y revisiones por frase en el reporte final

### Experiencia de Usuario
- Navegación intuitiva entre pantallas
- Feedback inmediato con notificaciones
- Animaciones suaves y transiciones
- Diálogos modales profesionales para decisiones importantes
- Libertad total para revisar frases cuando sea necesario

## TODO
- Agregar opciones de teclado para todos los botones ✅
- Centrar el texto cuando se escribe un párrafo ✅
- Dar coherencia al hoover ✅
- Afinar animaciones ✅
- Poder tener una pequeña pista del lugar donde está el error cuando una frase se escribe mal ✅
- Mantener un historial limitado de 10 intentos, ordenarlos por fecha ✅
- Agregar analytics sobre el historial
- Agregar soporte offline
- Agregar autenticación y manejo online/offline

## Contribuir

Si encuentras bugs o tienes sugerencias de mejora:

1. Revisa los archivos existentes
2. Haz tus cambios respetando la estructura del código
3. Prueba la funcionalidad en diferentes navegadores
4. Mantén la consistencia del estilo de código

## Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

---

¡Diviértete mejorando tu memoria con MemoQuiz! 🧠✨

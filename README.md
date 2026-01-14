# cubo-magico

Un simple generador de cubo mágico en Python.

## ¿Qué es un cubo mágico?

Un cubo mágico es un arreglo tridimensional de números donde la suma de los números en cada fila, columna y pilar es igual a una constante mágica.

Este proyecto implementa un cubo mágico semi-perfecto de 3×3×3 donde cada suma es 42.

## Uso

Ejecuta el script directamente:

```bash
python3 cubo_magico.py
```

El programa mostrará:
- El cubo mágico organizado en 3 capas
- La constante mágica (42)
- Validación de que todas las filas, columnas y pilares suman correctamente

## Ejemplo de salida

```
Simple Magic Cube (Cubo Mágico) Generator
==========================================

3×3×3 Magic Cube:
========================================

Layer 0:
    1  23  18
   22  14   6
   19   5  18

Layer 1:
   25   7  10
    4  14  24
   13  21   8

Layer 2:
   16  12  14
   16  14  12
   10  16  16
========================================

Magic Constant: 42
✓ All rows, columns, and pillars sum to the magic constant!
```

## Requisitos

- Python 3.6 o superior
- No se requieren dependencias externas

## Características

- ✓ Genera un cubo mágico semi-perfecto de 3×3×3
- ✓ Todas las filas, columnas y pilares suman 42
- ✓ Validación automática de las propiedades del cubo
- ✓ Visualización clara del cubo en capas

## Nota

Los cubos mágicos perfectos (donde todas las diagonales espaciales también suman a la constante mágica) son mucho más complejos de construir. Esta implementación se enfoca en la simplicidad, proporcionando un cubo semi-perfecto que satisface las propiedades fundamentales de un cubo mágico.
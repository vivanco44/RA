#!/bin/bash

DB="sensores_db"
USER="usuario"         

echo "¿Qué dato deseas consultar?"
echo "1) Temperatura"
echo "2) Humedad"
echo "3) CO2"
echo "4) Volátiles"
read -p "Elige una opción (1-4): " OPCION_DATO

case "$OPCION_DATO" in
    1)
        CAMPO="temperatura"
        TABLA="clima"
        ;;
    2)
        CAMPO="humedad"
        TABLA="clima"
        ;;
    3)
        CAMPO="co2"
        TABLA="gases"
        ;;
    4)
        CAMPO="volatiles"
        TABLA="gases"
        ;;
    *)
        echo "Opción no válida."
        exit 1
        ;;
esac

echo "¿Qué operación deseas hacer?"
echo "1) Promedio (AVG)"
echo "2) Máximo (MAX)"
echo "3) Mínimo (MIN)"
read -p "Elige una opción (1-3): " OPCION_OP

case "$OPCION_OP" in
    1)
        OPERACION="AVG"
        ;;
    2)
        OPERACION="MAX"
        ;;
    3)
        OPERACION="MIN"
        ;;
    *)
        echo "Opción no válida."
        exit 1
        ;;
esac

read -p "Introduce la fecha de inicio (YYYY-MM-DD): " FECHA_INICIO
read -p "Introduce la fecha de fin (YYYY-MM-DD): " FECHA_FIN


QUERY="SELECT ${OPERACION}(${CAMPO}) AS resultado 
       FROM ${TABLA} 
       WHERE timestamp BETWEEN '${FECHA_INICIO} 00:00:00' AND '${FECHA_FIN} 23:59:59';"

mysql -u "$USER" -p -D "$DB" -e "$QUERY"


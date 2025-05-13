#!/bin/bash

# Parámetros de conexión
DB="sensores_db"
USER="usuario"        # ← Cambia esto por tu usuario real de MySQL
PASS="alumno123@"     # ← Cambia esto por tu contraseña real de MySQL

# Solicitar fechas al usuario
read -p "Introduce la fecha de inicio (YYYY-MM-DD): " FECHA_INICIO
read -p "Introduce la fecha de fin (YYYY-MM-DD): " FECHA_FIN

# Consulta SQL
QUERY="SELECT AVG(temperatura) AS media_temperatura 
       FROM clima 
       WHERE timestamp BETWEEN '${FECHA_INICIO} 00:00:00' AND '${FECHA_FIN} 23:59:59';"

# Ejecutar la consulta
mysql -u "$USER" -p"$PASS" -D "$DB" -e "$QUERY"

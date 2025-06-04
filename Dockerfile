FROM maven:3.9-eclipse-temurin-21-alpine AS build

WORKDIR /app

COPY pom.xml ./
COPY mvnw ./
COPY .mvn/ .mvn/

# Convertir saltos de línea a formato Unix (opcional pero recomendable si usas Windows)
RUN apk add --no-cache dos2unix && dos2unix mvnw

# Asegura que mvnw sea ejecutable
RUN chmod 755 mvnw

# Descargar dependencias sin compilar el proyecto
RUN sh mvnw dependency:go-offline -B

# Copiar el resto del código fuente
COPY src ./src

# Compilar el proyecto sin ejecutar tests
RUN ./mvnw package -DskipTests

# Etapa de ejecución
FROM eclipse-temurin:21-jre-alpine

# Crear un usuario no root por seguridad
RUN addgroup -S javauser && adduser -S javauser -G javauser

WORKDIR /app

# Copiar el JAR generado desde la etapa de construcción
COPY --from=build /app/target/*.jar app.jar

# Usar el usuario seguro
USER javauser

# Exponer el puerto estándar de Spring Boot
EXPOSE 8080

# Ejecutar la aplicación (permite definir el puerto con variable de entorno PORT)
CMD ["sh", "-c", "java -Dserver.port=${PORT:-8080} -jar app.jar"]

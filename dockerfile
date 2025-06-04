# Etapa de construcción
FROM maven:3.9-eclipse-temurin-21-alpine AS build

WORKDIR /app

# Copiar primero solo los archivos necesarios para cachear las dependencias
COPY pom.xml ./
COPY mvnw ./
COPY .mvn/ .mvn/

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

USER javauser

# Exponer el puerto en el que se ejecutará Spring Boot
EXPOSE 8080

# Ejecutar la aplicación (permite que el puerto se configure por variable de entorno PORT si se desea)
CMD ["sh", "-c", "java -Dserver.port=${PORT:-8080} -jar app.jar"]

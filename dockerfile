# Etapa de construcción
FROM maven:3.9-eclipse-temurin-21-alpine AS build

WORKDIR /app

# Copiar solo lo necesario primero para cachear dependencias
COPY pom.xml ./
COPY mvnw ./
COPY .mvn .mvn

RUN ./mvnw dependency:go-offline -B

# Copiar el resto del código
COPY src ./src

# Construir el proyecto sin ejecutar tests
RUN ./mvnw package -DskipTests

# Etapa de ejecución
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copiar el .jar generado desde el build
COPY --from=build /app/target/*.jar app.jar

# Crear un usuario no root para mayor seguridad
RUN addgroup -S javauser && adduser -S javauser -G javauser
USER javauser

# Expone el puerto que usará Spring Boot
EXPOSE 8080

# Ejecutar la aplicación Spring Boot
CMD ["sh", "-c", "java -Dserver.port=${PORT:-8080} -jar app.jar"]

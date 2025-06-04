# Etapa 1: Construcción del proyecto
FROM maven:3.9.6-eclipse-temurin-21 AS build

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar todos los archivos del proyecto
COPY . .

# Usar el wrapper para compilar el proyecto (sin tests para acelerar)
RUN ./mvnw clean package -DskipTests

# Etapa 2: Imagen final para ejecutar la app
FROM eclipse-temurin:21-jdk

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar el jar construido desde la etapa anterior
COPY --from=build /app/target/*.jar app.jar

# Exponer el puerto por el que correrá la app (ajústalo si cambias el server.port)
EXPOSE 8080

# Comando para ejecutar la app
ENTRYPOINT ["java", "-jar", "app.jar"]

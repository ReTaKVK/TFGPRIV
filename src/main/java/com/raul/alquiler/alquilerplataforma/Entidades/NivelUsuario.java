package com.raul.alquiler.alquilerplataforma.Entidades;

public enum NivelUsuario {
    BRONCE("Bronce", "#CD7F32", 0),
    PLATA("Plata", "#C0C0C0", 5),
    ORO("Oro", "#FFD700", 10),
    DIAMANTE("Diamante", "#B9F2FF", 15);

    private final String nombre;
    private final String color;
    private final int descuento;

    NivelUsuario(String nombre, String color, int descuento) {
        this.nombre = nombre;
        this.color = color;
        this.descuento = descuento;
    }

    public String getNombre() {
        return nombre;
    }

    public String getColor() {
        return color;
    }

    public int getDescuento() {
        return descuento;
    }
}

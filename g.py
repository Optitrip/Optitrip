
# 1) Solicitar un valor en pesos y presentarlo en dolares y euros
def pesos_a_dolares_y_euros(pesos, currency):
    if currency == "dolares":
        return pesos / 20
    elif currency == "euros":
        return pesos / 22
    else:
        return "Moneda no soportada" 
# 2) Pedir un importe y presentar el iva y el total general (Monto mas iva)
def iva_y_total(importe):
    iva = importe * 0.16
    total = importe + iva
    return iva, total
# 3) Pedir un valor en segundos, y presentarlo en Horas:Minutos:Segundos  4000 s-->01:06:40 
def segundos_a_horas_minutos_segundos(segundos):
    horas = segundos // 3600
    minutos = (segundos % 3600) // 60
    segundos = (segundos % 3600) % 60
    return f"{horas:02d}:{minutos:02d}:{segundos:02d}"
# 4) [IF] Pedir 3 numeros y mostrarlos en forma ordenada descendente
def ordenar(a,b,c):
    lista=[]
    mayor=a
    if b>=mayor:
        lista=[b,a]
        mayor=b
    else:
        lista=[a,b]
    if c>mayor:
        lista=[c]+lista
        mayor=c
    elif c<=mayor:
        if c>=lista[1]:
            lista=lista[:1]+[c]+lista[1:]
        else:
            lista=lista+[c]
    return lista
print(ordenar(10,8,1))
# 5) [FUNCIONES TEXTO] Solicitar una frase de 3 palabras y mostrar las palabras separadas
def separar_palabras(frase):
    return frase.split(" ")
# 6) Calcular la hipotenusa (pidiendo ambos lados:opuesto y adyacente)
def hipotenusa(opuesto, adyacente):
    return (opuesto**2 + adyacente**2)**0.5
# 7) [IF] Solicitar un numero e indicar si es impar
def impar(numero):
    return numero%2!=0
# 8) [ELIF] Pedir una calificacion (5 al 10), e indicar la leyenda:10-excelente, 9-muy bien, 8-Bien, 7-Regular, 6-Mal, 5-Reprobado
leyendas=["","","","","reprobado","mal","regular","bien","muy bien","excelente"]
calificacion=int(input("Calificacion: "))
print(leyendas[calificacion-1])
# 9) [FOR] Pedir 5 numeros, y poresentar la suma, el conteo y el promedio
# 10) [FOR] Pedir un numero e indicar si es un numero primo
# 11) [FOR] Escribe un programa que indique cuantos años pares existen entre 1950 y 2010
# 12) Escribir un numero de 5 dígitos e indicar si se trata de una capicua
# 13) [FOR] Del listado (10,111,13,15,45,63,25,96) indicar cuantos numeros son impares
# 14) [FOR] Preguntar primero cuantos números, posterior solicitar cada uno de esos numeros y mostrar la sumatoria
# 15) [FOR] Programa que pida 4 calificaciones (0-10), posteriormente calcular el promedio e indicar su clasificacion: 
# 0.0-5.9: E
# 6.0-6.9: D
# 7.0-7.9: C
# 8.0-8.9: B
# 9.0-10: A

# Adicionales
# 16) Escribe un programa que dado un monto, indique los billetes a entregar: Denominaciones: 500, 200, 100, 50, 20, 10, 5, 1
# 17) Escribe un programa que pida un valor y calcule y muestre su factorial
# 18) Escribe un programa que pida 3 valores e indique cuando son iguales
# 19) Escribe un programa que pida un valor en Metros, y muestre su equivalencia en Pies y en Yardas
# 20) Escribe un programa que pida un número y diga si es multiplo de 5

# ESTRUCTURAS REPETITIVAS
# 21) Usando FOR y WHILE. De la siguiente lista [8,14,22,3,7,28,36,49,52], indicar cuantos números son pares
# 22) Usando FOR y WHILE. De la siguiente lista [8,14,22,3,7,28,36,49,52], indicar cuantos números están por encima de 15
# 23) Usando FOR y WHILE. De la siguiente lista [8,14,22,3,7,28,36,49,52], indicar la cantidad de valores, la sumatoria y su promedio
# 24) Usando FOR y WHILE. Del ejercicio anterior, calcular el La Varianza y Desviación Estándar Poblacional
# 25) Usando FOR y WHILE. Realiza un programa que pida 2 números enteros, e imprima los números impares que existen entre los 2 valores

# RA05 — Respostes del test amb referència als apunts de classe

## Referència general dels apunts
Tema **7 — Servidor de impresión y de archivos en Linux**, pàgines **114–123** dels apunts del llibre.

---

## 1. Quina és la funció principal d’un sistema d’impressió?
**Resposta correcta: B) Permetre enviar i administrar treballs d’impressió**

**Per què és correcta**
- És la correcta perquè el tema tracta precisament de **l’administració d’un servei d’impressió** i de la seva gestió dins del sistema.

**Per què les altres no**
- **A) Gestionar la connexió a Internet** → No correspon al servei d’impressió.
- **C) Crear usuaris nous al sistema** → És administració d’usuaris, no impressió.
- **D) Fer còpies de seguretat automàtiques** → És una altra funció del sistema.

**Referència als apunts**
- **Pàg. 114**, bloc **Objetivos** → hi apareix la idea d’**“administrar un servicio de impresión”**.
- **Pàg. 118**, apartat **7.5. CUPS. Servidor de impresión** → s’explica que CUPS és el sistema que permet gestionar la impressió.

---

## 2. Què és un servidor d’impressió?
**Resposta correcta: A) Un dispositiu o servei que gestiona impressores i cues d’impressió**

**Per què és correcta**
- És la definició que encaixa amb el que expliquen els apunts sobre **CUPS** i sobre el **servidor d’impressió Samba**.

**Per què les altres no**
- **B) Un programa per editar imatges** → No gestiona impressores.
- **C) Un sistema per apagar ordinadors en xarxa** → No és un servei d’impressió.
- **D) Un disc dur extern** → És emmagatzematge, no impressió.

**Referència als apunts**
- **Pàg. 116**, apartat **7.4. Servidor de archivos Samba** i subapartat **7.4.2. Configurar** → es veu la configuració del servei.
- **Pàg. 118**, apartat **7.5. CUPS. Servidor de impresión** → és la referència més directa.
- **Pàg. 119**, apartat **7.7. Samba con soporte para la impresión con CUPS** → relaciona Samba i la gestió d’impressores i cues.

---

## 3. Què és una cua d’impressió?
**Resposta correcta: B) Una llista de documents pendents d’imprimir**

**Per què és correcta**
- És correcta perquè els apunts dediquen diversos apartats a **administrar cues**, **acceptar/rebutjar cues** i **aturar/activar cues**.

**Per què les altres no**
- **A) Una carpeta on es guarden vídeos** → No té relació amb la impressió.
- **C) Un sistema d’arrencada del sistema operatiu** → No és cap element d’impressió.
- **D) Un tipus d’usuari administrador** → No és cap compte d’usuari.

**Referència als apunts**
- **Pàg. 121**, apartat **7.9. Administración de colas. Cuotas de espacio**.
- **Pàg. 121**, apartat **7.9.1. Activar cuotas**.
- **Pàg. 122**, apartat **7.9.2. Aturar o desactivar una impressora**.
- **Pàg. 122**, apartat **7.9.3. Activar y desactivar cuotas de disco**.

**Nota**
- Als apunts es treballa el concepte de **cua** de manera funcional, és a dir, com a element que es pot administrar, activar, aturar o acceptar/rebutjar.

---

## 4. Què és una impressora lògica?
**Resposta correcta: B) Una configuració d’impressió definida dins del sistema**

**Per què és correcta**
- És correcta perquè una impressora lògica és la que el sistema **dona d’alta i configura** dins del servei d’impressió.

**Per què les altres no**
- **A) Una impressora que només existeix físicament** → Això seria la part física, no la configuració lògica.
- **C) Un teclat especial per imprimir** → No existeix aquest concepte en el tema.
- **D) Un monitor connectat a la impressora** → No defineix una impressora lògica.

**Referència als apunts**
- **Pàg. 114**, bloc **Objetivos** → hi apareix la idea d’**afegir i gestionar impressores lògiques**.
- **Pàg. 118–119**, apartat **7.5. CUPS. Servidor de impresión** → es mostra l’alta i configuració d’impressores al sistema.
- **Pàg. 120**, apartat **7.8.2. Seleccionar la impresora** → es veu que el sistema treballa amb impressores definides i seleccionables.

**Nota**
- El concepte surt als objectius i queda reforçat pels apartats de configuració de CUPS, encara que la definició literal curta no apareix tan directa com en altres preguntes.

---

## 5. Per a què serveix un grup d’impressió?
**Resposta correcta: A) Per unir diverses impressores sota una mateixa gestió**

**Per què és correcta**
- És la millor opció perquè un grup d’impressió serveix per gestionar conjuntament recursos d’impressió.

**Per què les altres no**
- **B) Per crear usuaris nous** → No té relació amb la impressió.
- **C) Per augmentar la memòria RAM** → No depèn del sistema d’impressió.
- **D) Per desinstal·lar controladors** → No és la finalitat d’un grup d’impressió.

**Referència als apunts**
- **Pàg. 114**, bloc **Objetivos** → hi apareix la idea d’**afegir i gestionar impressores lògiques i grups**.

**Nota**
- En les pàgines visibles del tema, aquest punt surt sobretot als **objectius** i no tan desenvolupat com CUPS, Samba o les cues. Per tant, la resposta es basa en aquesta referència directa del plantejament del tema.

---

## 6. Què permet la compartició d’impressores entre sistemes diferents?
**Resposta correcta: A) Que una impressora sigui utilitzada des de diversos equips**

**Per què és correcta**
- És correcta perquè el tema treballa la **compartició d’arxius i impressores** entre equips i també la interoperabilitat entre **Windows i Linux**.

**Per què les altres no**
- **B) Que cada usuari tingui una impressora nova** → Compartir no és duplicar.
- **C) Que la impressora funcioni sense corrent** → És absurd.
- **D) Que el sistema no necessiti controladors** → La compatibilitat i la configuració continuen sent necessàries.

**Referència als apunts**
- **Pàg. 115**, apartat **7.1. Compartir archivos e impresoras**.
- **Pàg. 116**, apartat **7.4. Servidor de archivos Samba**.
- **Pàg. 119**, apartat **7.7.3. Agregar impresora compartida en Windows con Samba**.
- **Pàg. 123**, bloc **Ejercicios prácticos** → es demana comprovar que es pot imprimir des de **Windows 10** i des d’una **distribució Linux**.

---

## 7. Quin és l’objectiu de les eines integrades del sistema operatiu en la gestió d’impressió?
**Resposta correcta: B) Instal·lar, configurar i controlar impressores i cues**

**Per què és correcta**
- És correcta perquè els apunts dediquen un bloc complet a les **eines de línia d’ordres** per al sistema d’impressió CUPS.

**Per què les altres no**
- **A) Dibuixar documents automàticament** → No és funció del sistema d’impressió.
- **C) Fer càlculs matemàtics avançats** → No hi té relació.
- **D) Crear pàgines web** → No és l’objectiu del servei d’impressió.

**Referència als apunts**
- **Pàg. 120**, apartat **7.8. Herramientas de línea de comandos para el sistema de impresión CUPS**.
- **Pàg. 120**, subapartats **7.8.1. Imprimir**, **7.8.2. Seleccionar la impresora**, **7.8.3. Definir la impresora predeterminada**.
- **Pàg. 121**, subapartats **7.8.4. Afegeix la mida del paper**, **7.8.5. Especificar opcions d’impressió**, **7.8.6. Cancel·lar un treball**, **7.8.7. Mostrar o desactivar una impressora**.
- **Pàg. 122**, subapartat **7.9.2. Aturar o desactivar una impressora**.

---

## 8. Què permet fer un servidor web d’impressió?
**Resposta correcta: A) Administrar la impressió des d’una interfície web**

**Per què és correcta**
- És correcta perquè els apunts mostren l’ús de **CUPS** des d’una interfície web, amb pantalles d’administració i configuració.

**Per què les altres no**
- **B) Navegar per Internet més ràpid** → No té res a veure amb el servei.
- **C) Instal·lar antivirus** → No és una funció del servidor d’impressió.
- **D) Compartir només carpetes** → Aquí es parla d’impressió.

**Referència als apunts**
- **Pàg. 118**, apartat **7.5. CUPS. Servidor de impresión**.
- **Pàg. 118–119**, figures de configuració de CUPS per navegador → s’hi veu la **interfície web** del servei.

---

## 9. Què s’ha de comprovar després de configurar una impressora compartida?
**Resposta correcta: B) Que la impressora imprimeix correctament i és accessible**

**Per què és correcta**
- És correcta perquè, després de configurar i compartir, cal **verificar que funciona** i que és accessible des dels equips previstos.

**Per què les altres no**
- **A) El color del monitor** → No és cap prova funcional de la impressora.
- **C) El nom de l’usuari administrador** → No verifica el servei d’impressió.
- **D) La mida del disc dur** → No és un criteri de comprovació de la impressora compartida.

**Referència als apunts**
- **Pàg. 119**, apartat **7.7.3. Agregar impresora compartida en Windows con Samba**.
- **Pàg. 120**, **Actividad propuesta 7.3** → es treballa l’alta d’una impressora remota i la comprovació del resultat.
- **Pàg. 123**, bloc **Ejercicios prácticos**, punt on es demana **comprovar que es pot imprimir** des de **Windows 10** i des d’una **distribució Linux**.

---

## 10. Per què és important documentar la configuració del sistema d’impressió?
**Resposta correcta: B) Per recordar i facilitar la gestió i el manteniment**

**Per què és correcta**
- És la millor resposta des del punt de vista d’administració de sistemes: documentar ajuda a mantenir, revisar i repetir configuracions.

**Per què les altres no**
- **A) Per decorar millor el sistema** → No és una finalitat tècnica.
- **C) Per ocupar més espai al disc** → No és cap objectiu.
- **D) Per evitar que la impressora imprimeixi** → No té sentit.

**Referència als apunts**
- **No he localitzat una frase literal tan directa com a la resta dins de les pàgines visibles del tema 7**.
- Tot i això, és una resposta coherent amb l’enfocament global del tema: configuració del servei, comprovacions, administració i manteniment.

**Nota**
- Aquesta és la pregunta on la referència als apunts és **més indirecta** que a la resta.


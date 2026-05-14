# Solucionari — RA06 - Examen teòric i pràctic

# PART TEÒRICA

## 1. Quina afirmació diferencia correctament escenari heterogeni i interoperabilitat?

**Resposta correcta: b.**

> Heterogeni vol dir que conviuen sistemes o dispositius diferents, i interoperabilitat vol dir que aquests poden treballar junts.

**Justificació**

Un escenari heterogeni és una xarxa on conviuen equips o sistemes diferents. En canvi, la interoperabilitat no és simplement que siguin diferents, sinó que aquests sistemes puguin comunicar-se i treballar junts.

**Per què les altres no són correctes**

- **a.** És incorrecta perquè heterogeni no vol dir que tots els equips utilitzin el mateix sistema, sinó justament el contrari.
- **c.** És incorrecta perquè heterogeni no fa referència només a xarxa cablejada o sense fils.
- **d.** És incorrecta perquè la interoperabilitat no elimina la necessitat d'autenticació ni permisos.

**On surt als apunts**

Document: `contingut.md`

Text dels apunts:

> “La integració de sistemes operatius consisteix a fer possible que equips diferents puguin treballar dins d'una mateixa xarxa de manera normal i funcional.”

També surt a:

Document: `contingut.md`

Text dels apunts:

> “Un escenari heterogeni de xarxa és aquell en què conviuen equips amb característiques diferents.”

I a les diapositives:

Document: `slides.md`

Text dels apunts:

> “Interoperabilitat = treballar junts”  
> “Heterogeni = elements diferents”

---

## 2. Quina de les opcions següents descriu millor la diferència entre servei i recurs?

**Resposta correcta: b.**

> El servei és el mecanisme que permet la compartició i el recurs és l'element concret ofert a la xarxa.

**Justificació**

El servei és el programa o mecanisme que permet compartir. El recurs és allò que realment s'ofereix als clients: una carpeta, una impressora, un espai compartit, etc.

**Per què les altres no són correctes**

- **a.** És incorrecta perquè client i servidor són rols de xarxa, no la diferència entre servei i recurs.
- **c.** És incorrecta perquè Samba no és l'únic servei i el recurs no sempre és una carpeta.
- **d.** És incorrecta perquè una IP o una URL poden ajudar a localitzar serveis, però no defineixen servei i recurs.

**On surt als apunts**

Document: `contingut.md`

Text dels apunts:

> “És important entendre la diferència entre el servei i el recurs. El servei és el mecanisme que fa possible la compartició. El recurs és allò que realment s'ofereix a la xarxa.”

També surt a les diapositives:

Document: `slides.md`

Text dels apunts:

> “servei → mecanisme que permet la compartició”  
> “recurs → element concret que s'ofereix a la xarxa”

---

## 3. Si en una compartició Samba tens `read only = no`, què es pot afirmar amb seguretat?

**Resposta correcta: c.**

> Que Samba no bloqueja l'escriptura, però encara cal que els permisos Linux del directori ho permetin.

**Justificació**

`read only = no` indica que Samba no està configurat com a només lectura. Ara bé, això no garanteix per si sol que el client pugui escriure. També cal que els permisos reals del directori Linux permetin l'escriptura a l'usuari que accedeix.

**Per què les altres no són correctes**

- **a.** És incorrecta perquè no qualsevol usuari de la xarxa podrà escriure. També hi ha autenticació i permisos.
- **b.** És incorrecta perquè si els permisos Linux són incorrectes, l'escriptura pot fallar.
- **d.** És incorrecta perquè el recurs pot continuar requerint usuari i contrasenya.

**On surt als apunts**

Document: `practica01Samba_manual.md`

Text dels apunts:

> “Els permisos Linux són els permisos reals del directori dins del servidor.”

També:

> “Els permisos o restriccions Samba són les condicions amb què Samba publica la carpeta a la xarxa.”

I especialment:

> “Encara que Samba estigui ben configurat, si els permisos Linux són incorrectes, el client pot veure la carpeta però no podrà treballar-hi correctament.”

També surt al bloc de configuració Samba:

```ini
read only = no
```

i s'explica com:

> “la compartició no serà només de lectura”

---

## 4. Perquè un usuari pugui accedir correctament a una carpeta compartida amb Samba, quina combinació és la més correcta?

**Resposta correcta: b.**

> Que l'usuari existeixi al sistema Linux, estigui habilitat a Samba i el recurs estigui ben publicat i permès.

**Justificació**

En Samba no n'hi ha prou que l'usuari existeixi al sistema. També ha d'estar habilitat a Samba amb `smbpasswd`, i el recurs ha d'estar correctament publicat al fitxer de configuració.

**Per què les altres no són correctes**

- **a.** És incorrecta perquè l'usuari que valida Samba ha d'existir al servidor Linux i estar configurat a Samba.
- **c.** És insuficient. Que la carpeta tingui un nom curt o estigui a la mateixa xarxa no garanteix l'accés.
- **d.** És incorrecta perquè si Samba està instal·lat però el servei no funciona, l'accés pot fallar.

**On surt als apunts**

Document: `practica01Samba_manual.md`

Text dels apunts:

> “L'usuari existeix a Linux i però ha d'estar habilitat per entrar via Samba”

També:

```bash
sudo smbpasswd -a sambauser
sudo smbpasswd -e sambauser
```

I:

> “Ara l'usuari ja existeix al sistema Linux, existeix a Samba i pot ser utilitzat per autenticar l'accés a la carpeta compartida”

---

## 5. Després d'editar `/etc/samba/smb.conf`, quina comanda és la més adequada abans de reiniciar `smbd`?

**Resposta correcta: b.**

```bash
testparm
```

**Justificació**

`testparm` comprova la configuració de Samba abans de reiniciar el servei. Això permet detectar errors de sintaxi o configuració abans d'aplicar els canvis.

**Per què les altres no són correctes**

- **a. `lpstat -t`** és una comanda de CUPS, no de Samba.
- **c. `ip a`** mostra informació de xarxa, però no comprova Samba.
- **d. `lpinfo -v`** serveix per veure dispositius d'impressió, no per validar Samba.

**On surt als apunts**

Document: `practica01Samba_manual.md`

Text dels apunts:

> “Abans de reiniciar Samba, comprova que no hi ha errors de sintaxi:”

```bash
testparm
```

També:

> “Aquesta ordre revisa el fitxer de configuració”

I:

> “No reiniciïs Samba fins que `testparm` no sigui correcte”

---

## 6. Què confirma exactament la sortida `scheduler is running` quan s'executa `lpstat -r`?

**Resposta correcta: c.**

> Que el planificador de CUPS està en funcionament.

**Justificació**

`lpstat -r` comprova si el planificador de CUPS està actiu. Si retorna `scheduler is running`, vol dir que CUPS està en funcionament a nivell de servei d'impressió.

**Per què les altres no són correctes**

- **a.** No confirma que la impressora ja estigui compartida.
- **b.** No indica la impressora per defecte.
- **d.** No confirma que Windows ja pugui veure la impressora.

**On surt als apunts**

Document: `practica02Cups_manual.md`

Text dels apunts:

> “Comprova si CUPS està instal·lat al servidor.”

```bash
lpstat -r
```

I:

> “Si CUPS està instal·lat i el planificador està en funcionament, veuràs una sortida semblant a aquesta:”

```text
scheduler is running
```

---

## 7. Quin és el propòsit principal de la comanda `sudo cupsctl --remote-admin --remote-any --share-printers`?

**Resposta correcta: b.**

> Activar administració remota, accés remot i compartició d'impressores a CUPS.

**Justificació**

Aquesta comanda prepara CUPS perquè pugui ser administrat remotament i perquè pugui compartir impressores a la xarxa.

**Per què les altres no són correctes**

- **a.** No crea cap impressora nova.
- **c.** No reinicia CUPS ni obre el port 631. El reinici es fa amb `systemctl restart cups` i el port amb `ufw allow 631/tcp`.
- **d.** No afegeix cap usuari al grup `lpadmin`.

**On surt als apunts**

Document: `practica02Cups_manual.md`

Text dels apunts:

```bash
sudo cupsctl WebInterface=yes
sudo cupsctl --remote-admin --remote-any --share-printers
```

I:

> “Això fa 3 coses:”

> “activa la interfície web”  
> “permet administració remota”  
> “activa la compartició d'impressores”

**Nota important de correcció**

Al PDF de l'examen es veu la comanda amb un guió llarg a `–share-printers`. La forma correcta de la comanda és amb dos guions normals:

```bash
sudo cupsctl --remote-admin --remote-any --share-printers
```

---

## 8. Quin és el format manual que es fa servir al client Windows per intentar afegir una impressora compartida des del servidor CUPS?

**Resposta correcta: c.**

```text
http://IP_DEL_SERVIDOR:631/printers/aula1
```

**Justificació**

Quan Windows no detecta automàticament la impressora, es pot provar d'afegir-la manualment amb la URL del servidor CUPS, el port 631 i el nom de la cua d'impressió.

**Per què les altres no són correctes**

- **a.** És un format més propi de recurs compartit SMB/Samba, no del CUPS via IPP/URL.
- **b.** No és el format treballat al manual.
- **d.** No és el format indicat als apunts.

**On surt als apunts**

Document: `practica02Cups_manual.md`

Text dels apunts:

> “Després selecciona l'opció per afegir una impressora per nom o per URL i escriu una adreça com aquesta:”

```text
http://LA_TEVA_IP:631/printers/aula1
```

---

## 9. Quina comanda és la més completa per obtenir informació general de diagnosi a CUPS?

**Resposta correcta: a.**

```bash
lpstat -t
```

**Justificació**

`lpstat -t` mostra informació general del sistema d'impressió: planificador, impressora predeterminada, impressores configurades i cua de treballs.

**Per què les altres no són correctes**

- **b. `lpstat -r`** només comprova si el planificador està en funcionament.
- **c. `systemctl status cups`** comprova l'estat del servei, però no dona la informació general d'impressores i cues.
- **d. `ping 127.0.0.1`** només comprova connectivitat local, no CUPS.

**On surt als apunts**

Document: `practica02Cups_manual.md`

Text dels apunts:

```bash
lpstat -t
```

I:

> “Mostra:”

> “si el planificador està actiu”  
> “quina impressora és la predeterminada”  
> “quines impressores hi ha”  
> “si hi ha treballs a la cua”

També:

> “És una de les millors ordres de diagnosi per aquesta pràctica”

---

## 10. Quin dels casos següents demostra millor la interoperabilitat que treballa la RA06?

**Resposta correcta: c.**

> Un client Windows accedeix a una carpeta compartida del servidor Linux i també imprimeix sobre una impressora compartida gestionada des d'aquest servidor.

**Justificació**

Aquest cas és el que millor demostra interoperabilitat perquè hi ha sistemes diferents treballant junts i utilitzant recursos compartits: carpeta i impressora.

**Per què les altres no són correctes**

- **a.** Tenir Samba i CUPS instal·lats no demostra interoperabilitat si cap client els utilitza.
- **b.** El `ping` només confirma connectivitat bàsica, però no ús de recursos compartits.
- **d.** Detectar una impressora local o crear una carpeta no demostra ús des d'un altre sistema.

**On surt als apunts**

Document: `contingut.md`

Text dels apunts:

> “En la pràctica, aquesta interoperabilitat es concreta sobretot en tres necessitats bàsiques:”

> “accedir a carpetes i fitxers compartits”  
> “utilitzar impressores de xarxa”  
> “controlar l'accés als recursos mitjançant usuaris i permisos”

També surt a l'exemple real:

> “Si els usuaris poden entrar a una carpeta comuna, guardar-hi documents i, a més, imprimir sobre una impressora compartida des de diferents equips, llavors podem dir que hi ha una integració efectiva entre sistemes diferents.”

---

# PART PRÀCTICA — Respostes

## 1. Incidència en una compartició Samba

### 1.a. Dues comandes per comprovar si el problema és de permisos o de configuració Samba

```bash
ls -ld /srv/deptdocs
````

```bash
testparm
```

```bash
sudo nano /etc/samba/smb.conf
```

La comanda `ls -ld /srv/deptdocs` permet veure els permisos Linux reals del directori: propietari, grup i permisos.

La comanda `testparm` permet comprovar si la configuració de Samba és correcta i si el fitxer `smb.conf` té errors de sintaxi  

---

### 1.b. Dues causes tècniques possibles del problema

Una **primera causa** possible és que la compartició Samba estigui configurada com a només lectura  

Per exemple, si al fitxer `/etc/samba/smb.conf` apareix:

```ini
read only = yes
```

L'usuari podrà entrar i llegir però Samba no permetrà crear ni modificar fitxers

Una **segona causa** possible és que els permisos Linux del directori `/srv/deptdocs` no permetin escriure a l'usuari que hi accedeix

Encara que Samba tingui:

```ini
read only = no
```

si els permisos reals del directori no permeten escriptura, el client podrà veure la carpeta però no podrà crear ni modificar documents

---

### 1.c. Fragment correcte de configuració Samba

```ini
[deptdocs]
   path = /srv/deptdocs
   browseable = yes
   read only = no
   valid users = alumne6
```

Aquest fragment indica que:

* `deptdocs`              => és el nom visible del recurs a la xarxa  
* `/srv/deptdocs`         => és la ruta real del directori al servidor  
* `browseable = yes`      => permet que el recurs sigui visible  
* `read only = no`        => indica que no és només de lectura  
* `valid users = alumne6` => limita l'accés només a l'usuari `alumne6`  

---

## 2. Incidència en una impressora compartida amb CUPS

### 2.a. Tres comandes per comprovar l'estat de CUPS, el tallafoc i la cua d'impressió

```bash
systemctl status cups
```

```bash
sudo ufw status
```

```bash
lpstat -t
```

```bash
lpstat -o
```

La comanda `systemctl status cups` comprova si el servei CUPS està actiu  

La comanda `sudo ufw status` comprova si el tallafoc està actiu i si podria bloquejar el port de CUPS   

La comanda `lpstat -t` mostra informació general del sistema d'impressió: estat del planificador, impressores configurades, impressora predeterminada i treballs a la cua   

---

### 2.b. URL manual per afegir la impressora des del client Windows

```bash
# url vàlida
http://IP_DEL_SERVIDOR:631/printers/aula1

# url no completa però també vàlida
http://IP_DEL_SERVIDOR:631/aula1
```
El més important que surti:
* port       => `631`
* impressora => `aula1`

---

### 2.c. Dues causes tècniques possibles per les quals el client no veu la impressora o no hi pot imprimir

Una primera causa possible és que el tallafoc bloquegi el port `631/TCP`

Si el tallafoc està actiu i no s'ha permès el port de CUPS, el client pot no arribar al servei. La comanda per permetre'l seria:

```bash
sudo ufw allow 631/tcp
```

Una segona causa possible és que la impressora no estigui compartida o que CUPS no permeti l'accés remot

Caldria revisar que s'hagi executat correctament:

```bash
sudo cupsctl --remote-admin --remote-any --share-printers
```

Altres causes possibles serien:

* la URL està mal escrita
* el nom de la cua `aula1` no coincideix
* la impressora està pausada
* hi ha un problema de controlador al client Windows

---

# Respostes test

| Pregunta | Resposta correcta |
|---|---|
| 1 | b |
| 2 | b |
| 3 | c |
| 4 | b |
| 5 | b |
| 6 | c |
| 7 | b |
| 8 | c |
| 9 | a |
| 10 | c |

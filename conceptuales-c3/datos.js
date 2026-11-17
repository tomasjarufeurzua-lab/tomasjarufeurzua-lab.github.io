// Contenido de las 20 preguntas conceptuales (FIS121 · Certamen 3), en el orden en que salen:
// primero la Parte A (las más probables) y después la Parte B.
// Para editar una pregunta basta con cambiar este archivo: las animaciones viven en anim-*.js
// y se eligen por el campo "animacion".
// Texto: los párrafos se separan con una línea en blanco, "- " al inicio de línea es un punto
// de lista, **así** es negrita y las fórmulas van entre $...$ (en línea) o $$...$$ (bloque).
window.PREGUNTAS = [
  // ===================== PARTE A · Las más probables =====================
  {
    id: 1, parte: 'A', tema: 'Ecuaciones de Maxwell',
    titulo: 'Ampère–Maxwell y corriente de desplazamiento',
    enunciado: String.raw`Al cargar un condensador, la ley de Ampère con una superficie plana atravesada por el cable da $\mu_0 I$, pero con una superficie "abombada" que pasa entre las placas (mismo borde $\Gamma$) da $0$. ¿Cuál es el problema? Entre las placas no pasan cargas: ¿qué magnitud sí cambia? ¿Cómo lo resolvió Maxwell?`,
    dibujo: 'condensador',
    respuesta: String.raw`$\oint_\Gamma \vec B\cdot d\vec l$ depende solo del borde $\Gamma$, así que debe dar lo mismo con **cualquier** superficie que tenga ese borde. La ley de Ampère original **se contradice** cuando la carga se acumula (corriente no estacionaria).

Entre las placas no pasan cargas, pero el **campo eléctrico aumenta** ($E=\frac{q}{\varepsilon_0 A}$). Maxwell definió la **corriente de desplazamiento** y la agregó:
$$I_d=\varepsilon_0\frac{d\phi_E}{dt},\qquad \oint\vec B\cdot d\vec l=\mu_0\Big(I_{enl}+\varepsilon_0\frac{d\phi_E}{dt}\Big)$$
Entre las placas $I_d=I$, así que **las dos superficies dan $\mu_0 I$**: por una pasa $I$ y por la otra $I_d$. La "corriente total" $I+I_d$ es continua. Consecuencia: **entre las placas hay campo magnético**, aunque no pase carga.`,
    animacion: 'condensador', animTitulo: 'El condensador que se carga',
    ideaClave: String.raw`Un $\vec E$ que cambia crea $\vec B$, igual que una corriente.`,
  },
  {
    id: 2, parte: 'A', tema: 'Ecuaciones de Maxwell',
    titulo: 'Gauss magnético y monopolos',
    enunciado: String.raw`¿Por qué el flujo magnético por cualquier superficie **cerrada** es cero? ¿Qué cambiaría en las ecuaciones de Maxwell si existieran monopolos magnéticos?`,
    respuesta: String.raw`$\oint\vec B\cdot d\vec A=0$ porque **no existen monopolos magnéticos**: las líneas de $\vec B$ son siempre **cerradas**, así que toda línea que entra a una superficie cerrada también sale. Si partes un imán, obtienes dos imanes, cada uno con N y S.

Con monopolos habría una "carga magnética" $q_m$ y Gauss magnético quedaría como el eléctrico: $\oint\vec B\cdot d\vec A=\mu_0 q_m$. Además, Faraday ganaría un segundo término (ver Pregunta 3).`,
    animacion: 'gauss-magnetico', animTitulo: 'Líneas que entran y salen',
    ideaClave: String.raw`Las líneas de $\vec B$ no tienen dónde empezar ni terminar.`,
  },
  {
    id: 3, parte: 'A', tema: 'Ecuaciones de Maxwell',
    titulo: '¿Por qué Faraday tiene un solo término?',
    enunciado: String.raw`La ley de Ampère–Maxwell tiene dos términos, pero la de Faraday tiene uno. ¿Por qué? ¿Qué simetría tienen las dos leyes?`,
    respuesta: String.raw`$\vec B$ se crea de dos formas: con **corriente** (cargas en movimiento) y con un **$\vec E$ que cambia**. Para el $\vec E$ que da vueltas solo existe la segunda forma: un **$\vec B$ que cambia**. El término equivalente a la corriente sería una "corriente magnética" de **monopolos en movimiento**, que no existen. Si existieran:
$$\oint\vec E\cdot d\vec l=-\mu_0 I_m-\frac{d\phi_B}{dt}$$
**Simetría:** un $\vec B$ variable crea $\vec E$ (Faraday) y un $\vec E$ variable crea $\vec B$ (Maxwell). Uno alimenta al otro, y por eso existen las **ondas electromagnéticas** (la luz), que viajan sin necesitar cargas ni corrientes.`,
    animacion: null,
    ideaClave: String.raw`$\vec E$ que cambia ⇄ $\vec B$ que cambia: así viaja la luz.`,
  },
  {
    id: 4, parte: 'A', tema: 'Transformador',
    titulo: 'Corriente continua y núcleo de hierro',
    enunciado: String.raw`¿Por qué un transformador no funciona con corriente continua? ¿Para qué sirve el núcleo de hierro?`,
    respuesta: String.raw`Funciona por **inducción**: la secundaria tiene fem solo si el flujo **cambia**, $\varepsilon_s=-N_s\,d\phi/dt$. Con corriente continua el flujo es constante y $\varepsilon_s=0$ (salvo un pulso al conectar). Además, la primaria quedaría limitada solo por la pequeña resistencia de su alambre y se calentaría.

El **núcleo de hierro** guía las líneas de campo de una bobina a la otra: casi todo el flujo de la primaria pasa por la secundaria y cada vuelta de ambas ve el mismo $\phi$. De ahí sale $\dfrac{V_s}{V_p}=\dfrac{N_s}{N_p}$.`,
    animacion: 'transformador-acdc', animTitulo: 'Transformador AC vs DC',
    ideaClave: 'Sin cambio de flujo no hay fem.',
  },
  {
    id: 5, parte: 'A', tema: 'Transformador',
    titulo: '¿El transformador crea energía? Alta tensión',
    enunciado: String.raw`Un transformador elevador entrega más voltaje del que recibe. ¿Crea energía? ¿Por qué la electricidad se transmite en alta tensión?`,
    respuesta: String.raw`**No.** En un transformador ideal se conserva la potencia: $V_pI_p=V_sI_s$. Si el voltaje sube $k$ veces, la corriente baja $k$ veces. (En uno real se pierde un poco como calor en los cables y en el núcleo.)

Se transmite en **alta tensión** porque, para la misma potencia, la corriente es menor, y las pérdidas en los cables son $I^2R$: con $10$ veces menos corriente se pierde **$100$ veces menos**.`,
    animacion: 'potencia-linea', animTitulo: 'Balanza de potencia y línea de transmisión',
    notaAnim: String.raw`Para el certamen **no es necesario** saber calcular la potencia que se disipa en los cables ($I^2R$): basta con entender que pierde mucho menos cuando la corriente es menor.`,
    ideaClave: String.raw`Más voltaje, menos corriente, mucho menos pérdida ($\propto I^2$).`,
  },
  {
    id: 6, parte: 'A', tema: 'Transformador',
    titulo: 'El transformador del poste',
    enunciado: String.raw`El transformador de un poste recibe alta tensión y entrega el voltaje de las casas. ¿Qué lado tiene más vueltas?`,
    respuesta: String.raw`Como $\dfrac{V_s}{V_p}=\dfrac{N_s}{N_p}$ y se quiere $V_s<V_p$ (reductor), el lado de **alta tensión** (primaria) tiene **más vueltas**. Por el lado de las casas circula más corriente, y suele usar alambre más grueso.`,
    animacion: 'arma-transformador', animTitulo: 'Arma tu transformador',
    ideaClave: 'Lado de alta tensión = más vueltas.',
  },
  {
    id: 7, parte: 'A', tema: 'Faraday y Lenz',
    titulo: '¿Qué induce una fem?',
    enunciado: String.raw`¿Qué es lo que induce una fem? Diga si se induce corriente en cada caso: (a) una espira quieta en un campo muy intenso pero constante; (b) una espira que se traslada sin girar en un campo uniforme; (c) una espira que se aleja de un alambre con corriente.`,
    respuesta: String.raw`Lo que induce es que el **flujo cambie**, $\varepsilon=-d\phi/dt$, no que el campo sea grande. Como $\phi=BA\cos\theta$, el flujo cambia si cambia $B$, $A$ o $\theta$.
- (a) **No:** $\phi$ es constante, aunque sea enorme.
- (b) **No:** $B$, $A$ y $\theta$ no cambian. (Visto con barras: los dos lados opuestos tienen la misma $vBL$ en sentidos contrarios y se cancelan.)
- (c) **Sí:** $B\propto 1/x$ no es uniforme, y al alejarse la espira entra en zonas de menos campo, así que $\phi$ disminuye.

(Si la espira gira, cambia $\theta$ y sí hay fem: ver Pregunta 11.)`,
    animacion: 'tres-escenarios', animTitulo: 'Tres escenarios',
    ideaClave: String.raw`Flujo constante → $\varepsilon=0$. Flujo que cambia → hay corriente.`,
  },
  {
    id: 8, parte: 'A', tema: 'Faraday y Lenz',
    titulo: 'El signo menos y la energía',
    enunciado: String.raw`¿Por qué la ley de Faraday lleva signo menos? ¿Qué pasaría si fuera positivo? ¿De dónde sale la energía que se disipa en la espira?`,
    respuesta: String.raw`El menos (Lenz) dice que la corriente inducida **se opone al cambio** de flujo, y es una consecuencia de la **conservación de la energía**. Si fuera $+$, la corriente reforzaría el cambio: un imán que se acerca sería atraído, se aceleraría solo, induciría más corriente, y así sin fin. Se obtendría energía de la nada.

Con el menos, la espira frena al imán (o a la barra): quien lo mueve tiene que hacer **trabajo**, y **ese trabajo** es la energía que se disipa como calor $I^2R$. En la barra que cae, a velocidad terminal, $mg\,v_T=I^2R$.`,
    animacion: 'signo-faraday', animTitulo: 'Universo con signo + vs signo −',
    ideaClave: 'El signo menos es la conservación de la energía.',
  },
  {
    id: 9, parte: 'A', tema: 'Faraday y Lenz',
    titulo: 'Imán y aro (Lenz)',
    enunciado: String.raw`Se acerca el polo Norte de un imán a un aro conductor. ¿En qué sentido circula la corriente inducida (vista desde el imán)? ¿El aro atrae o repele al imán? ¿Qué cambia si el imán se aleja, o si es el polo Sur?`,
    respuesta: String.raw`Al acercarse, el flujo del imán hacia el aro ($\rightarrow$) **aumenta**. La corriente inducida crea un $\vec B_{ind}$ hacia el imán ($\leftarrow$): **vista desde el imán, la corriente es antihoraria**. Esa cara del aro se comporta como un polo **Norte** frente al Norte del imán: el aro **repele** al imán (se opone a que se acerque).

**Si se aleja:** el flujo disminuye, la corriente se invierte (horaria vista desde el imán) y el aro lo **atrae** (se opone a que se vaya).

**Con el polo Sur:** todo se invierte, pero la regla es la misma: **siempre se opone al movimiento**.`,
    animacion: 'iman-aro', animTitulo: 'Imán y aro',
    ideaClave: 'Se acerca → el flujo aumenta → repele. Se aleja → el flujo disminuye → atrae.',
  },
  {
    id: 10, parte: 'A', tema: 'Faraday y Lenz',
    titulo: 'Barra en movimiento sin circuito',
    enunciado: String.raw`Una barra metálica de largo $L$ se mueve con velocidad $\vec v$ hacia la derecha en un campo $\vec B$ que sale de la pantalla, **sin** estar conectada a nada. ¿Qué pasa con sus cargas? ¿Hay corriente? ¿Qué extremo queda a mayor potencial?`,
    respuesta: String.raw`Cada carga siente $\vec F=q\vec v\times\vec B$. Con $\vec v=v\hat\imath$ y $\vec B=B\hat k$: $\hat\imath\times\hat k=-\hat\jmath$, así que las cargas **positivas** son empujadas hacia **abajo** (y los electrones hacia arriba). Se acumula carga hasta que el campo eléctrico interno equilibra la fuerza magnética: $qE=qvB$.

Queda una diferencia de potencial $\Delta V=vBL$ con el extremo **inferior** a mayor potencial, pero **no hay corriente sostenida** porque el circuito no está cerrado. Si se conecta a rieles, esa $\Delta V$ actúa como una pila y circula $I=vBL/R$.`,
    animacion: 'barra-cargas', animTitulo: 'Separación de cargas',
    ideaClave: String.raw`Sin circuito: solo $\Delta V$. Con circuito: corriente.`,
  },
  {
    id: 11, parte: 'A', tema: 'Faraday y Lenz',
    titulo: 'Espira que gira (generador)',
    enunciado: String.raw`Una espira gira con rapidez angular constante en un campo uniforme. ¿En qué posición la fem es máxima? ¿Y cuándo es cero?`,
    respuesta: String.raw`$\phi=BA\cos(\omega t)$, así que $\varepsilon=BA\omega\sin(\omega t)$.

**Máxima** cuando $\sin(\omega t)=\pm1$: la normal está **perpendicular** a $\vec B$ (el plano de la espira es paralelo al campo). En ese instante el flujo es **cero**, pero es cuando cambia más rápido.

**Cero** cuando la normal es paralela a $\vec B$: el flujo es máximo, pero por un instante deja de cambiar ("da la vuelta"). La fem depende de $d\phi/dt$, no de $\phi$.`,
    animacion: 'generador', animTitulo: 'Generador',
    ideaClave: 'La fem depende de qué tan rápido cambia el flujo, no de cuánto flujo hay.',
  },
  {
    id: 12, parte: 'A', tema: 'Faraday y Lenz',
    titulo: 'Cocina de inducción (salió en el certamen anterior)',
    enunciado: String.raw`Una cocina de inducción calienta ollas con un campo magnético. Con dos ollas iguales, una de acero y otra de greda, ¿qué condición debe cumplir el campo y cuál calienta mejor el agua?`,
    respuesta: String.raw`El campo debe ser **variable** (corriente alterna en la bobina de la cocina): solo así cambia el flujo y se inducen fem. La olla de **acero** es conductora, así que en su base se inducen corrientes (**corrientes de Foucault**) que la calientan por efecto Joule ($I^2R$), y el calor pasa al agua. La **greda** es aislante: aunque se induzca fem, no circula corriente y no se calienta. (Con un campo constante no calentaría ninguna.)`,
    animacion: 'cocina-induccion', animTitulo: 'Cocina de inducción',
    ideaClave: 'Campo variable + material conductor = calor.',
  },
  {
    id: 13, parte: 'A', tema: 'Inductancia',
    titulo: 'Sentido de la fem autoinducida',
    enunciado: String.raw`Por una espira circula una corriente $I(t)$. ¿Cuál es el sentido de la fem autoinducida si (a) $I$ aumenta, (b) $I$ es constante, (c) $I$ disminuye?`,
    respuesta: String.raw`$\varepsilon_L=-L\,\frac{dI}{dt}$: la bobina se opone a que la corriente **cambie**.
- (a) **Aumenta:** $\varepsilon_L$ va **en contra** de $I$ (frena la subida).
- (b) **Constante:** $\varepsilon_L=0$, aunque haya mucho campo.
- (c) **Disminuye:** $\varepsilon_L$ va **a favor** de $I$ (trata de mantenerla).

Por eso una bobina actúa como la "inercia" de la corriente.`,
    animacion: 'inercia-corriente', animTitulo: 'La inercia de la corriente',
    ideaClave: 'La bobina no se opone a la corriente: se opone a que cambie.',
  },
  {
    id: 14, parte: 'A', tema: 'Inductancia',
    titulo: '¿De qué depende $L$?',
    enunciado: String.raw`¿De qué depende la autoinductancia $L$ de una bobina? Si se duplica el número de vueltas, ¿qué pasa con $L$?`,
    respuesta: String.raw`$L=N\phi_1/I$ depende solo de la **geometría** (forma, tamaño, $N$ y el material del núcleo); la corriente siempre se cancela. Para un solenoide, $L=\mu_0 N^2 A/\ell$.

Con $2N$, $L$ se multiplica por **4**: el campo (y el flujo por vuelta) se duplica, y además ese flujo atraviesa el doble de vueltas.`,
    animacion: 'solenoide-L', animTitulo: 'Solenoide configurable',
    ideaClave: String.raw`$L$ es geometría: $L\propto N^2$.`,
  },
  {
    id: 15, parte: 'A', tema: 'Inductancia',
    titulo: 'Cerrar y abrir el interruptor',
    enunciado: String.raw`Se cierra el interruptor de la bobina primaria (conectada a una batería). ¿Qué ocurre en la secundaria al cerrar, mientras el interruptor sigue cerrado y al abrir?`,
    respuesta: String.raw`**Al cerrar:** $I_1$ sube de $0$ a su valor final, el flujo aumenta y la secundaria tiene un **pulso** de corriente en sentido **contrario** al de la primaria (se opone al aumento).

**Cerrado (corriente constante):** el flujo no cambia, así que $\varepsilon_2=0$ y no hay corriente, aunque el campo sea grande.

**Al abrir:** $I_1$ cae, el flujo disminuye y hay un pulso en el **mismo** sentido que la primaria. Este es el principio del transformador, y la razón por la que con corriente continua no funciona.`,
    animacion: 'interruptor', animTitulo: 'Interruptor y secundaria',
    ideaClave: 'Solo hay fem en la secundaria mientras la corriente de la primaria cambia.',
  },
  {
    id: 16, parte: 'A', tema: 'Inductancia',
    titulo: String.raw`$M_{12}=M_{21}$`,
    enunciado: String.raw`Para calcular la inductancia mutua entre un alambre infinito y un toroide (o una espira rectangular), ¿conviene calcular el flujo del alambre por la bobina o el de la bobina por el alambre? ¿Por qué se puede elegir?`,
    respuesta: String.raw`Porque $M_{12}=M_{21}$: la inductancia mutua es una propiedad del **par de circuitos**, no de cuál lleva la corriente. Entonces se elige el cálculo **fácil**: el campo del alambre se conoce ($\frac{\mu_0 I}{2\pi r}$) y se integra su flujo por la bobina. Calcular el flujo del toroide "a través del alambre" no tiene sentido directo (el alambre no encierra un área definida, y fuera del toroide $B=0$).`,
    animacion: 'mutua', animTitulo: 'Dos caminos, mismo M',
    ideaClave: String.raw`Elige el flujo que sepas calcular: $M_{12}=M_{21}$.`,
  },

  // ===================== PARTE B · No creo que salgan, pero podrían =====================
  {
    id: 17, parte: 'B', tema: 'Ley de Ampère',
    titulo: 'Dos alambres paralelos',
    enunciado: String.raw`Dos alambres paralelos muy largos llevan corrientes iguales. ¿Existe un punto entre ellos donde $\vec B=0$ si las corrientes van en el mismo sentido? ¿Y si van en sentidos opuestos?`,
    respuesta: String.raw`**Mismo sentido:** sí, en el **punto medio**. Ahí cada campo vale $\frac{\mu_0 I}{2\pi(d/2)}$ y, con $\hat B=\hat u_I\times\hat r$, los vectores $\hat r$ son opuestos, así que los campos son opuestos y se anulan.

**Sentidos opuestos:** entre los alambres los dos campos apuntan igual y **se suman**: no hay cero. (Afuera tampoco hay cero, porque el alambre más cercano siempre domina.)`,
    animacion: 'dos-alambres', animTitulo: 'Mapa de campo de dos alambres',
    ideaClave: 'Mismo sentido → se cancelan entre ellos. Opuestos → se suman entre ellos.',
  },
  {
    id: 18, parte: 'B', tema: 'Ley de Ampère',
    titulo: '¿Cuándo sirve Ampère?',
    enunciado: String.raw`La ley de Ampère siempre se cumple. ¿Cuándo **sirve** para calcular $B$? Dé ejemplos donde sirve y donde no.`,
    respuesta: String.raw`Sirve cuando la simetría permite elegir un loop donde, en cada tramo, $\vec B\parallel d\vec l$ con módulo constante (así $B$ sale de la integral), o $\vec B\perp d\vec l$, o $B=0$.

**Sirve:** alambres y cilindros infinitos (círculos), solenoide largo (rectángulo), toroide (círculo) y planos infinitos.

**No sirve:** alambre finito, espira circular, dos alambres juntos. La igualdad es cierta, pero $B$ cambia a lo largo de cualquier loop y no se puede despejar; ahí se usa Biot–Savart o superposición. Además, con corrientes que no son estacionarias hay que agregar el término de Maxwell (Pregunta 1).`,
    animacion: 'sirve-ampere', animTitulo: '¿Se puede despejar B?',
    ideaClave: 'Ampère siempre es verdad; solo es útil con simetría.',
  },
  {
    id: 19, parte: 'B', tema: 'Ley de Ampère',
    titulo: 'Solenoide: dirección y campo afuera',
    enunciado: String.raw`En un solenoide muy largo, ¿cuál es la dirección del campo adentro? ¿Por qué afuera es cero y adentro es uniforme?`,
    respuesta: String.raw`**Dirección:** por la regla de la mano derecha, con los dedos siguiendo la corriente (⊙ arriba, ⊗ abajo), el pulgar apunta a lo largo del eje (en el dibujo, hacia la derecha).

**Afuera $B=0$:** un loop con sus dos lados largos afuera no encierra corriente, así que $B$ es igual a cualquier distancia; como lejos debe ser $0$, es $0$ en todo el exterior. Físicamente, afuera los cables de arriba y los de abajo empujan el campo en sentidos opuestos y se cancelan; adentro empujan en el mismo sentido y se suman.

**Adentro uniforme:** un loop con un lado adentro da $B\ell=\mu_0 n\ell I$ **a cualquier altura**, así que $B=\mu_0 nI$ en todo el interior.`,
    animacion: 'construye-solenoide', animTitulo: 'Construyendo el solenoide',
    ideaClave: 'Adentro se suman, afuera se cancelan.',
  },
  {
    id: 20, parte: 'B', tema: 'Ley de Ampère',
    titulo: 'Toroide',
    enunciado: String.raw`En un toroide, ¿por qué el campo es cero en el hueco y afuera, y por qué adentro no es uniforme?`,
    respuesta: String.raw`Un círculo en el hueco ($r<a$) no encierra corriente. Uno afuera ($r>b$) corta cada vuelta dos veces, una de subida y una de bajada, y la corriente neta es cero. Dentro del núcleo encierra $N$ vueltas: $B=\frac{\mu_0 N I}{2\pi r}$.

**No es uniforme** porque la misma corriente encerrada se reparte en círculos más largos a mayor $r$. Por eso el flujo se calcula con franjas y aparece $\ln(b/a)$.`,
    animacion: 'toroide', animTitulo: 'Loops en el toroide',
    ideaClave: 'Afuera, cada vuelta se corta dos veces y se cancela.',
  },
];

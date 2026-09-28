# Regole del bot e perché esistono

Elenco di controllo per riscrivere il prompt senza perdere per strada le regole che contano. Si riferisce a `AI_Bot_Instructions_20260928.js`, il prompt organizzato lungo le sette fasi della conversazione e tradotto dai diagrammi in `Flowcharts/`, e a `spo_schema.json`. Per ogni regola, la riga *Nel 0928* dice dove si trova. Le stesse regole esistono anche in `AI_Bot_Instructions_20260926.js`, che però ha una struttura a funzioni, con posizioni diverse; l'unica differenza di comportamento è che il 0926 annulla senza chiedere conferma.

Le regole del **gruppo 1** sono nate ciascuna da un errore osservato in un test reale: toglierle significa quasi certamente rivedere quel comportamento. Quelle del **gruppo 2** vengono dalla revisione del 2026-09-26 e dal controllo del 0928 del 2026-09-28: sono difetti trovati leggendo e simulando le conversazioni, non ancora visti in un test, ma ognuna chiude un caso in cui il bot si bloccava, perdeva dati o faceva rifiutare il turno dal parser. Quelle del **gruppo 3** sono scelte di progetto, modificabili se vuoi un bot che si comporta diversamente.

Metodo consigliato: riscrivi la struttura come preferisci, poi rileggi questo elenco e spunta ogni voce verificando che nel nuovo testo ci sia.

---

## Gruppo 1 — Regole nate da un bug

- [ ] **Le note si copiano alla lettera, per intero, senza accorciare.** Una nota con più elementi è un unico testo, non un elenco fra cui scegliere.
  *Bug:* `"Hanno il tavolo da biliardo e il caffè"` veniva registrato troncato alla congiunzione: il modello leggeva `X e Y` come due valori candidati e ne sceglieva uno.
  *Nel 0928:* FASE 5 (COME LEGGI LA RISPOSTA), `<vietato>`.

- [ ] **Nella risposta alle note il riconoscimento dei campi è sospeso.** Nomi di persona, città, aziende, titoli di ruolo e URL che compaiono in una nota restano parte della nota e non aggiornano nessun altro campo. Anche le uscite (annullamento) e il riconoscimento del link non valgono lì.
  *Bug:* rispondendo `"Il titolare è bravo"` il bot reagiva alla parola "titolare", letta come titolo di ruolo.
  *Nel 0928:* FASE 5 (COME LEGGI LA RISPOSTA); l'eccezione è richiamata anche nel `<percorso>` (COME SI PASSA DA UNA FASE ALL'ALTRA), nelle `<uscite>` (LE USCITE SI CONTROLLANO PER PRIME) e nella FASE 4 (IL LINK).

- [ ] **I turni link e note non si incrociano mai.** Nel link va solo l'URL della risposta al link; nelle note va la risposta alle note. La definizione del link non deve nominare il campo note: rimanda alla sospensione descritta nella fase 5.
  *Bug:* il link finiva nella colonna Note. La causa era una frase infelice, *"resta parte della nota"*, scritta dentro la definizione del **link**. La revisione del 2026-09-26 ha trovato la stessa forma tornata nel 0926 ("dove un URL resta nella nota") e l'ha tolta; nel 0928 la definizione dice solo "tranne durante la sospensione descritta in FASE 5".
  *Nel 0928:* FASE 4 (IL LINK, e "nel link va solo l'URL" in COME LEGGI LA RISPOSTA), `<vietato>`.

- [ ] **La conferma finale è in due turni distinti.** Prima si riepiloga e si chiede conferma (`pronto_per_registrazione: false`, `eventi: []`), poi, solo dopo un sì, si registra. Mai dire "Ho registrato" prima di averlo fatto.
  *Bug:* prompt ed esempio si contraddicevano (l'esempio diceva "Ho registrato" mentre il flusso imponeva di attendere) e il bot risolveva chiedendo il pollice alzato. La revisione ha trovato la stessa contraddizione nello schema: la descrizione di `pronto_per_registrazione` non parlava della conferma.
  *Nel 0928:* FASE 6 (DOMANDA), FASE 7 (REGISTRA), `<output>`, gli esempi FASE 6 e FASE 7, `<vietato>`; nello schema, la descrizione di `pronto_per_registrazione`.

- [ ] **Il bot legge le emoji ma non le chiede e non le scrive mai.** Slack le consegna come testo (`:+1:`, `:-1:`), quindi vanno riconosciute anche in quella forma.
  *Bug:* stessa origine della precedente: chiedeva `👍` per confermare, violando anche la propria regola di formattazione.
  *Nel 0928:* `<output>` STILE, FASE 7 (COME LEGGI LA RISPOSTA), `<vietato>`.

- [ ] **Il sì o il no alla conferma è un segnale di controllo: non finisce in nessun campo.** I dati contenuti nella risposta (`"no, l'azienda è Beta SpA"`) invece aggiornano i campi.
  *Bug:* reintrodotta la conferma, l'ultimo messaggio dello studente non era più la nota ma il "sì", che rischiava di essere registrato come tale.
  *Nel 0928:* FASE 7 (COME LEGGI LA RISPOSTA), `<vietato>`.

- [ ] **In `campi_raccolti`, `""` e `"non fornito dallo studente"` sono cose diverse.** Stringa vuota = non ancora chiesto, quindi va chiesto. Il valore letterale = chiesto e non dato, perché rifiutato **o lasciato senza risposta**: non si chiede più. Se poi lo studente lo dà, il valore sostituisce la sentinella. Vale solo per i facoltativi. In `eventi[]` diventa sempre `""`.
  *Bug:* senza la distinzione il bot non può ricordare di aver già chiesto un campo facoltativo e lo richiede all'infinito. Il 0926, nella sua prima forma, aveva perso il caso "senza risposta" (il 0918 lo aveva) e la revisione l'ha rimesso.
  *Nel 0928:* `<regole_generali>` VALORI DI UN CAMPO; FASE 2 e FASE 3 (QUANDO); COME LEGGI LA RISPOSTA, NELLE FASI 2 E 3 (CAMPI NON DATI); FASE 7 (REGISTRA); `<vietato>`; nello schema, le descrizioni dei facoltativi.

- [ ] **Una fonte nominata si mappa su uno slug, non fa ripetere la domanda.** La discriminante è **chi ha preso l'iniziativa**, non la piattaforma: lo studente ha cercato → `online_autonomo`; l'azienda lo ha contattato, anche su LinkedIn → `da_azienda`; nessuna opzione applicabile → `altro`.
  *Bug:* rispondendo `"LinkedIn"` il bot ripeteva l'elenco delle opzioni invece di procedere.
  *Nel 0928:* `<opzioni>` FONTE; richiamata in COME LEGGI LA RISPOSTA, NELLE FASI 2 E 3 (FONTE NOMINATA).

- [ ] **Il bot afferma ciò che ha fatto e chiede ciò che gli serve.** Mai `"Ti confermo"`: è lo studente a confermare al bot.
  *Bug:* lo diceva davvero.
  *Nel 0928:* `<output>` STILE.

- [ ] **I verbi che non attribuiscono responsabilità non si interpretano.** `"il colloquio è saltato"` non dice di chi sia la mancanza. I colloqui non svolti non si registrano in chat: si rimanda al form.
  *Bug:* `"è saltato"` e `"l'ho saltato"` differiscono di una sillaba, e sbagliare significa attribuire a uno studente un'assenza che non è sua.
  *Nel 0928:* FASE 1 (COLLOQUIO NON SVOLTO) per il primo messaggio; `<uscite>` (IL COLLOQUIO CHE STAI RACCOGLIENDO NON SI È SVOLTO, e TESTO DEL FORM) a metà raccolta.

- [ ] **`"mi hanno rimandato al prossimo colloquio"` è un avanzamento di fase, non un rinvio** → `colloquio_sostenuto` con `feedback_colloquio_si_pos`. La data da chiedere è quella del colloquio già fatto.
  *Bug:* doppio significato di "rimandare" in italiano. Nella prima stesura del 0928 era rimasto solo "al secondo round", cioè proprio senza la frase ambigua: il controllo con questa checklist l'ha rimessa.
  *Nel 0928:* FASE 1 (STATO CHIARO).

- [ ] **Il presente indicativo da solo non distingue programmato da sostenuto.** Lo stato lo decide il verbo. `"ho un colloquio"` porta a programmato solo con una data futura; senza data, o con una data passata, il bot chiede.
  *Bug:* `"ho un colloquio..."` era elencato come attivazione diretta di `colloquio_programmato`, quindi il bot non lo trovava ambiguo e non chiedeva mai.
  *Nel 0928:* FASE 1 (STATO CHIARO, e COLLOQUIO, MA NON SI SA SE È GIÀ FATTO).

- [ ] **La data di oggi va iniettata nel prompt; un anno mancante si chiede, non si deduce.** Finché la data non è completa si conserva come l'ha scritta lo studente e conta come mancante; in `eventi[]` va solo `aaaa-mm-gg`. Senza l'anno la data del colloquio non si registra.
  *Bug:* `"il 3 settembre"` era diventato 3 settembre 2024, due anni indietro. Il modello non ha nessun ancoraggio temporale se non glielo dai.
  *Nel 0928:* `<oggi>`, alimentato dalla riga `const oggi = ...` che sta **fuori** dal template literal; DATE, dentro COME LEGGI LA RISPOSTA, NELLE FASI 2 E 3; CAMPI NON DATI, per l'anno che lo studente non sa; nello schema, la descrizione di `data_colloquio` in `campi_raccolti`.

- [ ] **`campi_raccolti` si aggiorna in modo incrementale, mai ricostruito da zero.** Un valore già presente non si perde, salvo correzione esplicita o cambio di stato.
  *Bug:* è l'unica memoria dei dati del bot. Con la finestra di `Simple Memory` a zero il bot saltava turni, ripeteva domande, ignorava l'ordine dei campi e non gestiva le correzioni: quattro sintomi diversi, una sola causa.
  *Nel 0928:* `<regole_generali>` MEMORIA, `<vietato>`.

---

## Gruppo 2 — Regole nate dalla revisione e dal controllo del 0928

- [ ] **Schema e prompt non devono mai dire cose diverse.** Il modello legge anche le descrizioni dello schema e le tratta come istruzioni.
  *Difetto:* lo schema citava ancora `conversazione_integrale` ("si generano in eventi[] al turno finale"); se il modello l'avesse prodotto, `additionalProperties: false` avrebbe fatto rifiutare la registrazione. Stessa famiglia: `pronto_per_registrazione` senza conferma, `data_colloquio` "sempre ISO" mentre il prompt conserva la data parziale.
  *Nel 0928:* tutto `spo_schema.json`, verificato anche contro il 0928 il 2026-09-28. Ogni modifica al prompt va controllata anche lì.

- [ ] **In `eventi[]` ogni evento ha esattamente le chiavi del suo stato, tutte presenti, nessuna in più.** Al cambio di stato si tolgono solo i campi propri che il nuovo stato non ha (`data_colloquio` resta fra programmato e sostenuto; i campi del contratto restano fra prevista e avvenuta).
  *Difetto:* passando da sostenuto a programmato, `feedback_colloquio` restava e il parser rifiutava proprio il turno di registrazione.
  *Nel 0928:* FASE 7 (REGISTRA, con l'elenco delle chiavi); `<regole_generali>` MEMORIA (cambio di stato); richiamata in COME LEGGI LA RISPOSTA, NELLE FASI 2 E 3.

- [ ] **Uno stato non ancora chiaro si salva come `"da_chiarire"`, con i dati già forniti.** Alla risposta, lo stato provvisorio si sostituisce con quello scelto.
  *Difetto:* con "Ho un colloquio con Acme Srl come sviluppatore" lo schema non permetteva di salvare l'evento senza uno dei 5 stati: il modello inventava uno stato, perdeva azienda e posizione, o produceva un JSON rifiutato.
  *Nel 0928:* FASE 1 (QUANDO; COLLOQUIO, MA NON SI SA SE È GIÀ FATTO; ASSUNZIONE, MA NON SI SA SE È GIÀ AVVENUTA); nello schema, l'enum di `stato_opportunita` in `campi_raccolti` (solo lì, mai in `eventi[]`).

- [ ] **Devono esistere criteri che portano agli stati di assunzione.** `"prevista"` → prevista; `"ho iniziato"`, `"già avvenuta"` → avvenuta; il nome leggibile di uno stato, anche scelto dal menu → quello stato.
  *Difetto:* tutti i criteri sulle assunzioni portavano ad AMBIGUO, quindi i due stati non si raggiungevano mai (regressione rispetto al 0918).
  *Nel 0928:* FASE 1 (STATO CHIARO, comprese le risposte alla domanda di chiarimento).

- [ ] **C'è sempre una via d'uscita.** Al riepilogo un no senza dati fa chiedere "Vuoi correggere qualcosa o preferisci non registrare?". Una richiesta esplicita di non registrare porta prima alla domanda di conferma, poi toglie l'evento. Un colloquio annullato a metà raccolta toglie l'evento e rimanda al form. Un obbligatorio che lo studente non conosce porta a spiegare che senza non si registra, e che può scriverlo più tardi o annullare.
  *Difetto:* "no", 👎 o "lascia stare" al riepilogo erano letti come correzione e il riepilogo si ripeteva all'infinito; un obbligatorio sconosciuto veniva richiesto all'infinito.
  *Nel 0928:* FASE 7 (un no senza altri dati); `<uscite>` (LO STUDENTE CHIEDE DI NON REGISTRARE, LA RISPOSTA A «VUOI CHE ANNULLI…», ANNULLA, IL COLLOQUIO CHE STAI RACCOGLIENDO NON SI È SVOLTO); COME LEGGI LA RISPOSTA, NELLE FASI 2 E 3 (CAMPI NON DATI).

- [ ] **La domanda a cui lo studente risponde si legge nel messaggio precedente del bot.** `campi_raccolti` è la memoria dei dati, non delle domande. Le fasi 4 e 5 si decidono dal valore del campo (link, note); le fasi 6 e 7 dal messaggio precedente ("era il riepilogo?"); la risposta alla domanda di annullamento, dal messaggio precedente.
  *Difetto:* "conferma già chiesta" non era scritto da nessuna parte, quindi un modello letterale poteva rifare il riepilogo dopo ogni "ok".
  *Nel 0928:* `<percorso>` (A OGNI MESSAGGIO, passo b; DUE COSE DA SAPERE SEMPRE); `<regole_generali>` MEMORIA; QUANDO delle fasi 4, 5, 6 e 7; `<uscite>` (LA RISPOSTA A «VUOI CHE ANNULLI…»).

- [ ] **La risposta si legge secondo la domanda fatta.** Risposta al link → lettura della fase 4, e gli altri dati nei loro campi. Risposta alle note → lettura della fase 5, e nessun altro campo. Altrimenti ogni dato va nel suo campo, anche se arriva prima che venga chiesto. Una seconda domanda ("Qual è il link?", "Cosa vuoi aggiungere?") si fa una volta sola, poi sentinella, e la sua risposta si legge come la prima.
  *Difetto:* "un dato fuori turno si registra subito" non aveva eccezioni e veniva prima della sospensione delle note; per la risposta al link non c'era nessuna regola, e "no" rischiava di finire nel link.
  *Nel 0928:* `<percorso>` (passo b, e la regola sui dati dati in anticipo con la sua eccezione); FASE 4 e FASE 5 (COME LEGGI LA RISPOSTA, ciascuna con "vale per la risposta a…"); COME LEGGI LA RISPOSTA, NELLE FASI 2 E 3.

- [ ] **Con un contratto indeterminato la data di fine non si chiede.**
  *Difetto:* restava `""`, che vuol dire "da chiedere", e il bot chiedeva la data di fine di un contratto a tempo indeterminato.
  *Nel 0928:* SCHEDE DEGLI STATI (le due assunzioni); FASE 3 (QUANDO); FASE 6 (nel riepilogo non si mostra).

- [ ] **Ogni data del colloquio si confronta con OGGI e con lo stato, in qualunque messaggio arrivi.** Un programmato vuole oggi o una data futura, un sostenuto oggi o una data passata. Se non torna, si chiede, senza correggere da soli.
  *Difetto:* il confronto avveniva solo al riconoscimento dello stato; "mi hanno fissato un colloquio" seguito da una data passata finiva sul foglio così. Nella prima stesura del 0928 le regole sulle date valevano solo "nelle fasi 2 e 3", e una data scritta già nel primo messaggio restava fuori: il controllo con questa checklist ha aggiunto "valgono per ogni data, in qualunque messaggio arrivi, anche il primo".
  *Nel 0928:* DATE, dentro COME LEGGI LA RISPOSTA, NELLE FASI 2 E 3; SCHEDE DEGLI STATI (controllo con OGGI); `<oggi>`.

- [ ] **Le espressioni che non indicano un giorno ("la settimana scorsa", "il mese prossimo") servono solo per passato o futuro: il giorno si chiede.**
  *Difetto:* rischio di registrare oggi meno 7 giorni, un giorno inventato come l'anno del bug 2024.
  *Nel 0928:* DATE, dentro COME LEGGI LA RISPOSTA, NELLE FASI 2 E 3.

- [ ] **Il riepilogo si apre con il tipo di aggiornamento** ("Tipo di aggiornamento: Colloquio sostenuto"). Con un contratto indeterminato la data di fine non si mostra.
  *Difetto:* lo stato è la decisione che il bot prende da solo più spesso ("ho iniziato" → avvenuta, "ho un colloquio" con data futura → programmato, secondo round → sostenuto), ma il riepilogo non lo mostrava: lo studente confermava senza poter vedere se era stato classificato bene. Mancava già nel 0918. Trovato simulando le cinque conversazioni.
  *Nel 0928:* FASE 6 (DOMANDA), esempio FASE 6.

- [ ] **Il saluto lo calcola il codice, non il modello.** Il modello non conosce l'ora: riceve già la parola giusta (`SALUTO`) e la usa nel primo messaggio del thread, qualunque sia la fase.
  *Difetto:* il prompt conteneva solo la data, e l'esempio diceva "Buongiorno": alle 21:30 il bot avrebbe detto Buongiorno.
  *Nel 0928:* righe `const ora` e `const saluto` in cima al file, `<output>` STILE, `<oggi>`, esempio FASE 2.

- [ ] **"Salvare" e "registrare" non si confondono.** Nel prompt "salva" vuol dire mettere un dato in `campi_raccolti`; "registra" vuol dire solo la registrazione finale (fase 7). Anche i messaggi allo studente usano "registrare" nel senso finale ("I dati raccolti finora non verranno registrati").
  *Difetto:* nel 0926 lo stesso verbo indicava tutte e due le cose ("un dato fuori turno si registra subito", "registralo e passa alla fase 2"): un modello letterale poteva leggere "registralo" come "registra l'evento". Trovato nel controllo del 0928.
  *Nel 0928:* in tutto il file, verificato su ogni occorrenza.

---

## Gruppo 3 — Scelte di progetto

Modificabili, se vuoi un bot diverso.

- Ogni risposta è un oggetto JSON completo, mai testo libero.
- Slug nei campi tecnici (`campi_raccolti`, `eventi[]`), testo esteso nei messaggi allo studente.
- **Il prompt segue le sette fasi della conversazione** (stato, dati di base, dati dello stato, link, note, riepilogo, registrazione), e ogni fase ha la stessa forma: quando si salta, la domanda, come si legge la risposta, dove si va dopo. A ogni messaggio il bot controlla le uscite, salva i dati arrivati, trova la prima fase in cui manca qualcosa e fa la sua domanda. Le fasi sono l'ordine delle domande, non un blocco: un dato dato in anticipo si salva comunque.
- **La raccolta in due passi**, un messaggio ciascuno: prima i quattro campi comuni mancanti (posizione, azienda, sede, fonte, fase 2), poi i campi propri dello stato (fase 3). In ogni passo tutti i campi mancanti insieme, senza dividerli in più messaggi; dal secondo messaggio in poi, le domande si aprono con "Grazie per la tua risposta". Motivo: su Slack un elenco unico con tutti i campi e le loro opzioni diventava una lista della spesa; così ogni messaggio contiene al massimo un elenco di opzioni. Costo: un turno in più.
- **L'ordine dei campi è uguale per tutti gli stati:** posizione, azienda, sede, fonte, poi i campi propri.
- **I facoltativi mancanti si chiedono sempre prima di passare oltre**, anche quando sono l'unico campo del passo. Motivo: nei test, avendo fretta, capitava di dimenticare un campo facoltativo, e un promemoria prima dei campi propri basta a farlo inserire. Se lo studente lo salta, il bot va avanti senza insistere; il riepilogo lo mostra come "non specificato/a", ultima occasione per aggiungerlo.
- Link e note chiesti per ultimi, in fasi dedicate.
- Niente Markdown, elenchi con `•`, nessuna emoji nei messaggi.
- I colloqui non svolti (rinvii, annullamenti, assenze) indirizzati al form invece che registrati.
- Cinque stati anziché otto.
- `sintesi_bot` generata dal modello; `conversazione_integrale` costruita nel workflow dal thread di Slack (`get_current_thread`), non dal modello.
- **Un evento per conversazione.** Se lo studente ne nomina due, il bot raccoglie il primo e chiede di scrivere l'altro in un nuovo messaggio. Motivo: un thread corrisponde a una registrazione (dopo la registrazione il thread si chiude), e gestire più eventi insieme richiedeva regole troppo pesanti per un modello meno capace. Costo: lo studente riscrive il secondo aggiornamento.
- **Un solo stato provvisorio (`da_chiarire`) e nessuna fase nuova**: la risposta alla domanda di chiarimento torna alla fase 1, che riconosce lo stato. Scelto contro due stati provvisori e una fase CHIARIMENTO, per tenere il prompt semplice.
- **`"mi assumeranno"` resta ambiguo.** Uno studente può usare il futuro anche per un'assunzione già avvenuta: meglio un turno in più che uno stato sbagliato sul foglio.
- **La posizione è obbligatoria, senza ripieghi.** Se lo studente non la ricorda o non la vuole dire, anche in una candidatura spontanea, non si registra. Scelto per non aggiungere regole.
- **Solo frasi esplicite annullano** ("annulla", "non registrare", "non voglio più registrarlo"). "Lascia stare" al riepilogo è un diniego (il bot chiede se correggere o non registrare); nella risposta alle note vuol dire "niente note".
- **Prima di annullare, il bot chiede conferma**: "Vuoi che annulli questa registrazione? I dati raccolti finora non verranno registrati." Sì → annulla; no o altro → salva i dati della risposta e riprende dalla prima fase incompleta. Niente doppia conferma se lo studente sceglie "non registrare" rispondendo a "Vuoi correggere qualcosa o preferisci non registrare?". Il colloquio saltato resta senza conferma: è un fatto, non una richiesta. Motivo: un annullamento per sbaglio fa perdere tutti i dati raccolti, una domanda in più costa un turno solo e capita di rado. Decisa il 2026-09-28; il 0926 annulla subito.
- **Le uscite non valgono nella risposta alle note.** Una nota come "hanno annullato la riunione di team" resta una nota; lo studente può annullare al riepilogo, subito dopo.
- **Un rinvio con nuova data, a metà raccolta, è una correzione della data**, perché non c'è ancora niente di registrato. Il rinvio di un colloquio già registrato altrove resta un caso da form.
- **Saluto a tre fasce:** Buongiorno fino alle 13:59, Buon pomeriggio dalle 14 alle 17:59, Buonasera dalle 18.
- **Lasciati fuori di proposito:** registrazione automatica del secondo round, controllo delle date del contratto rispetto a OGGI, anno chiesto insieme alla domanda "programmato o sostenuto?".
- **Nello schema nessun limite rigido a un evento.** Se il modello ne producesse due, il parser rifiuterebbe il turno e lo studente resterebbe senza risposta: peggio di due righe corrette.
- **La sentinella in `eventi[]` la toglie già il prompt** (FASE 7, REGISTRA). Nel workflow si può aggiungere una rete di sicurezza che la trasforma in `""`: è deterministica e non dipende dal modello, ma è facoltativa.

---

## Cinque avvertenze per la riscrittura

**Gli esempi pesano più della prosa.** Il bug del pollice è nato da un esempio JSON che contraddiceva una regola scritta, e ha vinto l'esempio. Se cambi una regola, controlla che gli esempi la rispecchino.

**Prima il diagramma, poi il prompt.** Il 0928 è la traduzione in parole dei diagrammi in `Flowcharts/` (un diagramma principale e cinque sotto-diagrammi). Se cambi una regola, aggiorna prima il diagramma e poi la fase corrispondente del prompt, così i due restano allineati.

**Una regola generale e la sua eccezione vanno scritte insieme.** Il bug del "titolare" è nato da "un dato fuori turno si registra subito", scritto senza eccezioni e lontano dalla sospensione delle note. Nella prima stesura del 0928 la stessa forma era riapparsa nel `<percorso>`, ed è stata corretta. Se scrivi una regola che vale "sempre", richiama nello stesso punto le sue eccezioni.

**`<vietato>` sta in fondo di proposito**, subito prima di `<oggi>`, e ripete le regole più violate. È una ripetizione voluta, non una svista da ripulire. `<oggi>` resta ultima perché cambia ogni giorno (e il saluto più volte al giorno): tutto ciò che la precede può restare in cache.

**Il peso conta, e non tutto pesa uguale.** Misurati con un contatore di token reale il 2026-09-28, il 0926 pesa circa 5.900 token e il 0928 circa 7.300. La differenza è quasi tutta struttura (il `<percorso>`, la forma completa di ogni fase), non regole in più. È pronta una proposta di tagli già misurata, circa −400 token senza togliere regole, non applicata. Per un modello meno capace di Claude, un valore in più in un elenco costa poco; costano molto le eccezioni alle regole forti, le regole che si incrociano e i casi lasciati non definiti. Prima di aggiungere una regola, chiediti se si può riusare una struttura che c'è già, o se la cosa si può fare in JavaScript nel workflow.

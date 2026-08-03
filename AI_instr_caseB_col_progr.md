Nota:
Questo file sviluppa lo Scenario B (Colloquio programmato), seguendo la stessa struttura usata per lo Scenario A in `AI_Instructions.md`. Le regole comuni definite in quel file si applicano anche qui e non vengono ripetute:
- Tipi di evento
- Formattazione dei messaggi inviati
- Struttura del record su Google Sheets
- Gestione dei casi ambigui
- Fallback in caso di mancato riconoscimento
- Gestione di dati non verificabili
- Riconoscimento dei campi <Nome_lavoro>, <Nome_azienda>, <Citta> e <Link_annuncio>: si applicano esattamente gli stessi criteri descritti nella sezione "Riconoscimento dei campi" dello Scenario A (suffissi societari o marchio noto per l'azienda, connettivo "come" per il lavoro, conoscenza geografica per la città, URL per il link)
- Riconoscimento di campi data (<Data_colloquio>): si applica la regola condivisa "Riconoscimento di campi data"

Scenario B:
lo studente comunica di avere un colloquio programmato.

Attivazione dello Scenario B:
Il bot riconosce lo Scenario B quando il messaggio dello studente contiene un'espressione che indica un colloquio programmato (es. "ho un colloquio", "mi hanno fissato un colloquio", "ho un colloquio programmato per...", o espressioni equivalenti).

Più colloqui nello stesso messaggio:
Se il bot rileva che il messaggio dello studente descrive più di un colloquio (es. menziona più aziende o più date distinte), non deve provare a interpretarli entrambi: deve rispondere chiedendo allo studente di inviare un colloquio per messaggio.

Esempio:
Messaggio studente: "Ho un colloquio con Acme il 15/03/2026 e uno con Beta il 20/03/2026"
Risposta bot: "Per favore invia un colloquio per messaggio, così posso registrarli correttamente. Puoi rimandarmi prima i dettagli di uno dei due?"

Esempio di messaggio da parte dello studente:

Ho un colloquio in data <Data_colloquio> presso l'azienda <Nome_azienda> a <Citta>

Lo studente specifica (in un ordine qualsiasi, non necessariamente tutti insieme):
- <Nome_lavoro>: il nome/titolo della posizione per cui è previsto il colloquio
- <Nome_azienda>: il nome dell'azienda
- <Citta>: la città dove risiede l'azienda
- <Data_colloquio>: la data (ed eventualmente l'ora) del colloquio
- <Nome_intervistatore>: il nome della persona che condurrà il colloquio in azienda — campo opzionale, vedi sotto
- <Link_annuncio>: qualsiasi link utile collegato all'evento (es. link all'azienda, al profilo dell'intervistatore, a una videochiamata) — campo opzionale, vedi sotto

<Nome_lavoro>, <Nome_azienda>, <Citta> e <Data_colloquio> sono campi obbligatori: se mancano dal messaggio, il bot deve richiederli esplicitamente seguendo lo stesso flusso "Campi mancanti" già definito per lo Scenario A. Se lo studente dichiara di non conoscerli (es. "non lo so"), il bot li registra come "non fornito dallo studente", esattamente come nello Scenario A.

Campi opzionali <Nome_intervistatore> e <Link_annuncio>:
<Nome_intervistatore> e <Link_annuncio> sono opzionali per lo Scenario B, ma il bot deve comunque chiederli allo studente se non sono già stati forniti, specificando chiaramente che sono facoltativi. Se mancano anche campi obbligatori, il bot include la richiesta dei campi opzionali nella stessa domanda; se invece tutti i campi obbligatori sono già stati forniti, il bot chiede comunque, in un messaggio dedicato, se lo studente vuole aggiungere intervistatore e/o link. In entrambi i casi, se lo studente non risponde su questi due campi (o dichiara di non volerli fornire), il bot non deve insistere.

Esempio (mancano campi obbligatori e opzionali):
Messaggio studente: "Ho un colloquio il 15/03/2026 presso Acme a Bologna"
(manca <Nome_lavoro>; <Nome_intervistatore> e <Link_annuncio> non sono stati forniti)
Risposta bot: "Mi confermi per quale posizione è il colloquio? Se vuoi, puoi anche indicarmi il nome dell'intervistatore e un eventuale link (non obbligatori)."

Esempio (tutti i campi obbligatori forniti, mancano solo gli opzionali):
Messaggio studente: "Ho un colloquio come Data Analyst presso Acme il 15/03/2026 a Bologna"
Risposta bot: "Perfetto! Se vuoi, puoi anche indicarmi il nome dell'intervistatore e un eventuale link (non obbligatori)."

In questo caso, il bot deve attendere la risposta dello studente (con i valori, o senza risposta/rifiuto) prima di inviare il messaggio di "Conferma finale": le due cose sono sempre messaggi separati e in sequenza, mai sovrapposti.

Riconoscimento di <Nome_intervistatore>:
Il bot riconosce <Nome_intervistatore> tramite il connettivo "con" (es. "il colloquio sarà con Mario Rossi") oppure un'etichetta esplicita (es. "intervistatore: Mario Rossi"). Se il campo è del tutto assente dal messaggio, il bot non lo richiede (essendo opzionale). Se invece il messaggio contiene un'informazione ambigua che potrebbe essere il nome dell'intervistatore, il bot deve comunque chiedere allo studente di chiarire con un nuovo messaggio, formulando la domanda in modo che sia chiaro che può anche scegliere di non rispondere, trattandosi di un campo facoltativo.

Esempio:
Messaggio studente: "Ho un colloquio il 15/03/2026 presso Acme a Bologna, Rossi"
Risposta bot: "Ok! Per completare la registrazione, 'Rossi' si riferisce al nome dell'intervistatore? Se preferisci non specificarlo va bene comunque."

Risposta dello studente ai campi richiesti:
Si applica lo stesso principio dello Scenario A: se lo studente dichiara di non conoscere un campo obbligatorio (es. "non lo so"), il bot lo registra come "non fornito dallo studente" e non lo richiede più.

Esempio:
Messaggio bot: "Mi confermi per quale posizione è il colloquio?"
Risposta studente: "Non lo so"

Risultato:
- <Nome_lavoro>: non fornito dallo studente

Conferma finale:
Quando la raccolta dei campi obbligatori è completa (ogni campo è stato fornito oppure segnato come "non fornito dallo studente"), il bot deve rispondere con un messaggio di riepilogo, elencando il valore registrato per ciascun campo (inclusi <Nome_intervistatore> e <Link_annuncio> se forniti).

Esempio (tutti i campi obbligatori forniti, senza campi opzionali):
"Ho registrato il tuo colloquio:
• Posizione: Data Analyst
• Azienda: Acme Srl
• Città: Bologna
• Data colloquio: 15/03/2026"

Esempio (con campi opzionali forniti):
"Ho registrato il tuo colloquio:
• Posizione: Data Analyst
• Azienda: Acme Srl
• Città: Bologna
• Data colloquio: 15/03/2026
• Intervistatore: Mario Rossi
• Link: https://..."

Mappatura sul record Google Sheets:
- Event type: "Colloquio programmato"
- Data colloquio: <Data_colloquio>
- Link allegati: <Link_annuncio> (o "non fornito dallo studente"/vuoto se non presente)
- Sintesi bot: riepilogo testuale con posizione, azienda, città ed eventuale intervistatore (es. "Colloquio come Data Analyst presso Acme Srl a Bologna, intervistatore Mario Rossi")

Il bot deve lasciare vuote le colonne non pertinenti allo Scenario B: Data fine contratto. La colonna Note staff va sempre lasciata vuota dal bot, in quanto compilata manualmente dai trainer.

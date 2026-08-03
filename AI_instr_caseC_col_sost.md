Nota:
Questo file sviluppa lo Scenario C (Colloquio sostenuto), seguendo la stessa struttura usata per lo Scenario A e lo Scenario B (`AI_Instructions.md`, `AI_instr_caseB_col_progr.md`). Le regole comuni definite in `AI_Instructions.md` si applicano anche qui e non vengono ripetute:
- Tipi di evento
- Formattazione dei messaggi inviati
- Struttura del record su Google Sheets
- Gestione dei casi ambigui
- Fallback in caso di mancato riconoscimento
- Gestione di dati non verificabili
- Riconoscimento dei campi <Nome_lavoro>, <Nome_azienda>, <Citta> e <Link_annuncio>: si applicano esattamente gli stessi criteri descritti nella sezione "Riconoscimento dei campi" dello Scenario A (suffissi societari o marchio noto per l'azienda, connettivo "come" per il lavoro, conoscenza geografica per la città, URL per il link)
- Riconoscimento di campi data (<Data_colloquio>): si applica la regola condivisa "Riconoscimento di campi data"

Scenario C:
lo studente comunica di aver sostenuto un colloquio.

Attivazione dello Scenario C:
Il bot riconosce lo Scenario C quando il messaggio dello studente contiene un'espressione che indica un colloquio già sostenuto (es. "ho sostenuto un colloquio", "ho fatto il colloquio", "ho avuto il colloquio", o espressioni equivalenti).

Più colloqui nello stesso messaggio:
Se il bot rileva che il messaggio dello studente descrive più di un colloquio sostenuto (es. menziona più aziende o più date distinte), non deve provare a interpretarli entrambi: deve rispondere chiedendo allo studente di inviare un colloquio per messaggio.

Esempio di messaggio da parte dello studente:

Ho sostenuto un colloquio in data <Data_colloquio> con <Nome_intervistatore> presso l'azienda <Nome_azienda> a <Citta>

Lo studente specifica (in un ordine qualsiasi, non necessariamente tutti insieme):
- <Nome_lavoro>: il nome/titolo della posizione per cui è stato sostenuto il colloquio
- <Nome_azienda>: il nome dell'azienda
- <Citta>: la città dove risiede l'azienda
- <Data_colloquio>: la data (ed eventualmente l'ora) in cui si è svolto il colloquio
- <Nome_intervistatore>: il nome della persona che ha condotto il colloquio — campo opzionale, vedi sotto
- <Link_annuncio>: qualsiasi link utile collegato all'evento — campo opzionale, vedi sotto
- <Sensazioni_colloquio>: un breve riassunto di come lo studente ritiene sia andato il colloquio — vedi sotto

<Nome_lavoro>, <Nome_azienda>, <Citta> e <Data_colloquio> sono campi obbligatori: se mancano dal messaggio, il bot deve richiederli esplicitamente seguendo lo stesso flusso "Campi mancanti" già definito per lo Scenario A. Se lo studente dichiara di non conoscerli (es. "non lo so"), il bot li registra come "non fornito dallo studente", esattamente come nello Scenario A.

Campi opzionali <Nome_intervistatore> e <Link_annuncio>:
<Nome_intervistatore> e <Link_annuncio> sono opzionali per lo Scenario C, ma il bot deve comunque chiederli allo studente se non sono già stati forniti, specificando chiaramente che sono facoltativi. Se mancano anche campi obbligatori, il bot include la richiesta dei campi opzionali nella stessa domanda; se invece tutti i campi obbligatori sono già stati forniti, il bot chiede comunque, in un messaggio dedicato, se lo studente vuole aggiungere intervistatore e/o link. In entrambi i casi, se lo studente non risponde su questi due campi (o dichiara di non volerli fornire), il bot non deve insistere.

Riconoscimento di <Nome_intervistatore>:
Il bot riconosce <Nome_intervistatore> tramite il connettivo "con" (es. "il colloquio è stato con Mario Rossi") oppure un'etichetta esplicita (es. "intervistatore: Mario Rossi"). Se il campo è del tutto assente dal messaggio, il bot non lo richiede (essendo opzionale). Se invece il messaggio contiene un'informazione ambigua che potrebbe essere il nome dell'intervistatore, il bot deve comunque chiedere allo studente di chiarire con un nuovo messaggio, formulando la domanda in modo che sia chiaro che può anche scegliere di non rispondere, trattandosi di un campo facoltativo.

Campo <Sensazioni_colloquio>:
Il bot riconosce <Sensazioni_colloquio> come già fornito quando il messaggio dello studente contiene un'espressione di opinione/valutazione soggettiva sull'andamento del colloquio (es. "è andato bene", "penso di aver sbagliato", "non sono sicuro", "sono soddisfatto"). In questo caso il bot non pone alcuna domanda aggiuntiva su questo campo.

Se invece <Sensazioni_colloquio> non è presente nel messaggio, il bot lo richiede sempre, ma solo dopo aver raccolto tutti i campi obbligatori e opzionali (in un messaggio separato e successivo). La domanda è informale (es. "Vuoi dirmi come pensi che sia andato il colloquio?"), specificando in modo educato ma esplicito che la risposta deve essere breve. Il bot richiede attivamente questo campo ma senza insistere: se lo studente non risponde o non vuole rispondere, il bot non insiste e lo registra come "non fornito dallo studente". Questo campo non corrisponde a una colonna dedicata nel foglio Google Sheets: la risposta dello studente viene inclusa, insieme alle altre informazioni raccolte, nel campo "Sintesi bot".

Risposta dello studente ai campi richiesti:
Si applica lo stesso principio dello Scenario A: se lo studente dichiara di non conoscere/non voler fornire un campo (obbligatorio o opzionale), il bot lo registra come "non fornito dallo studente" e non lo richiede più.

Sequenza dei messaggi:
Il flusso completo dello Scenario C segue questi passaggi, in ordine:
1. Lo studente invia il messaggio iniziale con i dati del colloquio sostenuto.
2. Se mancano campi obbligatori e/o opzionali (<Nome_intervistatore>, <Link_annuncio>), il bot li richiede in un unico messaggio, come già definito.
3. Se <Sensazioni_colloquio> non è già presente in uno dei messaggi precedenti, il bot lo richiede con un messaggio informale separato.
4. Una volta raccolti tutti i dati, il bot invia il messaggio di "Conferma finale" con il riepilogo e ringrazia lo studente.
5. Il bot registra l'evento sul foglio Google Sheets.

Conferma finale:
Quando la raccolta dei campi è completa (ogni campo obbligatorio e opzionale è stato fornito oppure segnato come "non fornito dallo studente", e <Sensazioni_colloquio> è stato richiesto o era già presente), il bot deve rispondere con un messaggio di riepilogo, elencando il valore registrato per ciascun campo, seguito da un ringraziamento allo studente.

Esempio (tutti i campi forniti):
"Ho registrato il tuo colloquio sostenuto:
• Posizione: Data Analyst
• Azienda: Acme Srl
• Città: Bologna
• Data colloquio: 15/03/2026
• Intervistatore: Mario Rossi
• Link: https://...
• Sensazioni: Credo sia andato bene, mi hanno fatto domande tecniche e sembravano soddisfatti

Grazie per aver condiviso come è andato il colloquio."

Mappatura sul record Google Sheets:
- Event type: "Colloquio sostenuto"
- Data colloquio: <Data_colloquio>
- Link allegati: <Link_annuncio> (o "non fornito dallo studente"/vuoto se non presente)
- Sintesi bot: riepilogo testuale con posizione, azienda, città, eventuale intervistatore e le sensazioni riportate dallo studente (es. "Colloquio sostenuto come Data Analyst presso Acme Srl a Bologna, intervistatore Mario Rossi. Sensazioni: Credo sia andato bene..."). Se lo studente non fornisce <Sensazioni_colloquio>, il bot scrive in "Sintesi bot": "Lo studente non ha espresso alcuna sensazione in merito all'esito del colloquio".

Il bot deve lasciare vuote le colonne non pertinenti allo Scenario C: Data fine contratto. La colonna Note staff va sempre lasciata vuota dal bot, in quanto compilata manualmente dai trainer.

# Diagramma di flusso — AI_instr_global_sintesi

Rappresenta la logica di `AI_instr_global_sintesi.md`: dal messaggio dello studente al riconoscimento dello scenario, raccolta campi e registrazione su Google Sheets.

```mermaid
flowchart TD
  Start([Messaggio studente]) --> Split[Il bot separa ed elabora\nogni evento presente nel messaggio,\nanche di tipo diverso]
  Split --> Detect{Riconosce un\ntipo di evento noto?}

  Detect -->|No| Clarify[Chiede allo studente\ndi chiarire]
  Clarify --> Detect2{La risposta\nchiarisce lo scenario?}
  Detect2 -->|No| ScenF[["Scenario F — Non classificato\nRegistra lo scambio così com'è\nper revisione manuale dello staff"]]
  Detect2 -->|Sì| Detect

  Detect -->|Sì| Which{Quale evento?}

  Which -->|Candidatura| ScenA[Scenario A\nCandidatura]
  Which -->|Correzione Candidatura| ScenAcorr[Correzione Candidatura]
  Which -->|Colloquio programmato| ScenB[Scenario B\nColloquio programmato]
  Which -->|Colloquio sostenuto| ScenC[Scenario C\nColloquio sostenuto]
  Which -->|Assunzione| ScenD1[Scenario D\nAssunzione]
  Which -->|Cessazione contratto| ScenD2[Scenario D\nCessazione contratto]
  Which -->|Proroga contratto| ScenD3[Scenario D\nProroga contratto]
  Which -->|Non interesse a cercare lavoro| ScenE[Scenario E\nNon interesse a cercare lavoro]

  ScenAcorr --> ReAsk[Chiede di reinserire tutti i dati\ndella candidatura interessata\ncon il valore corretto]
  ReAsk --> FieldsA

  ScenA --> FieldsA[Campi obbligatori:\nNome_lavoro, Nome_azienda,\nCitta, Link_annuncio]
  ScenB --> FieldsB[Campi obbligatori:\nNome_lavoro, Nome_azienda,\nCitta, Data_colloquio]
  ScenC --> FieldsC[Campi obbligatori:\nNome_lavoro, Nome_azienda,\nCitta, Data_colloquio]
  ScenD1 --> FieldsD1[Campi obbligatori:\nNome_lavoro, Nome_azienda, Citta,\nData_inizio_contratto, Data_fine_contratto]
  ScenD2 --> FieldsD2[Campi obbligatori:\nNome_lavoro, Nome_azienda,\nCitta, Data_fine_contratto]
  ScenD3 --> FieldsD3[Campi obbligatori:\nNome_lavoro, Nome_azienda, Citta,\nData_inizio_proroga, Data_fine_contratto]

  FieldsA --> Missing{Tutti i campi obbligatori\nsono stati forniti o segnati\ncome "non fornito dallo studente"?}
  FieldsB --> Missing
  FieldsC --> Missing
  FieldsD1 --> Missing
  FieldsD2 --> Missing
  FieldsD3 --> Missing

  Missing -->|No| AskMissing[Chiede i campi mancanti\nin un unico messaggio\n(se più eventi: raggruppato,\nma etichettato per evento)]
  AskMissing --> StudentReply[Lo studente risponde,\nanalizzato campo per campo]
  StudentReply --> Missing

  Missing -->|Sì| Extra{Scenario con\nraccolta aggiuntiva?}

  Extra -->|"Scenario C: manca Sensazioni_colloquio?"| AskFeel[Chiede in modo informale\ncome è andato il colloquio\n(risposta facoltativa)]
  AskFeel --> Confirm
  Extra -->|No| Confirm

  ScenE --> Confirm

  Confirm[Invia messaggio di\nConferma finale per l'evento\n— se più eventi: un messaggio\nseparato per ciascuno]
  ScenF --> Save
  Confirm --> Save[(Registra il record\nsu Google Sheets)]
```

## Note di lettura

- **Riconoscimento campi opzionali** (`Nome_intervistatore`, `Link_annuncio` negli Scenari B/C): non è rappresentato come nodo a sé nel diagramma perché il bot non li richiede mai attivamente — vengono semplicemente registrati se presenti spontaneamente nel messaggio iniziale o nelle risposte dello studente, senza influenzare il gate "campi obbligatori completi".
- **Scenario E** (Non interesse a cercare lavoro) salta interamente la raccolta campi: non avendo campi obbligatori, passa direttamente alla Conferma finale.
- **Casi ambigui e fallback** (dato irriconoscibile, più valori per lo stesso campo) sono assorbiti nel ciclo "Chiede i campi mancanti → risposta studente", perché nella sintesi seguono la stessa logica di richiesta/attesa risposta.
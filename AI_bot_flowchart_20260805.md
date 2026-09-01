# Diagramma di flusso — AI_bot_instructions_20260805

Rappresenta la logica di `AI_bot_instructions_20260805.md`: dal messaggio dello studente al riconoscimento dello scenario, raccolta campi e registrazione su Google Sheets.

```mermaid
flowchart TD
  Start(["Messaggio studente"]) --> Split["Il bot separa ed elabora<br/>ogni evento presente nel messaggio,<br/>anche di tipo diverso"]
  Split --> Detect{"Riconosce un<br/>tipo di evento noto?"}

  Detect -->|No| Clarify["Chiede allo studente<br/>di chiarire"]
  Clarify --> Detect2{"La risposta<br/>chiarisce lo scenario?"}
  Detect2 -->|No| ScenF[["Scenario F — Non classificato"]]
  Detect2 -->|Sì| Detect

  Detect -->|Sì| Which{"Quale evento?"}

  Which -->|Candidatura| ScenA["Scenario A<br/>Candidatura"]
  Which -->|Correzione Candidatura| ScenAcorr["Correzione Candidatura"]
  Which -->|Colloquio programmato| ScenB["Scenario B<br/>Colloquio programmato"]
  Which -->|Colloquio sostenuto| ScenC["Scenario C<br/>Colloquio sostenuto"]
  Which -->|Assunzione| ScenD1["Scenario D<br/>Assunzione"]
  Which -->|Cessazione contratto| ScenD2["Scenario D<br/>Cessazione contratto"]
  Which -->|Proroga contratto| ScenD3["Scenario D<br/>Proroga contratto"]
  Which -->|Non interesse a cercare lavoro| ScenE["Scenario E<br/>Non interesse a cercare lavoro"]

  ScenAcorr --> ReAsk["Chiede di reinserire tutti i dati<br/>della candidatura interessata<br/>con il valore corretto"]
  ReAsk --> FieldsA

  ScenA --> FieldsA["Campi obbligatori:<br/>Nome_lavoro, Nome_azienda,<br/>Citta, Link_annuncio"]
  ScenB --> FieldsB["Campi obbligatori:<br/>Nome_lavoro, Nome_azienda,<br/>Citta, Data_colloquio"]
  ScenC --> FieldsC["Campi obbligatori:<br/>Nome_lavoro, Nome_azienda,<br/>Citta, Data_colloquio"]
  ScenD1 --> FieldsD1["Campi obbligatori:<br/>Nome_lavoro, Nome_azienda, Citta,<br/>Data_inizio_contratto, Data_fine_contratto"]
  ScenD2 --> FieldsD2["Campi obbligatori:<br/>Nome_lavoro, Nome_azienda,<br/>Citta, Data_fine_contratto"]
  ScenD3 --> FieldsD3["Campi obbligatori:<br/>Nome_lavoro, Nome_azienda, Citta,<br/>Data_inizio_proroga, Data_fine_contratto"]

  FieldsA --> Missing{"Tutti i campi obbligatori sono<br/>stati forniti o segnati come<br/>'non fornito dallo studente'?"}
  FieldsB --> Missing
  FieldsC --> Missing
  FieldsD1 --> Missing
  FieldsD2 --> Missing
  FieldsD3 --> Missing

  Missing -->|No| AskMissing["Chiede i campi mancanti<br/>in un unico messaggio<br/>(se più eventi: raggruppato,<br/>ma etichettato per evento)"]
  AskMissing --> StudentReply["Lo studente risponde,<br/>analizzato campo per campo"]
  StudentReply --> Missing

  Missing -->|Sì| Extra{"Scenario con<br/>raccolta aggiuntiva?"}

  Extra -->|"Scenario C: manca Sensazioni_colloquio"| AskFeel["Chiede in modo informale<br/>come è andato il colloquio<br/>(risposta facoltativa)"]
  AskFeel --> Confirm
  Extra -->|No| Confirm

  ScenE --> Confirm

  Confirm["Invia messaggio di<br/>Conferma finale per l'evento<br/>(se più eventi: un messaggio<br/>separato per ciascuno)"]
  ScenF --> AckF["Invia messaggio di presa visione<br/>(es. 'Ho preso nota del tuo messaggio,<br/>un membro dello staff lo verificherà')"]
  AckF --> Save
  Confirm --> Save[("Registra il record<br/>su Google Sheets")]
```

## Note di lettura

- **Riconoscimento campi opzionali** (`Nome_intervistatore`, `Link_annuncio` negli Scenari B/C): non è rappresentato come nodo a sé nel diagramma perché il bot non li richiede mai attivamente — vengono semplicemente registrati se presenti spontaneamente nel messaggio iniziale o nelle risposte dello studente, senza influenzare il gate "campi obbligatori completi".
- **Scenario E** (Non interesse a cercare lavoro) salta interamente la raccolta campi: non avendo campi obbligatori, passa direttamente alla Conferma finale.
- **Casi ambigui e fallback** (dato irriconoscibile, più valori per lo stesso campo) sono assorbiti nel ciclo "Chiede i campi mancanti → risposta studente", perché nella sintesi seguono la stessa logica di richiesta/attesa risposta.
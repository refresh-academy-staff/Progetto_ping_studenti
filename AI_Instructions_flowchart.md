# Flowchart - AI Instructions (Scenario A)

Visualizzazione grafica della logica descritta in `AI_Instructions.md`.
Questo file non sostituisce il documento originale, serve solo per vederne il flusso con l'estensione Mermaid di VS Code.

```mermaid
flowchart TD
    Start([Messaggio dello studente]) --> CheckAttivazione{Contiene espressione<br/>di candidatura?<br/>es. 'mi sono candidato'}

    CheckAttivazione -- No --> CheckCorrezione{Contiene espressioni<br/>di correzione?<br/>es. 'in realtà', 'ho sbagliato'}

    CheckCorrezione -- Sì --> ChiediCandidatura[Chiedi di reinviare i dati<br/>della candidatura interessata]
    ChiediCandidatura --> RaccoltaCorrezione[Raccogli i campi<br/>come nel flusso campi mancanti]
    RaccoltaCorrezione --> NuovoRecord[Genera nuovo record<br/>Tipo: Correzione dati candidatura]
    NuovoRecord --> RispostaCorrezione[Rispondi confermando<br/>la correzione]

    CheckCorrezione -- No --> ChiediChiarimento[Chiedi allo studente<br/>di chiarire il messaggio]

    CheckAttivazione -- Sì --> CheckMultiplo{Descrive più<br/>di una candidatura?}

    CheckMultiplo -- Sì --> ChiediUnaPerVolta[Chiedi di inviare<br/>una candidatura per messaggio]

    CheckMultiplo -- No --> Riconoscimento[Riconosci i campi dal contenuto:<br/>Link, Città, Azienda, Lavoro]

    Riconoscimento --> CheckAmbiguo{Campo ambiguo o<br/>non riconosciuto con certezza?}

    CheckAmbiguo -- Sì --> ChiediSpecifica[Chiedi allo studente<br/>di specificare]
    ChiediSpecifica --> Riconoscimento

    CheckAmbiguo -- No --> CheckMancanti{Mancano dei campi?}

    CheckMancanti -- Sì --> ChiediMancanti[Chiedi in un unico messaggio<br/>tutti i campi mancanti]
    ChiediMancanti --> RispostaStudente[Studente risponde:<br/>fornisce valori e/o dichiara<br/>'non lo so' per alcuni]
    RispostaStudente --> SegnaNonForniti[Segna come 'non fornito<br/>dallo studente' i campi dichiarati]
    SegnaNonForniti --> CheckMancanti

    CheckMancanti -- No --> ConfermaFinale[Rispondi con riepilogo<br/>di tutti i campi registrati]

    ConfermaFinale --> End([Fine])
    RispostaCorrezione --> End
    ChiediChiarimento --> End
    ChiediUnaPerVolta --> End
```

// VERSIONE 2 — bozza sperimentale, da provareal posto di AI_bot_instructions_20260805.md/.js
//
// Idea: invece di affidare la struttura dei dati (campi ammessi, obbligatori/opzionali,
// opzioni fisse) solo alla prosa del prompt, la spostiamo in schemi JSON per i tool
// che l'AI Agent richiama in n8n. Il prompt (systemPrompt) resta in linguaggio naturale
// solo per il COMPORTAMENTO (riconoscimento stato, ambiguità, tono, sequenze).
//
// Un tool per stato = il modello non può nemmeno provare a scrivere un campo non
// pertinente a quello stato (es. Data inizio contratto per una candidatura_inviata):
// lo schema non lo prevede come proprietà possibile.

return {
  type: "new_matching_v2",

  systemPrompt: `
Contesto
Sei un bot che riceve messaggi da uno studente in cerca di lavoro, per registrare gli aggiornamenti sulle sue candidature (colloqui, assunzioni, contratti, ecc.).

Il tuo compito è SOLO capire cosa vuole registrare lo studente e quali dati mancano. La struttura dei dati (quali campi esistono, quali sono obbligatori, quali opzioni sono ammesse) non è descritta qui: è definita negli schemi dei tool che hai a disposizione. Usa sempre il tool corrispondente allo stato riconosciuto per registrare i dati — non inventare campi che non esistono nello schema del tool.

Stati opportunità e tool corrispondente
candidatura_inviata → tool registra_candidatura_inviata
colloquio_programmato → tool registra_colloquio_programmato
colloquio_sostenuto → tool registra_colloquio_sostenuto
assunzione_prevista → tool registra_assunzione_prevista
assunzione_avvenuta → tool registra_assunzione_avvenuta

Regole di comportamento (invariate rispetto alla v1)
Formattazione messaggi: niente Markdown standard (no "-", "**"). Elenchi puntati → carattere "•".

Più eventi nello stesso messaggio: riconosci ed elabora ciascun evento separatamente, con il proprio tool.

Fallback su dato non riconosciuto: se un campo non è riconosciuto con sicurezza, trattalo come mancante e richiedilo, non indovinare.

Dati non verificabili: città/aziende non note vanno comunque registrate così come scritte, senza bloccarsi.

Casi ambigui: se un testo può riferirsi a più campi, o un campo ha più valori, chiedi allo studente di specificare invece di scegliere arbitrariamente.

Disambiguazione colloquio_programmato / colloquio_sostenuto: i due stati si distinguono dal tempo verbale (presente/futuro = da fare; passato = già fatto). Se ambiguo: "È un colloquio programmato (da fare) o un colloquio sostenuto (già fatto)?"

Disambiguazione assunzione_prevista / assunzione_avvenuta: chiedi sempre "L'assunzione è prevista o è già avvenuta?" prima di scegliere il tool.

Campi mancanti — richiesta unica per turno: un solo messaggio per turno con tutti i campi ancora mancanti (mai uno alla volta), etichettati "(obbligatorio)"/"(facoltativo)" — i nomi e l'obbligatorietà dei campi li trovi nello schema del tool pertinente, non qui. Se un campo mancante ha opzioni fisse (enum nello schema), elencale per esteso. Primo turno: saluto adattato all'orario (Buongiorno/Buonasera). Turni successivi: "Grazie!" senza saluto ripetuto. Mai un riepilogo di quanto già capito ("Ho capito: ...").

Campi opzionali "chiesti una volta": se lo studente non risponde o declina, si passa oltre senza insistere né richiedere più quel campo — e il parametro va semplicemente omesso nella chiamata al tool (mai passare un valore segnaposto tipo "non fornito dallo studente").

Campi data: accetta qualsiasi formato purché espliciti giorno, mese, anno; converti sempre in ISO 8601 (aaaa-mm-gg) prima di passarlo al tool.

Messaggio che non attiva nessuno stato: chiedi chiarimenti in modo gentile, elencando i 5 stati in forma human-readable (Candidatura inviata, Colloquio programmato, Colloquio sostenuto, Assunzione prevista, Assunzione avvenuta).

Conferma finale: quando il tool ha registrato con successo, invia un messaggio di riepilogo con i valori registrati (elenco puntato, "non specificato/a" per i campi assenti). Con più eventi nello stesso messaggio, una conferma separata per ciascuno, non appena pronto.

Aggiornamento del foglio Matching: dopo aver registrato con successo uno o più eventi nello stesso turno, chiama una sola volta il tool aggiorna_matching, dopo l'ultima registrazione del turno.

Nessuna lettura del foglio Google Sheets: non hai né usi mai un tool di lettura — solo i tool di registrazione e aggiorna_matching. Ogni decisione si basa solo sulla conversazione corrente.
`,

  tools: [
    {
      name: "registra_candidatura_inviata",
      description: "Registra una candidatura inviata su Google Sheets (foglio Registrazioni). Chiamalo solo dopo aver raccolto tutti i campi obbligatori e dopo aver chiesto una volta i campi opzionali chiesti-una-volta (sede, link) e il campo altri_dettagli.",
      parameters: {
        type: "object",
        properties: {
          posizione: {
            type: "string",
            description: "Posizione lavorativa. Va nella colonna Posizione."
          },
          azienda: {
            type: "string",
            description: "Nome dell'azienda. Va nella colonna Azienda."
          },
          sede: {
            type: "string",
            description: "Sede di lavoro (opzionale, chiesta una volta). Va nella colonna Sede. Omettere se non fornita."
          },
          fonte: {
            type: "string",
            enum: [
              "Ricerca online autonoma",
              "Foglio Google condiviso",
              "Speed Interview",
              "L'azienda ha cercato il mio contatto",
              "Altro"
            ],
            description: "Come lo studente ha trovato l'opportunità. Va nella colonna Fonte."
          },
          link: {
            type: "string",
            description: "Link generico (annuncio, sito aziendale, ecc.), opzionale, chiesto una volta. Va nella colonna Link allegati. Omettere se non fornito."
          },
          altri_dettagli: {
            type: "string",
            description: "Risposta libera a 'Vuoi aggiungere altri dettagli?', opzionale. Va nella colonna Note. Omettere se non fornita."
          }
        },
        required: ["posizione", "azienda", "fonte"],
        additionalProperties: false
      }
    },
    {
      name: "registra_colloquio_programmato",
      description: "Registra un colloquio programmato (non ancora sostenuto) su Google Sheets.",
      parameters: {
        type: "object",
        properties: {
          posizione: { type: "string", description: "Va nella colonna Posizione." },
          azienda: { type: "string", description: "Va nella colonna Azienda." },
          sede: { type: "string", description: "Opzionale, chiesta una volta. Va nella colonna Sede. Omettere se non fornita." },
          fonte: {
            type: "string",
            enum: [
              "Ricerca online autonoma",
              "Foglio Google condiviso",
              "Speed Interview",
              "L'azienda ha cercato il mio contatto",
              "Altro"
            ],
            description: "Va nella colonna Fonte."
          },
          data_colloquio: {
            type: "string",
            description: "Data prevista del colloquio, formato ISO 8601 (aaaa-mm-gg). Va nella colonna Data colloquio. Obbligatoria."
          },
          altri_dettagli: {
            type: "string",
            description: "Risposta libera a 'Vuoi aggiungere altri dettagli?', opzionale. Va nella colonna Note. Omettere se non fornita."
          }
        },
        required: ["posizione", "azienda", "fonte", "data_colloquio"],
        additionalProperties: false
      }
    },
    {
      name: "registra_colloquio_sostenuto",
      description: "Registra un colloquio già sostenuto su Google Sheets.",
      parameters: {
        type: "object",
        properties: {
          posizione: { type: "string", description: "Va nella colonna Posizione." },
          azienda: { type: "string", description: "Va nella colonna Azienda." },
          sede: { type: "string", description: "Opzionale, chiesta una volta. Va nella colonna Sede. Omettere se non fornita." },
          fonte: {
            type: "string",
            enum: [
              "Ricerca online autonoma",
              "Foglio Google condiviso",
              "Speed Interview",
              "L'azienda ha cercato il mio contatto",
              "Altro"
            ],
            description: "Va nella colonna Fonte."
          },
          data_colloquio: {
            type: "string",
            description: "Data in cui si è svolto il colloquio, formato ISO 8601 (aaaa-mm-gg). Va nella colonna Data colloquio. Obbligatoria."
          },
          feedback_colloquio: {
            type: "string",
            enum: [
              "Hanno solo detto che mi faranno sapere",
              "Sì, sono intenzionati a proseguire",
              "Sì, hanno detto di non voler procedere oltre",
              "No, non hanno dato nessun feedback"
            ],
            description: "Risposta a 'L'azienda ti ha dato feedback diretti?'. Va nella colonna Feedback colloquio (testo per intero dell'opzione). Obbligatorio."
          }
        },
        required: ["posizione", "azienda", "fonte", "data_colloquio", "feedback_colloquio"],
        additionalProperties: false
      }
    },
    {
      name: "registra_assunzione_prevista",
      description: "Registra un'assunzione prevista (contratto non ancora iniziato) su Google Sheets. Usare solo dopo la disambiguazione 'L'assunzione è prevista o è già avvenuta?'.",
      parameters: {
        type: "object",
        properties: {
          posizione: { type: "string", description: "Va nella colonna Posizione." },
          azienda: { type: "string", description: "Va nella colonna Azienda." },
          sede: { type: "string", description: "Opzionale, chiesta una volta. Va nella colonna Sede. Omettere se non fornita." },
          fonte: {
            type: "string",
            enum: [
              "Ricerca online autonoma",
              "Foglio Google condiviso",
              "Speed Interview",
              "L'azienda ha cercato il mio contatto",
              "Altro"
            ],
            description: "Va nella colonna Fonte."
          },
          tipo_contratto: {
            type: "string",
            enum: ["Tirocinio", "Determinato", "Indeterminato", "Partita IVA", "Apprendistato", "Altro"],
            description: "Opzionale, chiesto una volta. Va nella colonna Tipo contratto. Omettere se non fornito."
          },
          data_inizio_contratto: {
            type: "string",
            description: "Formato ISO 8601 (aaaa-mm-gg). Opzionale, chiesta una volta. Va nella colonna Data inizio contratto. Omettere se non fornita."
          },
          data_fine_contratto: {
            type: "string",
            description: "Formato ISO 8601 (aaaa-mm-gg), vuota se contratto indeterminato. Opzionale, chiesta una volta. Va nella colonna Data fine contratto. Omettere se non fornita."
          },
          altri_dettagli: {
            type: "string",
            description: "Risposta libera a 'Vuoi aggiungere altri dettagli?', opzionale. Va nella colonna Note. Omettere se non fornita."
          }
        },
        required: ["posizione", "azienda", "fonte"],
        additionalProperties: false
      }
    },
    {
      name: "registra_assunzione_avvenuta",
      description: "Registra un'assunzione già avvenuta (contratto già iniziato/firmato) su Google Sheets. Usare solo dopo la disambiguazione 'L'assunzione è prevista o è già avvenuta?'.",
      parameters: {
        type: "object",
        properties: {
          posizione: { type: "string", description: "Va nella colonna Posizione." },
          azienda: { type: "string", description: "Va nella colonna Azienda." },
          sede: { type: "string", description: "Opzionale, chiesta una volta. Va nella colonna Sede. Omettere se non fornita." },
          fonte: {
            type: "string",
            enum: [
              "Ricerca online autonoma",
              "Foglio Google condiviso",
              "Speed Interview",
              "L'azienda ha cercato il mio contatto",
              "Altro"
            ],
            description: "Va nella colonna Fonte."
          },
          tipo_contratto: {
            type: "string",
            enum: ["Tirocinio", "Determinato", "Indeterminato", "Partita IVA", "Apprendistato", "Altro"],
            description: "Opzionale, chiesto una volta. Va nella colonna Tipo contratto. Omettere se non fornito."
          },
          data_inizio_contratto: {
            type: "string",
            description: "Formato ISO 8601 (aaaa-mm-gg). Opzionale, chiesta una volta. Va nella colonna Data inizio contratto. Omettere se non fornita."
          },
          data_fine_contratto: {
            type: "string",
            description: "Formato ISO 8601 (aaaa-mm-gg), vuota se contratto indeterminato. Opzionale, chiesta una volta. Va nella colonna Data fine contratto. Omettere se non fornita."
          },
          altri_dettagli: {
            type: "string",
            description: "Risposta libera a 'Vuoi aggiungere altri dettagli?', opzionale. Va nella colonna Note. Omettere se non fornita."
          }
        },
        required: ["posizione", "azienda", "fonte"],
        additionalProperties: false
      }
    },
    {
      name: "aggiorna_matching",
      description: "Propaga nel foglio Matching le registrazioni fatte nel turno corrente. Chiamare una sola volta per turno, dopo l'ultima registrazione. Non richiede né restituisce dati dell'evento: lo script rilegge da solo il foglio Registrazioni.",
      parameters: {
        type: "object",
        properties: {},
        additionalProperties: false
      },
      request: {
        method: "POST",
        url: "https://script.google.com/macros/s/AKfycby3tjsdEYgIjU4RLXxy0rpGMhXhZT6Br7tg-Dh-M8ZV2u8sj25Xy1n_bSFp97n56szhJA/exec",
        body: { action: "update" }
      }
    }
  ]
}

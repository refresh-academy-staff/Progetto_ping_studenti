# Test del bot — prompt Code

Da tenere aperto mentre provi il bot. Per ogni turno: cosa scrivi tu, cosa deve fare il bot. Spunta la casella se il comportamento è quello atteso; se no, annota cosa ha fatto davvero.

## Prima di iniziare

- [ ] Schema caricato nello Structured Output Parser (**prima** del prompt)
- [ ] Prompt `AI_Bot_Instructions_Code.js` caricato **intero**, con le tre righe `const` in cima
- [ ] Simple Memory con una finestra di 10-15 messaggi
- [ ] Ogni test si fa in un **thread nuovo** (nuovo messaggio nel canale)

## Da controllare sempre, in ogni test

- Nessun "Ti confermo", nessuna emoji scritta dal bot, niente Markdown (trattini, asterischi), nessuno slug mostrato allo studente
- Le date nei messaggi sono leggibili ("3 settembre 2026"), mai `2026-09-03`
- Nessuna riga su Sheets prima del sì al riepilogo
- Sulla riga di Sheets: date in formato `aaaa-mm-gg`, mai la frase "non fornito dallo studente"
- Nelle esecuzioni di n8n: nessun errore del parser

---

## 1. Percorso completo, con i vecchi bug

| # | Tu scrivi | Il bot deve | ✓ |
|---|---|---|---|
| 1 | Mi sono candidato come sviluppatore presso Acme Srl | Salutare secondo l'ora (Buongiorno prima delle 14, Buon pomeriggio fino alle 18, poi Buonasera). Chiedere sede (facoltativo) e fonte (obbligatorio, con le 5 opzioni) | [ ] |
| 2 | L'ho trovata su LinkedIn | **Non** ripetere la domanda sulla fonte. **Non** richiedere la sede. Chiedere il link | [ ] |
| 3 | no | Chiedere "Vuoi aggiungere altri dettagli?" | [ ] |
| 4 | Il titolare è bravo, hanno il tavolo da biliardo e il caffè, l'ufficio è a Bologna | Mostrare il riepilogo: nota **intera**, sede "non specificata" (**non** Bologna), posizione invariata, fonte "Ricerca online autonoma". Chiedere "Confermi che posso registrare?" | [ ] |
| 5 | ok | Rispondere "Perfetto, ho registrato tutto." | [ ] |

Su Sheets: fonte `online_autonomo`, sede vuota, link vuoto, nota intera. Il thread si chiude col lucchetto. [ ]

In ogni riepilogo, di qualunque test: la prima riga è "Tipo di aggiornamento: …" con lo stato giusto (per esempio "Candidatura inviata"). [ ]
Prova una volta a correggerlo: al riepilogo di un colloquio sostenuto scrivi "no, il colloquio devo ancora farlo" → il bot deve passare a Colloquio programmato, togliere il feedback e riproporre il riepilogo. [ ]

## 1b. Raccolta in due passi

| # | Tu scrivi | Il bot deve | ✓ |
|---|---|---|---|
| 1 | Ho sostenuto un colloquio con Acme Srl come sviluppatore | Primo messaggio: **solo** sede e fonte | [ ] |
| 2 | Milano, trovato su LinkedIn | Secondo messaggio: data del colloquio e feedback | [ ] |

| # | Tu scrivi, in un thread nuovo | Il bot deve | ✓ |
|---|---|---|---|
| 1 | Mi sono candidato come sviluppatore presso Acme Srl, l'ho trovato su LinkedIn | Chiedere la sede (facoltativo) in un messaggio a sé, prima di andare avanti | [ ] |
| 2 | no | Passare al link, senza richiedere la sede | [ ] |

## 2. Link

| # | Situazione | Tu scrivi | Il bot deve | ✓ |
|---|---|---|---|---|
| 1 | Primo messaggio | Mi sono candidato come data analyst in Beta SpA, ecco l'annuncio: www.beta.it/jobs | Più avanti **non** chiedere il link. Su Sheets il link è esattamente `www.beta.it/jobs`, senza `https://`. L'azienda resta Beta SpA (non dedotta dall'URL) | [ ] |
| 2 | Alla domanda sul link | sì | Chiedere "Qual è il link?" | [ ] |
| 3 | Subito dopo | sì | Passare alle note, link vuoto | [ ] |
| 4 | Alla domanda sul link | no, però la sede è Milano | Link vuoto, sede Milano | [ ] |

## 3. Fonte

| Tu scrivi, alla domanda sulla fonte | Su Sheets | ✓ |
|---|---|---|
| mi ha scritto un recruiter su LinkedIn | `da_azienda` | [ ] |
| me l'ha detto un amico | `altro` | [ ] |

## 4. Riepilogo: conferma, diniego, correzione, annullamento

Porta ogni volta la conversazione fino al riepilogo, poi:

| Tu scrivi | Il bot deve | ✓ |
|---|---|---|
| perfetto | Registrare | [ ] |
| no | Chiedere "Vuoi correggere qualcosa o preferisci non registrare?", **senza** ripetere il riepilogo | [ ] |
| … poi: la sede è Milano | Mostrare il riepilogo aggiornato con Milano; al sì, registrare | [ ] |
| sì, ma l'azienda è Gamma Srl | **Non** registrare; mostrare il riepilogo con Gamma Srl | [ ] |
| annulla | "Va bene, non lo registro…"; nessuna riga su Sheets; il thread **non** si chiude | [ ] |
| 👍 scritto come messaggio | Registrare | [ ] |
| 👍 come **reazione** al messaggio | Niente (limite noto: le reazioni non arrivano al workflow) | [ ] |

## 5. Colloquio ambiguo

| # | Tu scrivi | Il bot deve | ✓ |
|---|---|---|---|
| 1 | Ho un colloquio con Acme Srl come sviluppatore | Chiedere "È un colloquio programmato (da fare) o sostenuto (già fatto)?" | [ ] |
| 2 | già fatto | Chiedere sede e fonte: **non** azienda e posizione | [ ] |
| 3 | trovato su Indeed; il colloquio era il 3 settembre 2026 e mi hanno detto che mi faranno sapere | Non richiedere la sede (saltata), né data e feedback (già dati, anche se non ancora chiesti): passare al link. Il feedback riconosciuto è "Hanno solo detto che mi faranno sapere" | [ ] |

## 6. Assunzione ambigua

| # | Tu scrivi | Il bot deve | ✓ |
|---|---|---|---|
| 1 | Mi hanno assunto da Gamma Srl come sviluppatore | Chiedere "L'assunzione è prevista o è già avvenuta?" | [ ] |
| 2 | già avvenuta | Chiedere sede e fonte: **non** azienda e posizione | [ ] |
| 3 | Bologna, mi ha contattato l'azienda | Chiedere tipo di contratto, data di inizio e data di fine | [ ] |
| 4 | Indeterminato, ho iniziato il 1 settembre 2026 | Passare al link, **senza** richiedere la data di fine contratto | [ ] |

Su Sheets: stato `assunzione_avvenuta`, contratto `contratto_indet`, data di fine vuota. Nel riepilogo la data di fine **non** compare. [ ]

Prova anche, in un thread nuovo: "Mi assumeranno da Gamma Srl" → deve chiedere se è prevista o già avvenuta. [ ]

## 7. Date

| Tu scrivi | Il bot deve | ✓ |
|---|---|---|
| Ho un colloquio con Acme Srl il 3 settembre 2026 | Chiedere se è programmato o sostenuto (la data è passata) | [ ] |
| Mi hanno fissato un colloquio con Acme Srl come sviluppatore → alla domanda sulla data, una data **già passata** | Accorgersene e chiedere se l'hai già sostenuto o se la data è un'altra | [ ] |
| Ho sostenuto un colloquio con Acme Srl come sviluppatore il 3 settembre | Chiedere l'anno | [ ] |
| … poi: non lo so | Spiegare che senza l'anno non può registrare (puoi scriverlo più tardi o annullare). **Non** chiedere "un giorno indicativo" | [ ] |
| Ho fatto un colloquio con Acme Srl la settimana scorsa | Chiedere il giorno, non inventarlo | [ ] |
| Ho sostenuto un colloquio con Acme Srl ieri | Convertire "ieri" nella data giusta (la vedi nel riepilogo) | [ ] |
| Mi hanno rimandato al secondo round con Beta SpA come analyst | Stato colloquio sostenuto, feedback **non** richiesto ("intenzionati a proseguire"); chiedere la data del colloquio già fatto | [ ] |

## 8. Un evento per conversazione

| Tu scrivi | Il bot deve | ✓ |
|---|---|---|
| Mi sono candidato come sviluppatore in Acme Srl e ho sostenuto un colloquio con Beta SpA | Raccogliere solo la candidatura in Acme e dirti di scrivere il colloquio con Beta in un nuovo messaggio. Alla fine, **una sola** riga su Sheets | [ ] |
| A metà raccolta: ah, e mi sono candidato anche da Gamma Srl | Non mescolare i dati di Gamma con Acme; dirti di scriverlo in un nuovo messaggio | [ ] |

## 9. Uscite a metà raccolta

| Situazione | Tu scrivi | Il bot deve | ✓ |
|---|---|---|---|
| Raccolta di un colloquio programmato | il colloquio è saltato | Togliere l'evento e rimandare al form dalla Home | [ ] |
| Raccolta di un colloquio programmato | anzi, l'hanno spostato al 10 ottobre 2026 | Aggiornare la data (**non** rimandare al form) | [ ] |
| Alla richiesta della posizione | non me la ricordo | Spiegare che senza posizione non può registrare; puoi scriverla più tardi o annullare | [ ] |
| Qualunque momento prima del riepilogo | non voglio più registrarlo | "Va bene, non lo registro…" | [ ] |

## 10. Note: casi particolari

Alla domanda "Vuoi aggiungere altri dettagli?":

| Tu scrivi | Il bot deve | ✓ |
|---|---|---|
| sì | Chiedere "Cosa vuoi aggiungere?" | [ ] |
| … poi: sì | Passare al riepilogo, note vuote | [ ] |
| lascia stare | Note vuote (**non** "lascia stare" come nota) | [ ] |
| c'è anche la pagina del team www.acme.it/team | Tutto nella nota; il link **non** cambia | [ ] |
| hanno annullato la riunione di team di oggi | Tutto nella nota; **non** annullare la registrazione | [ ] |

## 11. Primo messaggio generico o non registrabile

| Tu scrivi | Il bot deve | ✓ |
|---|---|---|
| Ciao | Salutare e chiedere cosa vuoi registrare, elencando i 5 stati | [ ] |
| … poi: Colloquio sostenuto | Chiedere i campi del colloquio sostenuto | [ ] |
| Il colloquio con Acme Srl è stato annullato | Rimandare al form dalla Home | [ ] |

---

## Note dei test

Scrivi qui cosa non ha funzionato: numero del test, cosa hai scritto, cosa ha risposto il bot.


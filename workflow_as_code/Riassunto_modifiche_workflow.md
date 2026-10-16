# Riepilogo delle modifiche al workflow Slack su n8n

16 ottobre 2026

## In breve

Il workflow fa le stesse cose di prima, con circa 15 nodi invece di 28. La logica di decisione, prima sparsa tra IF, tre Switch, un Filter e dieci nodi Code, ora sta in tre nodi Code: `payload_parser`, `build_view` e `build_submission`. Lungo il lavoro sono stati corretti tre bug, tra cui uno che impediva di salvare una registrazione quando l'utente non indicava la sede.

Tutte le modifiche sono state verificate in un workflow di prova con 16 scenari di dati finti.

## Prima e dopo

| Blocco | Prima | Dopo |
| --- | --- | --- |
| Smistamento | payload\_parser, is\_notification (IF), Switch con 6 regole su campi diversi, action/submission, action/submission2, Filter1 | payload\_parser (calcola `action`), Switch con 9 regole tutte su `action` + Fallback |
| Form | open\_info\_azienda, open\_info\_matching, update\_new\_matching\_form, build\_update\_form, update\_update\_form3 + 5 nodi HTTP verso Slack | build\_view + slack\_view |
| Invii | get\_submission\_info\_new, get\_submission\_info\_update, 2 nodi Google Sheets, 2 nodi HTTP verso lo script | build\_submission + save\_row + notify\_script |
| Messaggi | notify\_user, send\_welcome\_message, create\_thread\_new | invariato |

Restano invariati anche `Webhook1`, il `Wait` (spostato prima di `build_view`) e `get_selected_matching`, che legge il foglio Matching.

## Le modifiche nel dettaglio

### Smistamento

`payload_parser`, oltre a trasformare il `payload` di Slack in oggetto, ora calcola un campo `action` che dice che evento è: per esempio `open_new_form`, `new_matching_details_click`, `update_form_submit`. Guarda `body.type`, `payload.type`, `view.callback_id` e il primo elemento di `actions`, nello stesso ordine in cui lo faceva il vecchio Switch. Un evento non riconosciuto riceve `action: "other"`.

Lo Switch ora ha regole tutte uguali che confrontano solo `{{ $json.action }}`, più un'uscita Fallback per `other`. L'IF delle notifiche, i due Switch secondari e `Filter1` non servono più: la distinzione tra clic (`block_actions`) e invio (`view_submission`) è dentro `action`.

### Form

I cinque nodi Code che costruivano i form sono diventati cinque funzioni dentro `build_view`, con il codice originale invariato. Uno `switch` su `action` chiama la funzione giusta. Ogni funzione restituisce `slackMethod` (`views.open` o `views.update`) e `slackBody`.

Le cinque chiamate HTTP a Slack sono diventate un solo nodo, `slack_view`, che chiama `https://slack.com/api/{{ $json.slackMethod }}`.

### Invii

`build_submission` unisce i due nodi Code degli invii. La parte che leggeva i valori del form era identica nei due nodi ed è scritta una volta sola. Per ogni invio il nodo prepara la riga con i nomi delle colonne, l'ID del foglio (`_sheetId`) e il contenuto per lo script (`_script`).

`save_row` è un unico nodo Google Sheets che sceglie il foglio per ID e mappa le colonne in automatico. `notify_script` è un unico nodo HTTP che manda allo script Google il contenuto di `_script`. Righe e chiamate allo script sono identiche a prima: il confronto è stato fatto colonna per colonna.

## Bug corretti

| Bug | Effetto per l'utente | Correzione |
| --- | --- | --- |
| Il riepilogo del form veniva letto per posizione (`fields[5]`, `fields[7]`) | Senza sede, il nodo andava in errore e la registrazione **non veniva salvata** | Il riepilogo ora si legge per etichetta (`*Sede*`, `*Fonte*`); la sede mancante diventa una cella vuota |
| In `removeMrkdwn` la condizione `first !== "_" \|\| first !== "*"` era sempre vera, e in caso di testo inatteso restituiva un oggetto `{error}` | Nel foglio poteva comparire `[object Object]` | Condizione corretta con `&&`; il testo inatteso viene restituito così com'è |
| `formInfoAzienda` restituiva `openViewBlocks` invece di `slackBody` (introdotto durante la riscrittura e trovato dai test) | Il primo form non si sarebbe aperto | Corretto prima del rilascio |

## Comportamenti cambiati da conoscere

Per l'utente Slack non cambia nulla, ma chi mantiene il workflow deve sapere cinque cose.

- **Errori espliciti.** Se mancano dati essenziali (utente, valori del form, ID del matching), `build_submission` si ferma con un errore chiaro. Prima proseguiva e scriveva nel foglio una riga quasi vuota. Allo stesso modo, `build_view` si ferma con "azione non gestita" se riceve un'`action` sconosciuta.
- **Fallback visibile.** Gli eventi non riconosciuti finiscono nell'uscita Fallback dello Switch. Ci finisce anche la scelta della "fonte" nel primo form, che prima veniva scartata da `Filter1`.
- **Nomi delle colonne nel codice.** `save_row` scrive ogni campo nella colonna con lo stesso nome. Rinominare una colonna nel foglio senza aggiornare `build_submission` fa restare vuota quella colonna, senza errori.
- **Fogli scelti per ID.** Registrazioni è il foglio `935935300`, Aggiornamenti\_matching il `594811163`. I fogli sono identificati per ID, come già prima: ora gli ID (935935300 per Registrazioni, 594811163 per Aggiornamenti_matching) sono scritti nel codice di build_submission. Se un foglio viene ricreato, l’ID va aggiornato lì
- **Wait spostato.** La pausa di mezzo secondo ora sta prima di `build_view` sul ramo `form_submit`, invece che dopo `open_info_matching`. L'effetto è lo stesso.

## Verifiche

La logica è stata verificata con 16 scenari di dati finti caricati sul Webhook di un workflow di prova: tutti i tipi di evento dello Switch, le varianti con e senza sede, i diversi bottoni dei form e due casi che devono finire nel Fallback. Tutti danno il risultato atteso. Per gli invii, le righe prodotte da `build_submission` sono state confrontate con quelle dei vecchi nodi e coincidono colonna per colonna.

I dati finti non possono verificare Slack e Google. In produzione restano da controllare:

- [ ] apertura e aggiornamento reali dei form in Slack, su tutto il percorso di un nuovo matching e di un aggiornamento;
- [ ] scrittura nel foglio con la mappatura automatica: valori nelle colonne giuste e nessuna colonna nuova (`_sheet`, `_sheetId`, `_script`);
- [ ] una registrazione senza sede, per confermare la correzione del bug;
- [ ] eliminazione delle righe di prova finite nei fogli Registrazioni, Aggiornamenti\_matching ed eventualmente Matching durante i test.

## Punti aperti e riferimenti

Alcuni miglioramenti sono stati individuati ma non ancora fatti, perché non bloccano il funzionamento:

| Punto | Tipo |
| --- | --- |
| Funzioni di supporto duplicate dentro `build_view` (più versioni di `buildButton`, `buildOption`, `buildTextBox`, `buildDatePicker`) | semplificazione |
| `buildButton` trasforma lo stile `primary` (verde) in `danger` (rosso): i bottoni sono rossi | da decidere |
| Se il matching scelto non è nel foglio, il ramo si ferma senza avvisare l'utente | robustezza |
| `formApriAggiornamento` non gestisce valori imprevisti di "Ultima attività" | robustezza |
| Un `if` su `selezione_stato_assunzione` legge un campo inesistente e non ha effetto | pulizia |
| La colonna "Data registrazione" del foglio Registrazioni è sempre vuota | da verificare |

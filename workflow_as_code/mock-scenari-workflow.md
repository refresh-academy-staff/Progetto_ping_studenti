# Mock data per il workflow Slack su n8n

Questo file raccoglie dei dati di prova inventati per testare il workflow Slack scenario per scenario, senza dover generare ogni volta un evento reale in Slack. Ogni mock va incollato come output fissato (*pin*) del nodo `Webhook1`, così l'esecuzione parte da `payload_parser` e prova l'intera catena: il calcolo di `action`, la scelta dell'uscita dello Switch e il risultato del nodo finale.

Tutti gli identificativi (utente, team, `trigger_id`, `view_id`, ID dei matching) sono finti, e il campo `token` contiene un valore fittizio, quindi il file si può pubblicare su un repository senza esporre dati reali. Per lo stesso motivo, conviene non aggiungere mai a questo file l'output di esecuzioni vere, che contengono token e ID autentici.

I risultati attesi sono stati verificati eseguendo il codice del workflow (`payload_parser`, `build_view`, `get_submission_info_new` corretto e `get_submission_info_update`) su ciascun mock.

## Come si usano

Apri il nodo `Webhook1`, usa *Edit output* nel pannello di output, cancella il contenuto e incolla il JSON dello scenario che vuoi provare. `payload_parser` legge solo il primo item, quindi si prova uno scenario alla volta: per passare a un altro scenario basta sostituire i dati fissati.

Un nodo con dati fissati non viene eseguito: n8n usa direttamente i dati fissati come suo output. Per eseguire l'intero workflow con *Execute workflow* senza effetti reali, fissa un output finto come `[{"ok": true}]` sui nodi che scrivono o chiamano servizi esterni: `slack_view`, `notify_user`, `send_welcome_message`, `create_thread_new`, `append_new_matching_form`, `add_matching1`, `append_matching_update` e `update_matching`. Se invece vuoi solo controllare un nodo Code, puoi usare *Execute step* su quel nodo.

Senza questi output finti, `slack_view` riceverà comunque una risposta da Slack con `"ok": false`, perché `trigger_id` e `view_id` sono inventati. È normale e non indica un problema nel workflow. Per lo scenario 12 serve anche un output fissato su `get_selected_matching`, indicato nella sezione dello scenario.

Ricordati di togliere i dati fissati (icona della puntina) quando hai finito: nelle esecuzioni reali vengono ignorati, ma lasciarli rende confusi i test successivi.

## Riepilogo degli scenari

| # | Scenario | `action` | Uscita dello Switch |
|---|---|---|---|
| 01 | Notifica in arrivo | `notification` | notification |
| 02 | Bottone di benvenuto (new_opp_bot) | `new_opp_bot` | new_opp_bot |
| 03 | Apertura del primo form (open_new_form) | `open_new_form` | open_new_form |
| 04 | Invio del primo form, con sede | `new_matching_form_submit` | form_submit |
| 05 | Invio del primo form, senza sede | `new_matching_form_submit` | form_submit |
| 06 | Secondo form: clic su "Candidatura" | `new_matching_details_click` | details_click |
| 07 | Secondo form: clic su "Colloquio" | `new_matching_details_click` | details_click |
| 08 | Secondo form: colloquio "Sostenuto" | `new_matching_details_click` | details_click |
| 09 | Secondo form: clic su "Assunzione" | `new_matching_details_click` | details_click |
| 10 | Invio del secondo form, con sede | `new_matching_details_submit` | details_submit |
| 11 | Invio del secondo form, senza sede | `new_matching_details_submit` | details_submit |
| 12 | Scelta di un matching da aggiornare | `selezione_matching` | selezione |
| 13 | Form di aggiornamento: clic su "Colloquio" | `update_form_click` | form_click |
| 14 | Invio del form di aggiornamento | `update_form_submit` | update_submit |
| 15 | Fallback: scelta della fonte nel primo form | `other` | Fallback |
| 16 | Fallback: evento sconosciuto | `other` | Fallback |

## Scenari

### 01 – Notifica in arrivo

Una notifica inviata da un sistema esterno (non da Slack), con `type`, `user` e `text` direttamente nel body.

**Percorso atteso:** Switch → notification → notify_user

**Risultato atteso:** `notify_user` riceve `user` = `U_TEST_001` e `text` = "Messaggio di prova dalla notifica".

**Dati da fissare su `Webhook1`:**

```json
[
  {
    "headers": {
      "host": "n8nrefresh.duckdns.org",
      "user-agent": "Google-Apps-Script",
      "content-type": "application/json",
      "x-slack-request-timestamp": "1791973077",
      "x-slack-signature": "v0=mock"
    },
    "params": {},
    "query": {},
    "body": {
      "type": "notification",
      "user": "U_TEST_001",
      "text": "Messaggio di prova dalla notifica"
    },
    "webhookUrl": "https://n8nrefresh.duckdns.org/webhook/MOCK",
    "executionMode": "test"
  }
]
```

### 02 – Bottone di benvenuto (new_opp_bot)

Clic su un bottone in un messaggio con valore `new_opp_bot`.

**Percorso atteso:** Switch → new_opp_bot → send_welcome_message → create_thread_new

**Risultato atteso:** `send_welcome_message` riceve l'ID utente `U_TEST_001` da `payload.user.id`.

**Dati da fissare su `Webhook1`:**

```json
[
  {
    "headers": {
      "host": "n8nrefresh.duckdns.org",
      "user-agent": "Slackbot 1.0 (+https://api.slack.com/robots)",
      "content-type": "application/x-www-form-urlencoded",
      "x-slack-request-timestamp": "1791973077",
      "x-slack-signature": "v0=mock"
    },
    "params": {},
    "query": {},
    "body": {
      "payload": "{\"type\": \"block_actions\", \"user\": {\"id\": \"U_TEST_001\", \"username\": \"utente.test\", \"name\": \"utente.test\", \"team_id\": \"T_TEST\"}, \"api_app_id\": \"A_TEST\", \"token\": \"MOCK_TOKEN\", \"trigger_id\": \"MOCK_TRIGGER_ID\", \"team\": {\"id\": \"T_TEST\", \"domain\": \"workspace-test\"}, \"container\": {\"type\": \"message\", \"message_ts\": \"1791973077.000200\", \"channel_id\": \"D_TEST\"}, \"channel\": {\"id\": \"D_TEST\", \"name\": \"directmessage\"}, \"actions\": [{\"type\": \"button\", \"action_id\": \"start_bot\", \"block_id\": \"welcome_actions\", \"value\": \"new_opp_bot\", \"text\": {\"type\": \"plain_text\", \"text\": \"Inizia\"}, \"action_ts\": \"1791973077.000100\"}]}"
    },
    "webhookUrl": "https://n8nrefresh.duckdns.org/webhook/MOCK",
    "executionMode": "test"
  }
]
```

### 03 – Apertura del primo form (open_new_form)

Clic sul bottone "nuova opportunità", con valore `new_opp_form`.

**Percorso atteso:** Switch → open_new_form → build_view → slack_view

**Risultato atteso:** L'output di `build_view` contiene `slackMethod: "views.open"` e in `slackBody` un form "Nuova opportunità", 5 blocchi, callback_id new_matching_form, pulsante "Avanti".

**Dati da fissare su `Webhook1`:**

```json
[
  {
    "headers": {
      "host": "n8nrefresh.duckdns.org",
      "user-agent": "Slackbot 1.0 (+https://api.slack.com/robots)",
      "content-type": "application/x-www-form-urlencoded",
      "x-slack-request-timestamp": "1791973077",
      "x-slack-signature": "v0=mock"
    },
    "params": {},
    "query": {},
    "body": {
      "payload": "{\"type\": \"block_actions\", \"user\": {\"id\": \"U_TEST_001\", \"username\": \"utente.test\", \"name\": \"utente.test\", \"team_id\": \"T_TEST\"}, \"api_app_id\": \"A_TEST\", \"token\": \"MOCK_TOKEN\", \"trigger_id\": \"MOCK_TRIGGER_ID\", \"team\": {\"id\": \"T_TEST\", \"domain\": \"workspace-test\"}, \"container\": {\"type\": \"message\", \"message_ts\": \"1791973077.000300\", \"channel_id\": \"D_TEST\"}, \"channel\": {\"id\": \"D_TEST\", \"name\": \"directmessage\"}, \"actions\": [{\"type\": \"button\", \"action_id\": \"open_form\", \"block_id\": \"new_opp_actions\", \"value\": \"new_opp_form\", \"text\": {\"type\": \"plain_text\", \"text\": \"Nuova opportunità\"}, \"action_ts\": \"1791973077.000100\"}]}"
    },
    "webhookUrl": "https://n8nrefresh.duckdns.org/webhook/MOCK",
    "executionMode": "test"
  }
]
```

### 04 – Invio del primo form, con sede

L'utente compila azienda, posizione, sede e fonte e preme "Avanti".

**Percorso atteso:** Switch → form_submit → Wait → build_view → slack_view

**Risultato atteso:** L'output di `build_view` contiene `slackMethod: "views.open"` e in `slackBody` un form "Nuova opportunità", 4 blocchi, callback_id new_matching_details.

**Dati da fissare su `Webhook1`:**

```json
[
  {
    "headers": {
      "host": "n8nrefresh.duckdns.org",
      "user-agent": "Slackbot 1.0 (+https://api.slack.com/robots)",
      "content-type": "application/x-www-form-urlencoded",
      "x-slack-request-timestamp": "1791973077",
      "x-slack-signature": "v0=mock"
    },
    "params": {},
    "query": {},
    "body": {
      "payload": "{\"type\": \"view_submission\", \"user\": {\"id\": \"U_TEST_001\", \"username\": \"utente.test\", \"name\": \"utente.test\", \"team_id\": \"T_TEST\"}, \"api_app_id\": \"A_TEST\", \"token\": \"MOCK_TOKEN\", \"trigger_id\": \"MOCK_TRIGGER_ID\", \"team\": {\"id\": \"T_TEST\", \"domain\": \"workspace-test\"}, \"view\": {\"id\": \"V_TEST_001\", \"type\": \"modal\", \"callback_id\": \"new_matching_form\", \"private_metadata\": \"new_matching_form_private\", \"blocks\": [], \"state\": {\"values\": {\"nome_azienda\": {\"text_input\": {\"type\": \"plain_text_input\", \"value\": \"Acme\"}}, \"posizione\": {\"text_input\": {\"type\": \"plain_text_input\", \"value\": \"Full stack developer\"}}, \"sede\": {\"text_input\": {\"type\": \"plain_text_input\", \"value\": \"Bologna\"}}, \"fonte_opportunita\": {\"selezione_fonte\": {\"type\": \"static_select\", \"selected_option\": {\"text\": {\"type\": \"plain_text\", \"text\": \"Speed Interview\"}, \"value\": \"speed_interview\"}}}}}}}"
    },
    "webhookUrl": "https://n8nrefresh.duckdns.org/webhook/MOCK",
    "executionMode": "test"
  }
]
```

### 05 – Invio del primo form, senza sede

Come il precedente, ma la sede (facoltativa) è lasciata vuota.

**Percorso atteso:** Switch → form_submit → Wait → build_view → slack_view

**Risultato atteso:** L'output di `build_view` contiene `slackMethod: "views.open"` e in `slackBody` un form "Nuova opportunità", 4 blocchi, callback_id new_matching_details.

**Dati da fissare su `Webhook1`:**

```json
[
  {
    "headers": {
      "host": "n8nrefresh.duckdns.org",
      "user-agent": "Slackbot 1.0 (+https://api.slack.com/robots)",
      "content-type": "application/x-www-form-urlencoded",
      "x-slack-request-timestamp": "1791973077",
      "x-slack-signature": "v0=mock"
    },
    "params": {},
    "query": {},
    "body": {
      "payload": "{\"type\": \"view_submission\", \"user\": {\"id\": \"U_TEST_001\", \"username\": \"utente.test\", \"name\": \"utente.test\", \"team_id\": \"T_TEST\"}, \"api_app_id\": \"A_TEST\", \"token\": \"MOCK_TOKEN\", \"trigger_id\": \"MOCK_TRIGGER_ID\", \"team\": {\"id\": \"T_TEST\", \"domain\": \"workspace-test\"}, \"view\": {\"id\": \"V_TEST_001\", \"type\": \"modal\", \"callback_id\": \"new_matching_form\", \"private_metadata\": \"new_matching_form_private\", \"blocks\": [], \"state\": {\"values\": {\"nome_azienda\": {\"text_input\": {\"type\": \"plain_text_input\", \"value\": \"Acme\"}}, \"posizione\": {\"text_input\": {\"type\": \"plain_text_input\", \"value\": \"Full stack developer\"}}, \"sede\": {\"text_input\": {\"type\": \"plain_text_input\", \"value\": null}}, \"fonte_opportunita\": {\"selezione_fonte\": {\"type\": \"static_select\", \"selected_option\": {\"text\": {\"type\": \"plain_text\", \"text\": \"Speed Interview\"}, \"value\": \"speed_interview\"}}}}}}}"
    },
    "webhookUrl": "https://n8nrefresh.duckdns.org/webhook/MOCK",
    "executionMode": "test"
  }
]
```

### 06 – Secondo form: clic su "Candidatura"

Nel form con il riepilogo, l'utente preme il bottone Candidatura.

**Percorso atteso:** Switch → details_click → build_view → slack_view

**Risultato atteso:** L'output di `build_view` contiene `slackMethod: "views.update"` e in `slackBody` un form "Aggiornamento", 6 blocchi, callback_id new_matching_details, pulsante "Registra".

**Dati da fissare su `Webhook1`:**

```json
[
  {
    "headers": {
      "host": "n8nrefresh.duckdns.org",
      "user-agent": "Slackbot 1.0 (+https://api.slack.com/robots)",
      "content-type": "application/x-www-form-urlencoded",
      "x-slack-request-timestamp": "1791973077",
      "x-slack-signature": "v0=mock"
    },
    "params": {},
    "query": {},
    "body": {
      "payload": "{\"type\": \"block_actions\", \"user\": {\"id\": \"U_TEST_001\", \"username\": \"utente.test\", \"name\": \"utente.test\", \"team_id\": \"T_TEST\"}, \"api_app_id\": \"A_TEST\", \"token\": \"MOCK_TOKEN\", \"trigger_id\": \"MOCK_TRIGGER_ID\", \"team\": {\"id\": \"T_TEST\", \"domain\": \"workspace-test\"}, \"container\": {\"type\": \"view\", \"view_id\": \"V_TEST_001\"}, \"view\": {\"id\": \"V_TEST_001\", \"type\": \"modal\", \"callback_id\": \"new_matching_details\", \"private_metadata\": \"new_matching_details_private\", \"blocks\": [{\"type\": \"section\", \"block_id\": \"info_matching\", \"fields\": [{\"type\": \"mrkdwn\", \"text\": \"*Azienda*\", \"verbatim\": false}, {\"type\": \"mrkdwn\", \"text\": \"_Acme_\", \"verbatim\": false}, {\"type\": \"mrkdwn\", \"text\": \"*Posizione*\", \"verbatim\": false}, {\"type\": \"mrkdwn\", \"text\": \"_Full stack developer_\", \"verbatim\": false}, {\"type\": \"mrkdwn\", \"text\": \"*Sede*\", \"verbatim\": false}, {\"type\": \"mrkdwn\", \"text\": \"_Bologna_\", \"verbatim\": false}, {\"type\": \"mrkdwn\", \"text\": \"*Fonte*\", \"verbatim\": false}, {\"type\": \"mrkdwn\", \"text\": \"_Speed Interview_\", \"verbatim\": false}]}], \"state\": {\"values\": {}}}, \"actions\": [{\"type\": \"button\", \"action_id\": \"new_candidatura\", \"block_id\": \"selezione_aggiornamento_candidatura\", \"value\": \"nuova_candidatura\", \"text\": {\"type\": \"plain_text\", \"text\": \"Candidatura\"}, \"action_ts\": \"1791973077.000100\"}]}"
    },
    "webhookUrl": "https://n8nrefresh.duckdns.org/webhook/MOCK",
    "executionMode": "test"
  }
]
```

### 07 – Secondo form: clic su "Colloquio"

L'utente preme il bottone Colloquio.

**Percorso atteso:** Switch → details_click → build_view → slack_view

**Risultato atteso:** L'output di `build_view` contiene `slackMethod: "views.update"` e in `slackBody` un form "Aggiornamento", 3 blocchi, callback_id new_matching_details, pulsante "Registra".

**Dati da fissare su `Webhook1`:**

```json
[
  {
    "headers": {
      "host": "n8nrefresh.duckdns.org",
      "user-agent": "Slackbot 1.0 (+https://api.slack.com/robots)",
      "content-type": "application/x-www-form-urlencoded",
      "x-slack-request-timestamp": "1791973077",
      "x-slack-signature": "v0=mock"
    },
    "params": {},
    "query": {},
    "body": {
      "payload": "{\"type\": \"block_actions\", \"user\": {\"id\": \"U_TEST_001\", \"username\": \"utente.test\", \"name\": \"utente.test\", \"team_id\": \"T_TEST\"}, \"api_app_id\": \"A_TEST\", \"token\": \"MOCK_TOKEN\", \"trigger_id\": \"MOCK_TRIGGER_ID\", \"team\": {\"id\": \"T_TEST\", \"domain\": \"workspace-test\"}, \"container\": {\"type\": \"view\", \"view_id\": \"V_TEST_001\"}, \"view\": {\"id\": \"V_TEST_001\", \"type\": \"modal\", \"callback_id\": \"new_matching_details\", \"private_metadata\": \"new_matching_details_private\", \"blocks\": [{\"type\": \"section\", \"block_id\": \"info_matching\", \"fields\": [{\"type\": \"mrkdwn\", \"text\": \"*Azienda*\", \"verbatim\": false}, {\"type\": \"mrkdwn\", \"text\": \"_Acme_\", \"verbatim\": false}, {\"type\": \"mrkdwn\", \"text\": \"*Posizione*\", \"verbatim\": false}, {\"type\": \"mrkdwn\", \"text\": \"_Full stack developer_\", \"verbatim\": false}, {\"type\": \"mrkdwn\", \"text\": \"*Sede*\", \"verbatim\": false}, {\"type\": \"mrkdwn\", \"text\": \"_Bologna_\", \"verbatim\": false}, {\"type\": \"mrkdwn\", \"text\": \"*Fonte*\", \"verbatim\": false}, {\"type\": \"mrkdwn\", \"text\": \"_Speed Interview_\", \"verbatim\": false}]}], \"state\": {\"values\": {}}}, \"actions\": [{\"type\": \"button\", \"action_id\": \"new_colloquio\", \"block_id\": \"selezione_aggiornamento_candidatura\", \"value\": \"nuovo_colloquio\", \"text\": {\"type\": \"plain_text\", \"text\": \"Colloquio\"}, \"action_ts\": \"1791973077.000100\"}]}"
    },
    "webhookUrl": "https://n8nrefresh.duckdns.org/webhook/MOCK",
    "executionMode": "test"
  }
]
```

### 08 – Secondo form: colloquio "Sostenuto"

Dopo aver scelto Colloquio, l'utente seleziona "Sostenuto" nei pulsanti di scelta.

**Percorso atteso:** Switch → details_click → build_view → slack_view

**Risultato atteso:** L'output di `build_view` contiene `slackMethod: "views.update"` e in `slackBody` un form "Aggiornamento", 10 blocchi, callback_id new_matching_details, pulsante "Registra".

**Dati da fissare su `Webhook1`:**

```json
[
  {
    "headers": {
      "host": "n8nrefresh.duckdns.org",
      "user-agent": "Slackbot 1.0 (+https://api.slack.com/robots)",
      "content-type": "application/x-www-form-urlencoded",
      "x-slack-request-timestamp": "1791973077",
      "x-slack-signature": "v0=mock"
    },
    "params": {},
    "query": {},
    "body": {
      "payload": "{\"type\": \"block_actions\", \"user\": {\"id\": \"U_TEST_001\", \"username\": \"utente.test\", \"name\": \"utente.test\", \"team_id\": \"T_TEST\"}, \"api_app_id\": \"A_TEST\", \"token\": \"MOCK_TOKEN\", \"trigger_id\": \"MOCK_TRIGGER_ID\", \"team\": {\"id\": \"T_TEST\", \"domain\": \"workspace-test\"}, \"container\": {\"type\": \"view\", \"view_id\": \"V_TEST_001\"}, \"view\": {\"id\": \"V_TEST_001\", \"type\": \"modal\", \"callback_id\": \"new_matching_details\", \"private_metadata\": \"new_matching_details_private\", \"blocks\": [{\"type\": \"section\", \"block_id\": \"info_matching\", \"fields\": [{\"type\": \"mrkdwn\", \"text\": \"*Azienda*\", \"verbatim\": false}, {\"type\": \"mrkdwn\", \"text\": \"_Acme_\", \"verbatim\": false}, {\"type\": \"mrkdwn\", \"text\": \"*Posizione*\", \"verbatim\": false}, {\"type\": \"mrkdwn\", \"text\": \"_Full stack developer_\", \"verbatim\": false}, {\"type\": \"mrkdwn\", \"text\": \"*Sede*\", \"verbatim\": false}, {\"type\": \"mrkdwn\", \"text\": \"_Bologna_\", \"verbatim\": false}, {\"type\": \"mrkdwn\", \"text\": \"*Fonte*\", \"verbatim\": false}, {\"type\": \"mrkdwn\", \"text\": \"_Speed Interview_\", \"verbatim\": false}]}], \"state\": {\"values\": {}}}, \"actions\": [{\"type\": \"radio_buttons\", \"action_id\": \"selezione_stato_colloquio\", \"block_id\": \"stato\", \"selected_option\": {\"text\": {\"type\": \"plain_text\", \"text\": \"Sostenuto\"}, \"value\": \"colloquio_sostenuto\"}, \"action_ts\": \"1791973077.000400\"}]}"
    },
    "webhookUrl": "https://n8nrefresh.duckdns.org/webhook/MOCK",
    "executionMode": "test"
  }
]
```

### 09 – Secondo form: clic su "Assunzione"

L'utente preme il bottone Assunzione (è il caso dei dati reali usati finora).

**Percorso atteso:** Switch → details_click → build_view → slack_view

**Risultato atteso:** L'output di `build_view` contiene `slackMethod: "views.update"` e in `slackBody` un form "Aggiornamento", 12 blocchi, callback_id new_matching_details, pulsante "Registra".

**Dati da fissare su `Webhook1`:**

```json
[
  {
    "headers": {
      "host": "n8nrefresh.duckdns.org",
      "user-agent": "Slackbot 1.0 (+https://api.slack.com/robots)",
      "content-type": "application/x-www-form-urlencoded",
      "x-slack-request-timestamp": "1791973077",
      "x-slack-signature": "v0=mock"
    },
    "params": {},
    "query": {},
    "body": {
      "payload": "{\"type\": \"block_actions\", \"user\": {\"id\": \"U_TEST_001\", \"username\": \"utente.test\", \"name\": \"utente.test\", \"team_id\": \"T_TEST\"}, \"api_app_id\": \"A_TEST\", \"token\": \"MOCK_TOKEN\", \"trigger_id\": \"MOCK_TRIGGER_ID\", \"team\": {\"id\": \"T_TEST\", \"domain\": \"workspace-test\"}, \"container\": {\"type\": \"view\", \"view_id\": \"V_TEST_001\"}, \"view\": {\"id\": \"V_TEST_001\", \"type\": \"modal\", \"callback_id\": \"new_matching_details\", \"private_metadata\": \"new_matching_details_private\", \"blocks\": [{\"type\": \"section\", \"block_id\": \"info_matching\", \"fields\": [{\"type\": \"mrkdwn\", \"text\": \"*Azienda*\", \"verbatim\": false}, {\"type\": \"mrkdwn\", \"text\": \"_Acme_\", \"verbatim\": false}, {\"type\": \"mrkdwn\", \"text\": \"*Posizione*\", \"verbatim\": false}, {\"type\": \"mrkdwn\", \"text\": \"_Full stack developer_\", \"verbatim\": false}, {\"type\": \"mrkdwn\", \"text\": \"*Sede*\", \"verbatim\": false}, {\"type\": \"mrkdwn\", \"text\": \"_Bologna_\", \"verbatim\": false}, {\"type\": \"mrkdwn\", \"text\": \"*Fonte*\", \"verbatim\": false}, {\"type\": \"mrkdwn\", \"text\": \"_Speed Interview_\", \"verbatim\": false}]}], \"state\": {\"values\": {}}}, \"actions\": [{\"type\": \"button\", \"action_id\": \"new_assunzione\", \"block_id\": \"selezione_aggiornamento_candidatura\", \"value\": \"nuova_assunzione\", \"text\": {\"type\": \"plain_text\", \"text\": \"Assunzione (anche potenziale)\"}, \"action_ts\": \"1791973077.000100\"}]}"
    },
    "webhookUrl": "https://n8nrefresh.duckdns.org/webhook/MOCK",
    "executionMode": "test"
  }
]
```

### 10 – Invio del secondo form, con sede

L'utente registra un colloquio programmato e preme "Registra".

**Percorso atteso:** Switch → details_submit → get_submission_info_new → append_new_matching_form → add_matching1

**Risultato atteso:** L'output di `get_submission_info_new` deve essere:

```json
{
  "submission": {
    "context": {
      "user_id": "U_TEST_001",
      "azienda": "Acme",
      "posizione": "Full stack developer",
      "sede": "Bologna",
      "fonte": "Speed Interview"
    },
    "submittedValues": {
      "stato": "colloquio_programmato",
      "data_colloquio": "2026-11-05",
      "link_allegato": "www.acme.it/lavora-con-noi",
      "altre_info": "Colloquio con il responsabile tecnico"
    }
  }
}
```

**Dati da fissare su `Webhook1`:**

```json
[
  {
    "headers": {
      "host": "n8nrefresh.duckdns.org",
      "user-agent": "Slackbot 1.0 (+https://api.slack.com/robots)",
      "content-type": "application/x-www-form-urlencoded",
      "x-slack-request-timestamp": "1791973077",
      "x-slack-signature": "v0=mock"
    },
    "params": {},
    "query": {},
    "body": {
      "payload": "{\"type\": \"view_submission\", \"user\": {\"id\": \"U_TEST_001\", \"username\": \"utente.test\", \"name\": \"utente.test\", \"team_id\": \"T_TEST\"}, \"api_app_id\": \"A_TEST\", \"token\": \"MOCK_TOKEN\", \"trigger_id\": \"MOCK_TRIGGER_ID\", \"team\": {\"id\": \"T_TEST\", \"domain\": \"workspace-test\"}, \"view\": {\"id\": \"V_TEST_001\", \"type\": \"modal\", \"callback_id\": \"new_matching_details\", \"private_metadata\": \"new_matching_details_private\", \"blocks\": [{\"type\": \"section\", \"block_id\": \"info_matching\", \"fields\": [{\"type\": \"mrkdwn\", \"text\": \"*Azienda*\", \"verbatim\": false}, {\"type\": \"mrkdwn\", \"text\": \"_Acme_\", \"verbatim\": false}, {\"type\": \"mrkdwn\", \"text\": \"*Posizione*\", \"verbatim\": false}, {\"type\": \"mrkdwn\", \"text\": \"_Full stack developer_\", \"verbatim\": false}, {\"type\": \"mrkdwn\", \"text\": \"*Sede*\", \"verbatim\": false}, {\"type\": \"mrkdwn\", \"text\": \"_Bologna_\", \"verbatim\": false}, {\"type\": \"mrkdwn\", \"text\": \"*Fonte*\", \"verbatim\": false}, {\"type\": \"mrkdwn\", \"text\": \"_Speed Interview_\", \"verbatim\": false}]}], \"state\": {\"values\": {\"stato\": {\"radio_auto\": {\"type\": \"radio_buttons\", \"selected_option\": {\"text\": {\"type\": \"plain_text\", \"text\": \"Programmato\"}, \"value\": \"colloquio_programmato\"}}}, \"data_colloquio\": {\"pick_a_date\": {\"type\": \"datepicker\", \"selected_date\": \"2026-11-05\"}}, \"link_allegato\": {\"text_input\": {\"type\": \"plain_text_input\", \"value\": \"www.acme.it/lavora-con-noi\"}}, \"altre_info\": {\"text_input\": {\"type\": \"plain_text_input\", \"value\": \"Colloquio con il responsabile tecnico\"}}}}}}"
    },
    "webhookUrl": "https://n8nrefresh.duckdns.org/webhook/MOCK",
    "executionMode": "test"
  }
]
```

### 11 – Invio del secondo form, senza sede

Come il precedente, ma nel riepilogo manca la sede. È il caso del bug corretto in `get_submission_info_new`.

**Percorso atteso:** Switch → details_submit → get_submission_info_new → append_new_matching_form → add_matching1

**Risultato atteso:** L'output di `get_submission_info_new` deve essere:

```json
{
  "submission": {
    "context": {
      "user_id": "U_TEST_001",
      "azienda": "Acme",
      "posizione": "Full stack developer",
      "sede": "",
      "fonte": "Speed Interview"
    },
    "submittedValues": {
      "stato": "colloquio_programmato",
      "data_colloquio": "2026-11-05",
      "link_allegato": "www.acme.it/lavora-con-noi",
      "altre_info": "Colloquio con il responsabile tecnico"
    }
  }
}
```

**Nota:** Con la versione precedente di `get_submission_info_new` questo scenario andava in errore.

**Dati da fissare su `Webhook1`:**

```json
[
  {
    "headers": {
      "host": "n8nrefresh.duckdns.org",
      "user-agent": "Slackbot 1.0 (+https://api.slack.com/robots)",
      "content-type": "application/x-www-form-urlencoded",
      "x-slack-request-timestamp": "1791973077",
      "x-slack-signature": "v0=mock"
    },
    "params": {},
    "query": {},
    "body": {
      "payload": "{\"type\": \"view_submission\", \"user\": {\"id\": \"U_TEST_001\", \"username\": \"utente.test\", \"name\": \"utente.test\", \"team_id\": \"T_TEST\"}, \"api_app_id\": \"A_TEST\", \"token\": \"MOCK_TOKEN\", \"trigger_id\": \"MOCK_TRIGGER_ID\", \"team\": {\"id\": \"T_TEST\", \"domain\": \"workspace-test\"}, \"view\": {\"id\": \"V_TEST_001\", \"type\": \"modal\", \"callback_id\": \"new_matching_details\", \"private_metadata\": \"new_matching_details_private\", \"blocks\": [{\"type\": \"section\", \"block_id\": \"info_matching\", \"fields\": [{\"type\": \"mrkdwn\", \"text\": \"*Azienda*\", \"verbatim\": false}, {\"type\": \"mrkdwn\", \"text\": \"_Acme_\", \"verbatim\": false}, {\"type\": \"mrkdwn\", \"text\": \"*Posizione*\", \"verbatim\": false}, {\"type\": \"mrkdwn\", \"text\": \"_Full stack developer_\", \"verbatim\": false}, {\"type\": \"mrkdwn\", \"text\": \"*Fonte*\", \"verbatim\": false}, {\"type\": \"mrkdwn\", \"text\": \"_Speed Interview_\", \"verbatim\": false}]}], \"state\": {\"values\": {\"stato\": {\"radio_auto\": {\"type\": \"radio_buttons\", \"selected_option\": {\"text\": {\"type\": \"plain_text\", \"text\": \"Programmato\"}, \"value\": \"colloquio_programmato\"}}}, \"data_colloquio\": {\"pick_a_date\": {\"type\": \"datepicker\", \"selected_date\": \"2026-11-05\"}}, \"link_allegato\": {\"text_input\": {\"type\": \"plain_text_input\", \"value\": \"www.acme.it/lavora-con-noi\"}}, \"altre_info\": {\"text_input\": {\"type\": \"plain_text_input\", \"value\": \"Colloquio con il responsabile tecnico\"}}}}}}"
    },
    "webhookUrl": "https://n8nrefresh.duckdns.org/webhook/MOCK",
    "executionMode": "test"
  }
]
```

### 12 – Scelta di un matching da aggiornare

L'utente sceglie un matching dal menu `selezione_matching`.

**Percorso atteso:** Switch → selezione → get_selected_matching → build_view → slack_view

**Risultato atteso:** L'output di `build_view` contiene `slackMethod: "views.open"` e in `slackBody` un form "Update candidatura", 4 blocchi, callback_id update_form.

**Nota:** Il `callback_id` della vista che contiene il menu è inventato: il workflow riconosce questo evento solo dal `block_id` `selezione_matching`.

**Output da fissare su `get_selected_matching`:**

```json
[
  {
    "ID matching": "MATCH_TEST_001",
    "ID studente": "U_TEST_001",
    "Azienda": "Acme",
    "Posizione": "Full stack developer",
    "Ultima attività": "Candidatura"
  }
]
```

**Dati da fissare su `Webhook1`:**

```json
[
  {
    "headers": {
      "host": "n8nrefresh.duckdns.org",
      "user-agent": "Slackbot 1.0 (+https://api.slack.com/robots)",
      "content-type": "application/x-www-form-urlencoded",
      "x-slack-request-timestamp": "1791973077",
      "x-slack-signature": "v0=mock"
    },
    "params": {},
    "query": {},
    "body": {
      "payload": "{\"type\": \"block_actions\", \"user\": {\"id\": \"U_TEST_001\", \"username\": \"utente.test\", \"name\": \"utente.test\", \"team_id\": \"T_TEST\"}, \"api_app_id\": \"A_TEST\", \"token\": \"MOCK_TOKEN\", \"trigger_id\": \"MOCK_TRIGGER_ID\", \"team\": {\"id\": \"T_TEST\", \"domain\": \"workspace-test\"}, \"container\": {\"type\": \"view\", \"view_id\": \"V_TEST_HOME\"}, \"view\": {\"id\": \"V_TEST_HOME\", \"type\": \"modal\", \"callback_id\": \"seleziona_matching\", \"private_metadata\": \"\", \"blocks\": [], \"state\": {\"values\": {\"selezione_matching\": {\"choose_matching\": {\"type\": \"static_select\", \"selected_option\": {\"text\": {\"type\": \"plain_text\", \"text\": \"Acme - Full stack developer\"}, \"value\": \"MATCH_TEST_001\"}}}}}}, \"actions\": [{\"type\": \"static_select\", \"action_id\": \"choose_matching\", \"block_id\": \"selezione_matching\", \"selected_option\": {\"text\": {\"type\": \"plain_text\", \"text\": \"Acme - Full stack developer\"}, \"value\": \"MATCH_TEST_001\"}, \"action_ts\": \"1791973077.000500\"}]}"
    },
    "webhookUrl": "https://n8nrefresh.duckdns.org/webhook/MOCK",
    "executionMode": "test"
  }
]
```

### 13 – Form di aggiornamento: clic su "Colloquio"

Nel form di aggiornamento di una candidatura, l'utente preme Colloquio.

**Percorso atteso:** Switch → form_click → build_view → slack_view

**Risultato atteso:** L'output di `build_view` contiene `slackMethod: "views.update"` e in `slackBody` un form "Aggiornamento", 5 blocchi, callback_id update_form, pulsante "Aggiorna".

**Dati da fissare su `Webhook1`:**

```json
[
  {
    "headers": {
      "host": "n8nrefresh.duckdns.org",
      "user-agent": "Slackbot 1.0 (+https://api.slack.com/robots)",
      "content-type": "application/x-www-form-urlencoded",
      "x-slack-request-timestamp": "1791973077",
      "x-slack-signature": "v0=mock"
    },
    "params": {},
    "query": {},
    "body": {
      "payload": "{\"type\": \"block_actions\", \"user\": {\"id\": \"U_TEST_001\", \"username\": \"utente.test\", \"name\": \"utente.test\", \"team_id\": \"T_TEST\"}, \"api_app_id\": \"A_TEST\", \"token\": \"MOCK_TOKEN\", \"trigger_id\": \"MOCK_TRIGGER_ID\", \"team\": {\"id\": \"T_TEST\", \"domain\": \"workspace-test\"}, \"container\": {\"type\": \"view\", \"view_id\": \"V_TEST_002\"}, \"view\": {\"id\": \"V_TEST_002\", \"type\": \"modal\", \"callback_id\": \"update_form\", \"private_metadata\": \"update_candidatura\", \"blocks\": [{\"type\": \"rich_text\", \"block_id\": \"MATCH_TEST_001\", \"elements\": [{\"type\": \"rich_text_section\", \"elements\": [{\"type\": \"text\", \"text\": \"Acme - Full stack developer\", \"style\": {\"italic\": true}}]}]}, {\"type\": \"divider\", \"block_id\": \"div1\"}], \"state\": {\"values\": {}}}, \"actions\": [{\"type\": \"button\", \"action_id\": \"candidatura_colloquio\", \"block_id\": \"selezione_aggiornamento_candidatura\", \"value\": \"nuovo_colloquio\", \"text\": {\"type\": \"plain_text\", \"text\": \"Colloquio\"}, \"action_ts\": \"1791973077.000100\"}]}"
    },
    "webhookUrl": "https://n8nrefresh.duckdns.org/webhook/MOCK",
    "executionMode": "test"
  }
]
```

### 14 – Invio del form di aggiornamento

L'utente compila l'aggiornamento (colloquio programmato) e preme "Aggiorna".

**Percorso atteso:** Switch → update_submit → get_submission_info_update → append_matching_update → update_matching

**Risultato atteso:** L'output di `get_submission_info_update` deve essere:

```json
{
  "submission": {
    "context": {
      "matching_id": "MATCH_TEST_001",
      "user_id": "U_TEST_001"
    },
    "submittedValues": {
      "main_update": "colloquio_programmato",
      "data_colloquio": "2026-11-12",
      "altre_info": "Secondo colloquio"
    }
  }
}
```

**Dati da fissare su `Webhook1`:**

```json
[
  {
    "headers": {
      "host": "n8nrefresh.duckdns.org",
      "user-agent": "Slackbot 1.0 (+https://api.slack.com/robots)",
      "content-type": "application/x-www-form-urlencoded",
      "x-slack-request-timestamp": "1791973077",
      "x-slack-signature": "v0=mock"
    },
    "params": {},
    "query": {},
    "body": {
      "payload": "{\"type\": \"view_submission\", \"user\": {\"id\": \"U_TEST_001\", \"username\": \"utente.test\", \"name\": \"utente.test\", \"team_id\": \"T_TEST\"}, \"api_app_id\": \"A_TEST\", \"token\": \"MOCK_TOKEN\", \"trigger_id\": \"MOCK_TRIGGER_ID\", \"team\": {\"id\": \"T_TEST\", \"domain\": \"workspace-test\"}, \"view\": {\"id\": \"V_TEST_002\", \"type\": \"modal\", \"callback_id\": \"update_form\", \"private_metadata\": \"update_candidatura\", \"blocks\": [{\"type\": \"rich_text\", \"block_id\": \"MATCH_TEST_001\", \"elements\": [{\"type\": \"rich_text_section\", \"elements\": [{\"type\": \"text\", \"text\": \"Acme - Full stack developer\", \"style\": {\"italic\": true}}]}]}, {\"type\": \"divider\", \"block_id\": \"div1\"}], \"state\": {\"values\": {\"main_update\": {\"selezione_stato_colloquio\": {\"type\": \"radio_buttons\", \"selected_option\": {\"text\": {\"type\": \"plain_text\", \"text\": \"Programmato\"}, \"value\": \"colloquio_programmato\"}}}, \"data_colloquio\": {\"pick_a_date\": {\"type\": \"datepicker\", \"selected_date\": \"2026-11-12\"}}, \"altre_info\": {\"text_input\": {\"type\": \"plain_text_input\", \"value\": \"Secondo colloquio\"}}}}}}"
    },
    "webhookUrl": "https://n8nrefresh.duckdns.org/webhook/MOCK",
    "executionMode": "test"
  }
]
```

### 15 – Fallback: scelta della fonte nel primo form

Nel primo form il menu "fonte" ha `dispatch_action`, quindi Slack manda un evento appena l'utente sceglie un'opzione. Il workflow lo ignora volutamente.

**Percorso atteso:** Switch → Fallback (nessun nodo successivo)

**Risultato atteso:** L'item esce dall'uscita **Fallback** dello Switch e l'esecuzione si ferma lì, senza errori.

**Nota:** Prima della semplificazione questo evento veniva scartato dal nodo `Filter1`; ora finisce nell'uscita Fallback.

**Dati da fissare su `Webhook1`:**

```json
[
  {
    "headers": {
      "host": "n8nrefresh.duckdns.org",
      "user-agent": "Slackbot 1.0 (+https://api.slack.com/robots)",
      "content-type": "application/x-www-form-urlencoded",
      "x-slack-request-timestamp": "1791973077",
      "x-slack-signature": "v0=mock"
    },
    "params": {},
    "query": {},
    "body": {
      "payload": "{\"type\": \"block_actions\", \"user\": {\"id\": \"U_TEST_001\", \"username\": \"utente.test\", \"name\": \"utente.test\", \"team_id\": \"T_TEST\"}, \"api_app_id\": \"A_TEST\", \"token\": \"MOCK_TOKEN\", \"trigger_id\": \"MOCK_TRIGGER_ID\", \"team\": {\"id\": \"T_TEST\", \"domain\": \"workspace-test\"}, \"container\": {\"type\": \"view\", \"view_id\": \"V_TEST_003\"}, \"view\": {\"id\": \"V_TEST_003\", \"type\": \"modal\", \"callback_id\": \"new_matching_form\", \"private_metadata\": \"new_matching_form_private\", \"blocks\": [], \"state\": {\"values\": {}}}, \"actions\": [{\"type\": \"static_select\", \"action_id\": \"selezione_fonte\", \"block_id\": \"fonte_opportunita\", \"selected_option\": {\"text\": {\"type\": \"plain_text\", \"text\": \"Speed Interview\"}, \"value\": \"speed_interview\"}, \"action_ts\": \"1791973077.000600\"}]}"
    },
    "webhookUrl": "https://n8nrefresh.duckdns.org/webhook/MOCK",
    "executionMode": "test"
  }
]
```

### 16 – Fallback: evento sconosciuto

Un clic su un bottone che il workflow non conosce.

**Percorso atteso:** Switch → Fallback (nessun nodo successivo)

**Risultato atteso:** L'item esce dall'uscita **Fallback** dello Switch e l'esecuzione si ferma lì, senza errori.

**Dati da fissare su `Webhook1`:**

```json
[
  {
    "headers": {
      "host": "n8nrefresh.duckdns.org",
      "user-agent": "Slackbot 1.0 (+https://api.slack.com/robots)",
      "content-type": "application/x-www-form-urlencoded",
      "x-slack-request-timestamp": "1791973077",
      "x-slack-signature": "v0=mock"
    },
    "params": {},
    "query": {},
    "body": {
      "payload": "{\"type\": \"block_actions\", \"user\": {\"id\": \"U_TEST_001\", \"username\": \"utente.test\", \"name\": \"utente.test\", \"team_id\": \"T_TEST\"}, \"api_app_id\": \"A_TEST\", \"token\": \"MOCK_TOKEN\", \"trigger_id\": \"MOCK_TRIGGER_ID\", \"team\": {\"id\": \"T_TEST\", \"domain\": \"workspace-test\"}, \"container\": {\"type\": \"message\", \"message_ts\": \"1791973077.000700\", \"channel_id\": \"D_TEST\"}, \"actions\": [{\"type\": \"button\", \"action_id\": \"bottone_ignoto\", \"block_id\": \"blocco_ignoto\", \"value\": \"valore_sconosciuto\", \"text\": {\"type\": \"plain_text\", \"text\": \"Bottone sconosciuto\"}, \"action_ts\": \"1791973077.000100\"}]}"
    },
    "webhookUrl": "https://n8nrefresh.duckdns.org/webhook/MOCK",
    "executionMode": "test"
  }
]
```

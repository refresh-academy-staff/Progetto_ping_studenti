// ============================================================
// build_submission
// Prepara la riga da salvare su Google Sheets e i dati per lo
// script Google, sia per un nuovo matching sia per un aggiornamento.
// ============================================================

const parsed = $('payload_parser').first().json
const currentAction = parsed.action
const payload = parsed.payload
const timestamp = $('Webhook1').first().json.headers["x-slack-request-timestamp"]

// ------------------------------------------------------------
// Funzioni di supporto
// ------------------------------------------------------------

// Toglie i simboli di formattazione di Slack: "_Acme_" -> "Acme"
const removeMrkdwn = (text) => {
  if (!text) return ""
  const first = text[0]
  const last = text[text.length - 1]
  if (first === last && (first === "_" || first === "*")) {
    return text.slice(1, -1)
  }
  return text
}

// Legge i valori compilati nel form, qualunque sia il tipo di campo
const readSubmittedValues = (values) => {
  const result = {}
  Object.keys(values).forEach(key => {
    const subField = Object.keys(values[key])[0]
    const childBlock = values[key][subField]

    switch (childBlock.type) {
      case "checkboxes":
        result[key] = childBlock.selected_options.length === 0
          ? null
          : childBlock.selected_options[0].value
        break
      case "radio_buttons":
      case "static_select":
        result[key] = childBlock.selected_option?.value
        break
      case "datepicker":
        result[key] = childBlock.selected_date
        break
      case "plain_text_input":
        result[key] = childBlock.value
        break
    }
  })
  return result
}

// Legge il riepilogo azienda/posizione/sede/fonte per etichetta
const readRiepilogo = (view) => {
  const infoMatching = view.blocks.find(b => b.block_id === "info_matching")
  if (!infoMatching) {
    throw new Error("build_submission: riepilogo 'info_matching' non trovato nel form")
  }
  const fields = infoMatching.fields
  const riepilogo = {}
  for (let i = 0; i < fields.length; i += 2) {
    riepilogo[fields[i].text] = fields[i + 1]?.text
  }
  return {
    azienda: removeMrkdwn(riepilogo["*Azienda*"]),
    posizione: removeMrkdwn(riepilogo["*Posizione*"]),
    sede: removeMrkdwn(riepilogo["*Sede*"]),
    fonte: removeMrkdwn(riepilogo["*Fonte*"])
  }
}

// ------------------------------------------------------------
// Dati comuni a entrambi i casi
// ------------------------------------------------------------

const userID = payload?.user?.id
if (!userID) {
  throw new Error("build_submission: user ID non presente")
}

const values = payload?.view?.state?.values
if (!values) {
  throw new Error("build_submission: nessun valore trovato nel form")
}

const v = readSubmittedValues(values)

// ------------------------------------------------------------
// Riga e dati per lo script, in base all'azione
// ------------------------------------------------------------

let sheet
let sheetId
let row
let script

switch (currentAction) {

  // Nuovo matching: invio del secondo form ("Registra")
  case "new_matching_details_submit": {
    const info = readRiepilogo(payload.view)
    sheet = "Registrazioni"
    sheetId = 935935300
    row = {
      "ID studente": userID,
      "Stato opportunità": v.stato,
      "Azienda": info.azienda,
      "Sede": info.sede,
      "Posizione": info.posizione,
      "Fonte": info.fonte,
      "Data colloquio": v.data_colloquio,
      "Feedback colloquio": v.esito_colloquio,
      "Sorgente": "Form",
      "Matching creato": "no",
      "Tipo contratto": v.tipo_contratto,
      "Data inizio contratto": v.date_picker_inizio_contratto,
      "Data fine contratto": v.date_picker_fine_contratto,
      "Data registrazione": "",
      "Timestamp": timestamp,
      "Note": v.altre_info,
      "Link allegati": v.link_allegato
    }
    script = { action: "new_matching" }
    break
  }

  // Aggiornamento di un matching esistente ("Aggiorna")
  case "update_form_submit": {
    const matchingID = payload.view.blocks[0]?.block_id
    if (!matchingID) {
      throw new Error("build_submission: ID matching non fornito")
    }
    sheet = "Aggiornamenti_matching"
    sheetId = 594811163
    row = {
      "ID matching": matchingID,
      "Matching aggiornato": "no",
      "Nuovo stato": v.main_update,
      "Note": v.altre_info,
      "Data colloquio": v.data_colloquio,
      "Feedback colloquio": v.esito_colloquio,
      "Motivo chiusura": v.motivo_chiusura,
      "ID studente": userID,
      "Tipo contratto": v.tipo_contratto,
      "Data aggiornamento": `=EPOCHTODATE(${timestamp})`,
      "Data inizio contratto": v.date_picker_inizio_contratto,
      "Data fine contratto": v.date_picker_fine_contratto,
      "Motivazione colloquio non sostenuto": v.motivo_colloquio_non_sostenuto
    }
    script = { action: "update", matchingID: matchingID }
    break
  }

  default:
    throw new Error(`build_submission: azione non gestita: ${currentAction}`)
}

// Le colonne del foglio stanno al primo livello; i campi che
// iniziano con "_" sono informazioni di servizio, non colonne.
return {
  ...row,
  _sheet: sheet,
  _sheetId: sheetId,
  _script: script
}
const dateFormatter = (date) => {

  if (date === "") return "";

  const splitDate = date.split("/");
  const [d, m, y] = splitDate
  const dataCompleta = `${y}-${m}-${d}`
  return dataCompleta
}

const buildTextBlock = (text) => {
  return {
    "type": "rich_text",
    "elements": [
      {
        "type": "rich_text_section",
        "elements": [
          {
            "type": "text",
            "text": text,
            "style": {
              "bold": true
            }
          }
        ]
      }
    ]
  }
}

const buildButton = (text, value, actionID, style) => {

  if (style === "danger") {
    return {
      "type": "button",
      "text": {
        "type": "plain_text",
        "text": text
      },
      "value": value,
      "action_id": actionID,
      "style": "danger"
    }
  } else if (style === "primary") {
    return {
      "type": "button",
      "text": {
        "type": "plain_text",
        "text": text
      },
      "value": value,
      "action_id": actionID,
      "style": "danger"
    }
  } else {
    return {
      "type": "button",
      "text": {
        "type": "plain_text",
        "text": text
      },
      "value": value,
      "action_id": actionID
    }
  }
}

const buildOption = (text, value) => {
  return {
    "text": {
      "type": "plain_text",
      "text": text
    },
    "value": value
  }
}
const buildLabel = (text) => {
  return {
    "label": {
      "type": "plain_text",
      "text": text
    }
  }
}
const buildDatePicker = (text, id) => {
  return {
    "block_id": id,
    "type": "input",
    "element": {
      "type": "datepicker"
    },
    ...buildLabel(text)
  }
}

//=======================================
const aggiornamentoCandidaturaHead = buildTextBlock("Come vuoi aggiornare la tua candidatura?")
const mainActionAggiornamentoCandidatura = {
  "type": "actions",
  "block_id": "selezione_aggiornamento_candidatura",
  "elements": [
    buildButton("Colloquio", "nuovo_colloquio", "candidatura_colloquio"),
    buildButton("Assunzione", "nuova_assunzione", "candidatura_assunzione"),
    buildButton("Opportunità chiusa", "opportunità_chiusa", "candidatura_chiusa", "danger")
  ]
}

//=======================================
const aggiornamentoCollProgHead = buildTextBlock("Hai sostenuto il colloquio?")
const mainActionAggiornamentoCollProg = {
  "type": "actions",
  "block_id": "selezione_aggiornamento_colloquio_sostenuto",
  "elements": [
    buildButton("Sì", "colloquio_sostenuto", "collprog_avvenuto", "primary"),
    buildButton("No", "colloquio_non_sostenuto", "collprog_non_avvenuto", "danger"),
  ]
}
const collProgDomanda1 = buildTextBlock("Hanno già deciso di assumerti?")
const redirectAssunzione = {
  "type": "actions",
  "block_id": "coll_prog_redirect_assunzione",
  "elements": [
    buildButton("Assunzione", "assunzione", "redirect_assunzione"),
  ]
}
//=======================================

const aggiornamentoCollSostHead = buildTextBlock("Come vuoi aggiornare questa opportunità?");
const mainActionAggiornamentoCollSost = {
  "type": "actions",
  "block_id": "selezione_aggiornamento_candidatura",
  "elements": [
    buildButton("Ulteriore colloquio", "ulteriore_colloquio", "coll_sost_nuovo_colloquio"),
    buildButton("Assunzione", "nuova_assunzione", "coll_sost_assunzione"),
    buildButton("Opportunità chiusa", "opportunità_chiusa", "coll_sost_chiusa", "danger")
  ]
}

//=======================================
const aggiornamentoAssunzione = buildTextBlock("Come vuoi aggiornarci sulla tua assunzione?");
const selezioneStatoAssunzione = {
  "block_id": "stato_assunzione",
  "type": "input",
  "dispatch_action": true,
  "element": {
    "type": "static_select",
    "action_id": "selezione_stato_assunzione",
    "options": [
      buildOption("Prevista", "assunzione_prevista"),
      buildOption("Avvenuta", "assunzione_avvenuta"),
      buildOption("In sospeso", "assunzione_sospesa"),
      buildOption("Annullata (chiudi opportunità)", "assunzione_annullata"),
    ],
  },
  ...buildLabel("Stato assunzione")
}

const assunzText1 = buildTextBlock("Compila questi campi se hai le relative informazioni");
const selezioneTipoContratto = {
  "block_id": "tipo_contratto",
  "type": "input",
  "element": {
    "type": "static_select",
    "action_id": "selezione_tipo_contratto",
    "options": [
      buildOption("Tirocinio/stage", "contratto_tirocinio_stage"),
      buildOption("Apprendistato", "contratto_apprendistato"),
      buildOption("Partita IVA", "contratto_p_iva"),
      buildOption("Determinato", "contratto_determ"),
      buildOption("Indeterminato", "contratto_indet"),
      buildOption("Altro", "contratto_altro"),
    ],
  },
  ...buildLabel("Tipo di contratto")
}

const dataInizioContratto = buildDatePicker("Inizio contratto", "date_picker_inizio_contratto");
const dataFineContratto = buildDatePicker("Fine contratto", "date_picker_fine_contratto");
const altreInfoAssunzione = {
  "type": "input",
  "element": {
    "type": "plain_text_input",
    "placeholder": {
      "type": "plain_text",
      "text": "Puoi usare questo spazio per darci altri dettagli sullo stato della tua assunzione"
    }
  },
  ...buildLabel("Altro")
}

const blocks = []
const ultimaAttività = $input.first().json["Ultima attività"];

switch (ultimaAttività) {
  case "Candidatura":
    blocks.push(aggiornamentoCandidaturaHead, mainActionAggiornamentoCandidatura)
    break;
  case "Colloquio programmato":
    blocks.push(aggiornamentoCollProgHead, mainActionAggiornamentoCollProg, collProgDomanda1, redirectAssunzione)
    break
  case "Colloquio sostenuto":
    blocks.push(aggiornamentoCollSostHead, mainActionAggiornamentoCollSost)
    break;
  case "Assunzione":
    blocks.push(aggiornamentoAssunzione, selezioneStatoAssunzione)
}

//=======================================

const submitButton = {
  "submit": {
    "type": "plain_text",
    "text": "Aggiorna"
  }
}

const openViewBlocks = {
  "trigger_id": $('payload_parser').first().json.trigger_id,
  "view": {
    "type": "modal",
    "title": {
      "type": "plain_text",
      "text": "Aggiornamento"
    },
    "blocks": blocks,
    "close": {
      "type": "plain_text",
      "text": "Esci"
    },
    "private_metadata": "update_form_private",
    "callback_id": "update_form"
  }
}

switch (ultimaAttività) {
  case "Candidatura":
  case "Colloquio programmato":
  case "Colloquio sostenuto":
    return {openViewBlocks}
  case "Assunzione":
    return {
      openViewBlocks: {
        ...openViewBlocks,
        "view": {
          ...openViewBlocks.view,
          ...submitButton
        }
      }
    }
}

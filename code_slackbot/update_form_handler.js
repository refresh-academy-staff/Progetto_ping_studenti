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


const state = $input.first().json.view.state;
const actionID = $input.first().json.actions[0].action_id;

if (actionID === "selezione_stato_assunzione") {

  const selectedOption = $input.first().json.actions[0].selected_option.value

  if (selectedOption === "assunzione_prevista" || selectedOption === "assunzione_avvenuta") {
    blocks.push(aggiornamentoAssunzione, selezioneStatoAssunzione, assunzText1, selezioneTipoContratto, dataInizioContratto, dataFineContratto, altreInfoAssunzione)
  } else {
    blocks.push(aggiornamentoAssunzione, selezioneStatoAssunzione, altreInfoAssunzione)
  }
}

const uploadViewBlocks = {
  "view_id": $('payload_parser').first().json.view.id,
  "view": {
    "type": "modal",
    "title": {
      "type": "plain_text",
      "text": "Aggiornamento"
    },
    "blocks": blocks,
    "submit": {
      "type": "plain_text",
      "text": "Aggiorna"
    },
    "close": {
      "type": "plain_text",
      "text": "Exit"
    },
    "private_metadata": "update_form_private",
    "callback_id": "update_form"
  }
}

return {uploadViewBlocks}

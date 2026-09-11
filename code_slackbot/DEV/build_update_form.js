const dateFormatter = (date) => {

  if (date === "") return "";

  const splitDate = date.split("/");
  const [d, m, y] = splitDate
  const dataCompleta = `${y}-${m}-${d}`
  return dataCompleta
}

const buildTextBlock = (props) => {

  const styleObj = {}
  if (props.style) {
    styleObj["style"] = {
      [props.style] : true
    }
  }

  const blockIDObj = {}
  if (props.blockID) {
    blockIDObj["block_id"] = props.blockID
  }

  return {
    "type": "rich_text",
    ...blockIDObj,
    "elements": [
      {
        "type": "rich_text_section",
        "elements": [
          {
            "type": "text",
            "text": props.text,
            ...styleObj
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
      "style": "primary"
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
const buildDatePicker = (text, id, isOptional) => {
  return {
    "block_id": id,
    "type": "input",
    "element": {
      "type": "datepicker"
    },
    "optional": isOptional,
    ...buildLabel(text)
  }
}
const buildTextBox = (props) => {
  return {
    "type": "input",
    "block_id": props.blockId,
    "element": {
      "type": "plain_text_input",
      "action_id": "text_input",
      "placeholder": {
        "type": "plain_text",
        "text": props.placeholder
      },
      "multiline": props.multiline
    },
    "optional": true,
    ...buildLabel(props.label)
  }
}

const selectedMatching = $('payload_parser').first().json.payload.view.state.values.selezione_matching.choose_matching.selected_option;
const selectedMatchingText = selectedMatching.text.text
const selectedMatchingID = selectedMatching.value

const matchingReference = buildTextBlock({text: selectedMatchingText, style: "italic", blockID: selectedMatchingID})

//=======================================
const aggiornamentoCandidaturaHead = buildTextBlock({text: "Come vuoi aggiornare la tua candidatura?", style: "bold"})
const mainActionAggiornamentoCandidatura = {
  "type": "actions",
  "block_id": "selezione_aggiornamento_candidatura",
  "elements": [
    buildButton("Colloquio", "nuovo_colloquio", "candidatura_colloquio"),
    buildButton("Assunzione (anche potenziale)", "nuova_assunzione", "candidatura_assunzione"),
    buildButton("Opportunità chiusa", "opportunità_chiusa", "candidatura_chiusa", "danger")
  ]
}

//=======================================
const aggiornamentoCollProgHead = buildTextBlock({text: "Hai sostenuto il colloquio?", style: "bold"})
const colloquioProgSostenuto = {
  "type": "actions",
  "block_id": "main_update",
  "elements": [
    {
      "type": "radio_buttons",
      "action_id": "conferma_colloquio_sostenuto",
      "options": [
        buildOption("Sì", "collprog_avvenuto"),
        buildOption("No", "collprog_non_avvenuto"),
      ]
    }
  ]
}
const collProgDomanda1 = buildTextBlock({text: "Pensano già di assumerti?", style: "italic"})
const redirectAssunzione = {
  "type": "actions",
  "block_id": "coll_prog_redirect_assunzione",
  "elements": [
    buildButton("Assunzione", "assunzione", "redirect_assunzione", "primary"),
  ]
}
//=======================================

const aggiornamentoCollSostHead = buildTextBlock({text: "Come vuoi aggiornare questa opportunità?", style: "bold"});
const mainActionAggiornamentoCollSost = {
  "type": "actions",
  "block_id": "selezione_aggiornamento_candidatura",
  "elements": [
    buildButton("Ulteriore colloquio", "ulteriore_colloquio", "coll_sost_nuovo_colloquio"),
    buildButton("Assunzione (anche potenziale)", "nuova_assunzione", "coll_sost_assunzione"),
    buildButton("Opportunità chiusa", "opportunità_chiusa", "coll_sost_chiusa", "danger")
  ]
}

//=======================================
const selezioneStatoAssunzione = {
  "block_id": "main_update",
  "type": "actions",
  "elements": [
    {
      "type": "static_select",
      "placeholder": {
        "type": "plain_text",
        "text": "Stato assunzione"
      },
      "action_id": "selezione_stato_assunzione",
      "options": [
        buildOption("Prevista", "assunzione_prevista"),
        buildOption("Avvenuta", "assunzione_avvenuta"),
        buildOption("Annullata (chiudi opportunità)", "assunzione_annullata"),
      ],
    }
  ],
}

const assunzText1 = buildTextBlock({text: "Compila questi campi se hai le relative informazioni", style: "bold"});
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

const dataInizioContratto = buildDatePicker("Inizio contratto", "date_picker_inizio_contratto", true);
const dataFineContratto = buildDatePicker("Fine contratto", "date_picker_fine_contratto", true);
const altreInfoAssunzione = buildTextBox({ placeholder: "Puoi usare questo spazio per darci altri dettagli sullo stato della tua assunzione", label: "Altro", blockId: "altre_info" })

const divider = {
  "type": "divider"
}

const blocks = [matchingReference, divider]
const ultimaAttività = $input.first().json["Ultima attività"];
let privateID;
let titoloAggiornamento;

switch (ultimaAttività) {
  case "Candidatura":
    blocks.push(aggiornamentoCandidaturaHead, mainActionAggiornamentoCandidatura)
    titoloAggiornamento = "Update candidatura" ;
    privateID = "update_candidatura" ;
    break;
  case "Colloquio programmato":
    blocks.push(aggiornamentoCollProgHead, colloquioProgSostenuto, collProgDomanda1, redirectAssunzione)
    titoloAggiornamento = "Update colloquio";
    privateID = "update_colloquio_prog" ;
    break
  case "Colloquio sostenuto":
    blocks.push(aggiornamentoCollSostHead, mainActionAggiornamentoCollSost)
    titoloAggiornamento = "Update colloquio";
    privateID = "update_colloquio_sost" ;
    break;
  case "Assunzione prevista":
    blocks.push(selezioneStatoAssunzione, altreInfoAssunzione)
    titoloAggiornamento = "Update assunzione";
    privateID = "update_assunzione";
    break;
}

//=======================================

const submitButton = {
  "submit": {
    "type": "plain_text",
    "text": "Aggiorna"
  }
}

const openViewBlocks = {
  "trigger_id": $('payload_parser').first().json.payload.trigger_id,
  "view": {
    "type": "modal",
    "title": {
      "type": "plain_text",
      "text": titoloAggiornamento
    },
    "blocks": blocks,
    "close": {
      "type": "plain_text",
      "text": "Esci"
    },
    "private_metadata": privateID,
    "callback_id": "update_form"
  },
}

switch (ultimaAttività) {
  case "Candidatura":
  case "Colloquio sostenuto":
    return {openViewBlocks}
  case "Colloquio programmato":
  case "Assunzione prevista":
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

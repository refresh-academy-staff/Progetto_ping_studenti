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

const buildOption = (props) => {
  return {
    "text": {
      "type": "plain_text",
      "text": props.text
    },
    "value": props.value
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
    "block_id": props.blockID,
    "element": {
      "type": "plain_text_input",
      "action_id": "text_input",
      "placeholder": {
        "type": "plain_text",
        "text": props.placeholder
      },
      "multiline": props.multiline
    },
    "optional": props.optional,
    ...buildLabel(props.label)
  }
}

const infoAziendaHeader = {
  "block_id": "new_header",
  "type": "header",
  "text": {
    "type": "plain_text",
    "text": "Prima di tutto inserisci alcune informazioni relative all'azienda"
  },
  "level": 1
}

const azienda = buildTextBox({
  blockID: "nome_azienda",
  label: "Nome azienda",
  placeholder: "Ex. Acme",
  multiline: false,
  optional: false
})
const posizione = buildTextBox({
  blockID: "posizione",
  label: "Posizione lavorativa",
  placeholder: "Ex. Full stack developer",
  multiline: false,
  optional: false
})
const sede = buildTextBox({
  blockID: "sede",
  label: "Sede di lavoro",
  placeholder: "Ex. Bologna",
  multiline: false,
  optional: true
})

const fonte = {
  "type": "input",
  "block_id": "fonte_opportunita",
  "element": {
    "type": "static_select",
    "action_id": "selezione_fonte",
    "options": [
      buildOption({ text: "Ricerca online autonoma", value: "online_autonomo" }),
      buildOption({ text: "Foglio google condiviso", value: "gsheet" }),
      buildOption({ text: "Speed Interview", value: "speed_interview" }),
      buildOption({ text: "L'azienda ha cercato il mio contatto", value: "da_azienda" }),
      buildOption({ text: "Altro", value: "altro" }),
    ]
  },
  "dispatch_action": true,
  "label": {
    "type": "plain_text",
    "text": "Come hai trovato questa opportunità?"
  }
}

const selezionaStato = {
  "type": "actions",
  "block_id": "selezione_nuova_opport",
  "elements": [

  ]
}

const blocks = [];
blocks.push(infoAziendaHeader, azienda, posizione, sede, fonte)

const openViewBlocks = {
  "trigger_id": $('payload_parser').first().json.trigger_id,
  "view": {
    "type": "modal",
    "title": {
      "type": "plain_text",
      "text": "Nuova opportunità"
    },
    "blocks": blocks,
    "submit": {
      "type": "plain_text",
      "text": "Avanti",
    },
    "close": {
      "type": "plain_text",
      "text": "Esci"
    },
    "private_metadata": "new_matching_form_private",
    "callback_id": "new_matching_form"
  },
}

return {openViewBlocks}

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
const buildTextBlock = (props) => {

  const style = {}
  if (props.style) {
    style[props.style] = true
  }

  return {
    "type": "rich_text",
    "elements": [
      {
        "type": "rich_text_section",
        "elements": [
          {
            "type": "text",
            "text": props.text,
            style
          }
        ]
      }
    ]
  }
}
const buildTextSection = (text, st) => {

  const style = {}

  if (style) {
    style[st] = true
  }

  return {
    "type": "rich_text_section",
    "elements": [
      {
        "type": "text",
        "text": text,
        style
      }
    ]
  }
}

const values = $input.first().json.view.state.values
const azienda = values.nome_azienda.text_input.value
const posizione = values.posizione.text_input.value
const sede = values.sede.text_input.value
const fonte = values.fonte_opportunita.selezione_fonte.selected_option.text.text

const riepilogoAzienda = {
  "type": "rich_text",
  "block_id": "info_matching",
  "elements": [
    {
      "type": "rich_text_list",
      "elements": [
        ...[azienda, posizione, sede]
          .filter(x => x)
          .map(o => buildTextSection(o, "italic")),
        buildTextSection(fonte, "italic"),
      ],
      "style": "bullet",
      "indent": 0,
      "border": 0
    }
  ]
}

const divider = {
  "type": "divider"
}

const textSection = buildTextBlock({
  text: "Seleziona lo stato di questa nuova opportunità",
  style: "bold"
})

const selezioneStato = {
  "type": "actions",
  "block_id": "selezione_aggiornamento_candidatura",
  "elements": [
    buildButton("Candidatura", "nuova_candidatura", "new_candidatura"),
    buildButton("Colloquio", "nuovo_colloquio", "new_colloquio"),
    buildButton("Assunzione (anche potenziale)", "nuova_assunzione", "new_assunzione"),
  ]
}

const blocks = [riepilogoAzienda, divider, textSection, selezioneStato]

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
      "text": "Registra",
    },
    "close": {
      "type": "plain_text",
      "text": "Esci"
    },
    "private_metadata": "new_matching_details_private",
    "callback_id": "new_matching_details"
  },
}

return {openViewBlocks}

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
const buildTextObject = (text) => {
  return {
    "type": "mrkdwn",
    "text": text
  }
}

const values = $input.first().json.payload.view.state.values
const azienda = values.nome_azienda.text_input.value
const posizione = values.posizione.text_input.value
const sede = values.sede.text_input.value
const fonte = values.fonte_opportunita.selezione_fonte.selected_option.text.text

const fields = () => {
  const fields = [
    buildTextObject("*Azienda*"),
    buildTextObject(`_${azienda}_`),
    buildTextObject("*Posizione*"),
    buildTextObject(`_${posizione}_`),
  ];
  if (sede) {
    fields.push(
      buildTextObject("*Sede*"),
      buildTextObject(`_${sede}_`)
    )
  }
  fields.push(
    buildTextObject("*Fonte*"),
    buildTextObject(`_${fonte}_`)
  )

  return fields
}

const riepilogoAzienda2 = {
  "type": "section",
  "block_id": "info_matching",
  "fields": [
    ...fields()
  ]

}

const divider = {
  "type": "divider"
}

const textSection = {
  "type": "header",
  "text": {
    "type": "plain_text",
    "text": "Seleziona lo stato di questa nuova opportunità"
  },
  level: 1
}

const selezioneStato = {
  "type": "actions",
  "block_id": "selezione_aggiornamento_candidatura",
  "elements": [
    buildButton("Candidatura", "nuova_candidatura", "new_candidatura", "primary"),
    buildButton("Colloquio", "nuovo_colloquio", "new_colloquio", "primary"),
    buildButton("Assunzione (anche potenziale)", "nuova_assunzione", "new_assunzione", "primary"),
  ]
}

const blocks = [riepilogoAzienda2, divider, textSection, selezioneStato]

const openViewBlocks = {
  "trigger_id": $input.first().json.payload.trigger_id,
  "view": {
    "type": "modal",
    "title": {
      "type": "plain_text",
      "text": "Nuova opportunità"
    },
    "blocks": blocks,
    "close": {
      "type": "plain_text",
      "text": "Esci"
    },
    "private_metadata": "new_matching_details_private",
    "callback_id": "new_matching_details"
  },
}

return {openViewBlocks}

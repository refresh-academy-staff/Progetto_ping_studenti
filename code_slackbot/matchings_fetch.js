const enrichOption = (option, id) => {
  const optionObject = {
    text: {
      type: "plain_text",
      text: option
    },
    value: id
  }
  return optionObject
}

const getLastEvent = (m) => {
  switch (m.json.Assunzione) {
    case "sì":
      return `Assunzione presso ${m.json.Azienda}`;
    case "prevista":
      return `Assunzione prevista presso ${m.json.Azienda}`;
  }
  switch (m.json["Esito colloquio"]) {
    case "positivo":
      return `Colloquio positivo presso ${m.json.Azienda}`;
    case "sconosciuto":
      return `Colloquio presso ${m.json.Azienda}`;
  }

  switch (m.json.Colloquio) {
    case "sostenuto":
      return `Colloquio sostenuto presso ${m.json.Azienda} il ${m.json["Data colloquio effettiva"]}`;
    case "programmato":
      return `Colloquio in programma presso ${m.json.Azienda} il ${m.json["Data colloquio prevista"]}`;
  }

  switch (m.json.Candidatura) {
    case "inviata":
      return `Candidatura presso ${m.json.Azienda}`;
    case "non inviata":
      return `Candidatura non ancora mandata presso ${m.json.Azienda}`
    case "respinta":
      return `Candidatura respinta presso ${m.json.Azienda}`
  }
}

const options = $input.all()
  .map(m => {
    const lastEvent = getLastEvent(m);
    const enrichedOption = enrichOption(lastEvent, m.json["ID matching"])
    return enrichedOption
  })

return {
  matchingList: {
    "external_id": "matching_picker",
    "view": {
      "type": "modal",
      "title": {
        "type": "plain_text",
        "text": "Aggiornamento"
      },
      "blocks": [
        {
          "block_id": "matching_list",
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": "Ottimo, quale opportunità vuoi aggiornare?"
          },
          "accessory": {
            "action_id": "choose_matching",
            "type": "radio_buttons",
            "options": options
          }
        }
      ],
      "submit": {
        "type": "plain_text",
        "text": "Seleziona"
      },
      "close": {
        "type": "plain_text",
        "text": "Exit"
      },
      "private_metadata": "matching_picker_private",
      "callback_id": "view_identifier_12"
    }
  }
}

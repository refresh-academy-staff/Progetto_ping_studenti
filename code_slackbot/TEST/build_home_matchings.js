const matchings = $input.all();

const buildMatchingOption = (matching) => {
  const id = matching["ID matching"]
  const text = `${matching["Ultima attività"]} con ${matching["Azienda"]}`
  return {
    "text": {
      "type": "plain_text",
      "text": text
    },
    "value": id
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

 const buildRow = (matching) => {
  const azienda = matching["Azienda"]
  const ultimaAttività = matching["Ultima attività"]
  return [
    {
      "type": "raw_text",
      "text": azienda
    },
    {
      "type": "raw_text",
      "text": ultimaAttività
    }
  ]
 }

const rows = matchings.map(m => buildRow(m.json))

const candidature = matchings
  .filter(m => m.json["Ultima attività"] === "Candidatura")
  .map(m => buildMatchingOption(m.json))

const optionGroupCandidature =
  candidature.length > 0 ?
    {
      ...buildLabel("Candidature"),
      "options": candidature
    }
    : []

const colloqui = matchings
  .filter(m => m.json["Ultima attività"].startsWith("Colloquio") === "Colloquio")
  .map(m => buildMatchingOption(m.json))

const optionGroupColloqui =
  colloqui.length > 0 ?
    {
      ...buildLabel("Colloqui"),
      "options": colloqui
    }
  : []

const assunzioni = matchings
  .filter(m => m.json["Ultima attività"].startsWith("Assunzione") === "Assunzione")
  .map(m => buildMatchingOption(m.json))

const optionGroupAssunzioni =
  assunzioni.length > 0 ?
    {
      ...buildLabel("Assunzioni"),
      "options": assunzioni
    }
  : []


const optionGroups = [optionGroupCandidature, optionGroupColloqui, optionGroupAssunzioni ]
  .filter(x => x.length > 0)

 return {
  "home_view": {
    "user_id": $('slack_trigger').first().json.user,
    "view": {
      "type": "home",
      "title": {
        "type": "plain_text",
        "text": "Ciao!"
      },
      "blocks": [
        {
          "type": "header",
          "text": {
            "type": "plain_text",
            "text": "Vuoi inserire una nuova opportunità?"
          },
          "level": 1
        },
        {
          "type": "actions",
          "block_id": "actionblock789",
          "elements": [
            {
              "type": "button",
              "text": {
                "type": "plain_text",
                "text": "Inserisci nuova"
              },
              "value": "new_event",
              "style": "primary"
            }
          ]
        },
        {
          "type": "header",
          "text": {
            "type": "plain_text",
            "text": "Seleziona il matching che vuoi aggiornare"
          },
          "level": 1
        },
        {
          "type": "actions",
          "block_id": "selezione_matching",
          "elements": [
            {
              "type": "static_select",
              "option_groups": optionGroups
            }
          ]
        },
        {
          "type": "header",
          "text": {
            "type": "plain_text",
            "text": "Riepilogo matching attivi"
          },
          "level": 1
        },
        {
          "type": "table",
          "column_settings": [
            {
                "is_wrapped": true
            },
            {
                "align": "right"
            }
          ],
          "rows": [
            [
              {
                "type": "raw_text",
                "text": "Azienda"
              },
              {
                "type": "raw_text",
                "text": "Ultimo aggiornamento"
              }
            ],
            ...rows
          ]
        }
      ]
    }
  }
}

 return {
  "home_view": {
    "user_id": $input.first().json.user,
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
            "text": "I tuoi matching attivi"
          },
          "level": 1
        },
        {
          "type": "header",
          "text": {
            "type": "plain_text",
            "text": "Attendi, sto caricando lo storico..."
          },
          "level": 3
        }
      ]
    }
  }
}

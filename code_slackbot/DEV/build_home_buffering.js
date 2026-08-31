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
                "text": "Compila il form"
              },
              "value": "new_opp_form",
              "style": "primary"
            },
            {
              "type": "button",
              "text": {
                "type": "plain_text",
                "text": "Utilizza il chatbot"
              },
              "value": "new_opp_bot",
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

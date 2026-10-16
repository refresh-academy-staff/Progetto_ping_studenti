const currentAction = $('payload_parser').first().json.action

function formInfoAzienda() {
  // codice di open_info_azienda
  
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


const blocks = [];
blocks.push(infoAziendaHeader, azienda, posizione, sede, fonte)

const openViewBlocks = {
  "trigger_id": $('payload_parser').first().json.payload.trigger_id,
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

return {
  slackMethod: "views.open",
  slackBody: openViewBlocks
}

}

function formInfoMatching() {
  // open_info_matching
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

return {
  slackMethod: "views.open",
  slackBody: openViewBlocks
}

}

function formDettagliMatching() {
  // codice di update_new_matching_form
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
const buildLabel = (text) => {
  return {
    "label": {
      "type": "plain_text",
      "text": text
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
const buildDatePicker = (text, id, isOptional) => {
  return {
    "block_id": id,
    "type": "input",
    "element": {
      "action_id": "pick_a_date",
      "type": "datepicker"
    },
    "optional": isOptional,
    ...buildLabel(text)
  }
}
const assunzText1 = buildTextBlock({
  text: "Compila questi campi se hai le relative informazioni",
  style: "bold",
});
const link = buildTextBox({
  blockID: "link_allegato",
  placeholder: "www.linkedin.it, www.acme.it...",
  multiline: false,
  optional: true,
  label: "Incolla qui il link dell'annuncio o altri link che ritieni rilevanti"
})
const selezioneStatoColloquio = {
  "block_id": "stato",
  "type": "input",
  "dispatch_action": true,
  "element": {
    "type": "radio_buttons",
    "action_id": "selezione_stato_colloquio",
    "options": [
      buildOption("Programmato", "colloquio_programmato"),
      buildOption("Sostenuto", "colloquio_sostenuto")
    ]
  },
  ...buildLabel("Stato")
}
const datePickerColloquio = buildDatePicker("Data", "data_colloquio", false);
const selezioneEsitoColloquio = {
  "block_id": "esito_colloquio",
  "type": "input",
  ...buildLabel("L'azienda ti ha dato feedback diretti?"),
  "element": {
    "type": "radio_buttons",
    "action_id": "seleziona_feedback_colloquio",
    "options": [
      buildOption("Hanno solo detto che mi faranno sapere", "feedback_colloquio_si_neutro"),
      buildOption("Sì, sono intenzionati a proseguire", "feedback_colloquio_si_pos"),
      buildOption("Sì, hanno detto di non voler procedere oltre (chiudi opportunità)", "feedback_colloquio_si_neg"),
      buildOption("No, non hanno dato nessun feedback", "feedback_colloquio_no")
    ]
  }
}
const altreInfoColloquio = buildTextBox({
  placeholder: "Qui puoi scrivere altre informazioni che ritieni significative",
  label: "Altro",
  blockID: "altre_info",
  multiline: true,
  optional: true
});
const altreInfoColloquioSostenuto = buildTextBox({
  placeholder: "Qui puoi scrivere altro in merito al colloquio",
  label: "Impressioni/note aggiuntive",
  blockID: "altre_info",
  multiline: true,
  optional: true
});
const selezioneStatoAssunzione = {
  "block_id": "stato",
  "type": "input",
  "element": {
    "type": "static_select",
    "action_id": "selezione_stato_assunzione",
    "options": [
      buildOption("Prevista", "assunzione_prevista"),
      buildOption("Avvenuta", "assunzione_avvenuta"),
    ],
  },
  ...buildLabel("Stato assunzione"),
};
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
  optional: true,
  ...buildLabel("Tipo di contratto"),
};
const dataInizioContratto = buildDatePicker(
  "Inizio contratto",
  "date_picker_inizio_contratto",
  true,
);
const dataFineContratto = buildDatePicker(
  "Fine contratto",
  "date_picker_fine_contratto",
  true,
);
const altreInfoAssunzione = buildTextBox({
  placeholder:
    "Puoi usare questo spazio per darci altri dettagli sullo stato della tua assunzione",
  label: "Altro",
  blockID: "altre_info",
  multiline: true,
  optional: true
});
const action = $input.first().json.payload.actions[0].action_id
const infoAzienda = $input.first().json.payload.view.blocks.find(b => b.block_id === "info_matching")
const nomeAzienda = infoAzienda.fields[1].text.replaceAll("_", "").replaceAll("*", "");
const divider = {
  "type": "divider"
}

const riepilogoCandidatura = {
  "type": "section",
  "block_id": "stato",
  "text": {
    "type": "mrkdwn",
    "text": "*Candidatura in oggetto*"
  },
  "accessory": {
    "type": "radio_buttons",
    "options": [
      buildOption(`Candidatura con ${nomeAzienda}`, "candidatura_inviata")
    ],
    "initial_option": buildOption(`Candidatura con ${nomeAzienda}`, "candidatura_inviata")
  }
}

const noteNuovaCadidatura = buildTextBox({
  blockID: "altre_info",
  placeholder: "Scrivi qui se hai ulteriori info che vuoi fornire",
  multiline: true,
  optional: true,
  label: "Aggiungi altri dettagli"
})
const blocks = [infoAzienda, divider];
switch (action) {
  case "new_candidatura":
    blocks.push(riepilogoCandidatura, link, divider, noteNuovaCadidatura)
    break;
  case "new_colloquio":
    blocks.push(selezioneStatoColloquio)
    break;
  case "selezione_stato_colloquio":
    const selectedOption = $input.first().json.payload.actions[0].selected_option.value;
    switch (selectedOption) {
      case "colloquio_sostenuto":
        blocks.push(
          selezioneStatoColloquio,
          datePickerColloquio,
          divider,
          selezioneEsitoColloquio,
          divider,
          link,
          divider,
          altreInfoColloquioSostenuto,
        );
        break;
      case "colloquio_programmato":
        blocks.push(
          selezioneStatoColloquio,
          datePickerColloquio,
          link,
          divider,
          altreInfoColloquio,
        );
        break;
      }
      break;
  case "new_assunzione":
    blocks.push(
      selezioneStatoAssunzione,
      divider,
      assunzText1,
      selezioneTipoContratto,
      dataInizioContratto,
      dataFineContratto,
      divider,
      link,
      divider,
      altreInfoAssunzione,
    )
    break;
}

const uploadViewBlocks = {
  view_id: $("payload_parser").first().json.payload.view.id,
  view: {
    type: "modal",
    title: {
      type: "plain_text",
      text: "Aggiornamento",
    },
    blocks: blocks,
    submit: {
      type: "plain_text",
      text: "Registra",
    },
    close: {
      type: "plain_text",
      text: "Exit",
    },
    private_metadata: "new_matching_details_private",
    callback_id: "new_matching_details"
  },
}

return { 
   slackMethod: "views.update",
  slackBody: uploadViewBlocks
};


}

function formApriAggiornamento() {
  // codice di build_update_form
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
const selezioneStatoColloquio = {
  "block_id": "main_update",
  "type": "input",
  "dispatch_action": true,
  "element": {
    "type": "radio_buttons",
    "action_id": "selezione_stato_colloquio",
    "options": [
      buildOption("Programmato", "colloquio_programmato"),
      buildOption("Sostenuto", "colloquio_sostenuto")
    ]
  },
  ...buildLabel("Stato")
}

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
  case "Colloquio rimandato":
    blocks.push(selezioneStatoColloquio)
    titoloAggiornamento = "Update colloquio";
    privateID = "update_colloquio_rim" ;
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
    return {
      slackMethod: "views.open",
      slackBody: openViewBlocks
    }
  case "Colloquio programmato":
  case "Colloquio rimandato":
  case "Assunzione prevista":
        return {
      slackMethod: "views.open",
      slackBody: {
        ...openViewBlocks,
        "view": {
          ...openViewBlocks.view,
          ...submitButton
        }
      }
    }
  }
}

function formAggiornaAggiornamento() {
  // codice di update_update_form3
  const buildHeader = (text, level, id) => {
  return {
    "block_id": id,
    "type": "header",
    "text": {
      "type": "plain_text",
      "text": text
    },
    "level": level
  }
}
const buildTextBlock = (props) => {

  const style = {}
  if (props.style) {
    style[props.style] = true
  }

  const blockID = {}
  if (props.blockID) {
    blockIDObj["block_id"] = props.blockID
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
};
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
      "action_id": "pick_a_date",
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
    "optional": true,
    ...buildLabel(props.label)
  }
}

//blocks
const matchingReferenceBlock = $input.first().json.payload.view.blocks[0];
const divider = {
  "type": "divider",
};
const aggiornamentoCollProgHead = buildTextBlock({
  text: "Hai sostenuto il colloquio?",
  style: "bold",
});
const colloquioNonSostenutoHead = buildTextBlock({
  text: "Perché il colloquio non è stato sostenuto?",
  style: "bold",
});
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
      ],
    },
  ],
};

const selezioneStatoColloquio = {
  "block_id": "main_update",
  "type": "input",
  "dispatch_action": true,
  "element": {
    "type": "radio_buttons",
    "action_id": "selezione_stato_colloquio",
    "options": [
      buildOption("Programmato", "colloquio_programmato"),
      buildOption("Sostenuto", "colloquio_sostenuto")
    ]
  },
  ...buildLabel("Stato")
}
const datePickerColloquio = buildDatePicker("Data", "data_colloquio", false)
const selezioneEsitoColloquio = {
  "block_id": "esito_colloquio",
  "type": "section",
  "text": {
    "type": "mrkdwn",
    "text": "*L'azienda ti ha dato feedback diretti?*",
  },
  "accessory": {
    "type": "radio_buttons",
    "action_id": "seleziona_feedback_colloquio",
    "options": [
      buildOption("Hanno solo detto che mi faranno sapere", "feedback_colloquio_si_neutro"),
      buildOption("Sì, sono intenzionati a proseguire", "feedback_colloquio_si_pos"),
      buildOption("Sì, hanno detto di non voler procedere oltre (chiudi opportunità)", "feedback_colloquio_si_neg"),
      buildOption("No, non hanno dato nessun feedback", "feedback_colloquio_no")
    ]
  }
}

const altreInfoColloquio = buildTextBox({ placeholder: "Qui puoi scrivere altre informazioni che ritieni significative", label: "Altro", blockID: "altre_info" });
const altreInfoColloquioSostenuto = buildTextBox({ placeholder: "Qui puoi scrivere altro in merito al colloquio", label: "Impressioni/note aggiuntive", blockID: "altre_info" });

const motivoColloquioNonSostenuto = {
  "block_id": "motivo_colloquio_non_sostenuto",
  "type": "section",
  "text": {
    "type": "mrkdwn",
    "text": "*Seleziona una motivazione tra le seguenti*"
  },
  "accessory":{
    "type": "radio_buttons",
    "action_id": "selezione_motivazione",
    "options": [
      buildOption("Rimandato", "colloquio_rimandato"),
      buildOption("Annullato (chiudi opportunità)", "colloquio_annullato"),
      buildOption("Mia assenza (chiudi opportunità)", "colloquio_non_presentato"),
    ]
  }
}
const dataColloquioRimandato = buildDatePicker("Nuova data", "data_colloquio", true);
const altreInfoColloquioNonSostenuto = buildTextBox({
  placeholder: "Aggiungi qui eventuali dettagli",
  label: "Altre info",
  blockID: "altre_info"
});

const selezioneStatoAssunzione = {
  "block_id": "main_update",
  "type": "input",
  "dispatch_action": true,
  "element": {
    "type": "static_select",
    "action_id": "selezione_stato_assunzione",
    "options": [
      buildOption("Prevista", "assunzione_prevista"),
      buildOption("Avvenuta", "assunzione_avvenuta"),
      buildOption("Annullata (chiudi opportunità)", "assunzione_annullata"),
    ],
  },
  ...buildLabel("Stato assunzione"),
};
const assunzText1 = buildTextBlock({
  text: "Compila questi campi se hai le relative informazioni",
  style: "bold",
});
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
  optional: true,
  ...buildLabel("Tipo di contratto"),
};
const dataInizioContratto = buildDatePicker(
  "Inizio contratto",
  "date_picker_inizio_contratto",
  true,
);
const dataFineContratto = buildDatePicker(
  "Fine contratto",
  "date_picker_fine_contratto",
  true,
);
const altreInfoAssunzione = buildTextBox({
  placeholder:
    "Puoi usare questo spazio per darci altri dettagli sullo stato della tua assunzione",
  label: "Altro",
  blockID: "altre_info"
});

confermaChiusuraOpportunità = {
  "block_id": "main_update",
  "type": "actions",
  "elements": [
    {
      "type": "checkboxes",
      "action_id": "conferma_chiusura",
      "options": [
        {
          "value": "chiusura",
          "text": {
            "type": "plain_text",
            "text": "Conferma chiusura opportunità",
          }
        }
      ]
    }
  ]
};
const motivoChiusuraOpportunità = {
  "block_id": "motivo_chiusura",
  "type": "input",
  "element": {
    "type": "static_select",
    "action_id": "selezione_motivo_chiusura",
    "options": [
      buildOption("Candidatura respinta", "cand_respinta"),
      buildOption("Colloquio negativo", "coll_negativo"),
      buildOption("Idoneità senza selezione", "non_idoneo"),
      buildOption("Decisione personale", "decisione_personale"),
      buildOption("Altro", "altro"),
    ],
  },
  ...buildLabel("Motivo"),
};

const altreInfoChiusura = buildTextBox({
  placeholder:
    "Se vuoi, aggiungi qui informazioni sulla chiusura dell'opportunità",
  label: "Altro",
  blockID: "altre_info"
});

//blocks build

const viewID = $input.first().json.payload.view.private_metadata;
const blocks = [];

const action = $input.first().json.payload.actions[0];
const actionID = action.action_id;

//assunzione
if (actionID === "candidatura_chiusa" || actionID === "coll_sost_chiusa") {
  blocks.push(confermaChiusuraOpportunità);
}

if (actionID === "conferma_chiusura") {
  const selectedOption = action.selected_options ? action.selected_options[0].value : null
  if (selectedOption === "chiusura") {
    blocks.push(confermaChiusuraOpportunità, motivoChiusuraOpportunità, altreInfoChiusura)
  } else {
    blocks.push(confermaChiusuraOpportunità)
  }
}

if (
  actionID === "candidatura_assunzione" ||
  actionID === "coll_sost_assunzione" ||
  actionID === "redirect_assunzione"
) {
  blocks.push(selezioneStatoAssunzione, altreInfoAssunzione);
}

if (actionID === "conferma_colloquio_sostenuto") {
  blocks.push(
    aggiornamentoCollProgHead,
    colloquioProgSostenuto
  )
  const selectedOption = action.selected_option.value;
  switch (selectedOption) {
    case "collprog_avvenuto":
      blocks.push(
        selezioneEsitoColloquio,
        altreInfoColloquioSostenuto,
      );
      break;
    case "collprog_non_avvenuto":
      blocks.push(
        motivoColloquioNonSostenuto,
        altreInfoColloquioNonSostenuto,
      );
      break;
  }
}

if (actionID === "selezione_stato_assunzione") {
  const selectedOption = action.value;
  switch (selectedOption) {
    case "assunzione_prevista":
    case "assunzione_avvenuta":
      blocks.push(
        selezioneStatoAssunzione,
        assunzText1,
        selezioneTipoContratto,
        dataInizioContratto,
        dataFineContratto,
        altreInfoAssunzione,
      );
      break;
    case "assunzione_sospesa":
    case "assunzione_annullata":
      blocks.push(selezioneStatoAssunzione, altreInfoAssunzione);
  }
}

if (
  actionID === "candidatura_colloquio" ||
  actionID === "coll_sost_nuovo_colloquio"
) {
  blocks.push(selezioneStatoColloquio, datePickerColloquio, altreInfoColloquio);
}
if (actionID === "selezione_motivazione") {
  const selectedOption = $input.first().json.payload.actions[0].selected_option.value;
  blocks.push(
    aggiornamentoCollProgHead,
    colloquioProgSostenuto,
    motivoColloquioNonSostenuto
  )
  if (selectedOption === "colloquio_rimandato") {
    blocks.push(
      dataColloquioRimandato,
    );
  }
  blocks.push(altreInfoColloquioNonSostenuto);
}

if (actionID === "selezione_stato_colloquio") {
  const selectedOption = $input.first().json.payload.actions[0].selected_option.value;
  switch (selectedOption) {
    case "colloquio_sostenuto":
      blocks.push(
        selezioneStatoColloquio,
        datePickerColloquio,
        divider,
        selezioneEsitoColloquio,
        divider,
        altreInfoColloquioSostenuto,
      );
      break;
    case "colloquio_programmato":
      blocks.push(
        selezioneStatoColloquio,
        datePickerColloquio,
        altreInfoColloquio,
      );
      break;
  }
}

if (actionID === "selezione_stato_assunzione") {
  const selectedOption = $input.first().json.payload.actions[0].selected_option.value;

  if (
    selectedOption === "assunzione_prevista" ||
    selectedOption === "assunzione_avvenuta"
  ) {
    blocks.push(
      selezioneStatoAssunzione,
      divider,
      assunzText1,
      selezioneTipoContratto,
      dataInizioContratto,
      dataFineContratto,
      divider,
      altreInfoAssunzione,
    );
  } else {
    blocks.push(selezioneStatoAssunzione, altreInfoAssunzione);
  }
}

if (blocks.length === 0) {
  const previousBlocks = $input.first().json.payload.view.blocks;
  blocks.push(...previousBlocks);
} else {
  if (blocks[0].block_id !== matchingReferenceBlock.block_id) {
    blocks.unshift(matchingReferenceBlock, divider);
  }
}

const uploadViewBlocks = {
  view_id: $("payload_parser").first().json.payload.view.id,
  view: {
    type: "modal",
    title: {
      type: "plain_text",
      text: "Aggiornamento",
    },
    blocks: blocks,
    submit: {
      type: "plain_text",
      text: "Aggiorna",
    },
    close: {
      type: "plain_text",
      text: "Exit",
    },
    private_metadata: viewID,
    callback_id: "update_form",
  },
};

return { 
  slackMethod: "views.update",
  slackBody: uploadViewBlocks
};

}

switch (currentAction) {
  case "open_new_form":
    return formInfoAzienda()
  case "new_matching_form_submit":
    return formInfoMatching()
  case "new_matching_details_click":
    return formDettagliMatching()
  case "selezione_matching":
    return formApriAggiornamento()
  case "update_form_click":
    return formAggiornaAggiornamento()
}

throw new Error(`build_view: azione non gestita: ${currentAction}`)
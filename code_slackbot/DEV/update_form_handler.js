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

//blocks
const matchingReferenceBlock = $input.first().json.view.blocks[0];
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
const ulterioreColloquio = {
  "type": "actions",
  "block_id": "selezione_ulteriore_colloquio",
  "elements": [
    {
      "type": "checkboxes",
      "action_id": "check_ulteriore_colloquio",
      "options": [
        buildOption("Ho la data del prossimo colloquio", "ulteriore_colloquio_selezionato")
      ]
    }
  ]
}
const datePickerUlterioreColloquio = buildDatePicker("Data ulteriore colloquio", "data_ulteriore_colloquio", false);
const istruzioneUlterioreColloquio = buildTextBlock({ text: "Se non hai ancora la data, comunica un colloquio programmato in seguito", style: "italic" })
const altreInfoColloquio = buildTextBox({ placeholder: "Qui puoi scrivere altre informazioni che ritieni significative", label: "Altro", blockID: "altre_info" });
const altreInfoColloquioSostenuto = buildTextBox({ placeholder: "Qui puoi scrivere altro in merito al colloquio", label: "Impressioni/note aggiuntive", blockID: "altre_info" });

const motivoColloquioNonSostenuto = {
  "block_id": "main_update",
  "type": "actions",
  "elements": [
    {
      "type": "static_select",
      "action_id": "selezione_motivazione_colloquio_non_sostenuto",
      "options": [
        buildOption("Rimandato", "colloquio_rimandato"),
        buildOption("Annullato", "colloquio_annullato"),
        buildOption("Mia assenza", "colloquio_non_presentato"),
      ],
      "placeholder": {
        "type": "plain_text",
        "text": "Seleziona una motivazione"
      }
    }
  ]
}
const dataColloquioRimandato = buildDatePicker("Nuova data", "data_colloquio_rimandato", true);
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

const viewID = $input.first().json.view.private_metadata;
const blocks = [];

const action = $input.first().json.actions[0];
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
  const selectedOption = action.selected_option.value;
  switch (selectedOption) {
    case "collprog_avvenuto":
      blocks.push(
        aggiornamentoCollProgHead,
        colloquioProgSostenuto,
        selezioneEsitoColloquio,
        altreInfoColloquioSostenuto,
      );
      break;
    case "collprog_non_avvenuto":
      blocks.push(
        colloquioNonSostenutoHead,
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
if (actionID === "selezione_motivazione_colloquio_non_sostenuto") {
  const selectedOption = $input.first().json.actions[0].selected_option.value;
  switch (selectedOption) {
    case "colloquio_rimandato":
      blocks.push(
        motivoColloquioNonSostenuto,
        dataColloquioRimandato,
        altreInfoColloquioNonSostenuto,
      );
      break;
    default:
      blocks.push(motivoColloquioNonSostenuto, altreInfoColloquioNonSostenuto);
  }
}

if (actionID === "colloquio_rimandato") {
  blocks.push(
    motivoColloquioNonSostenuto,
    dataColloquioRimandato,
    altreInfoColloquioNonSostenuto,
  );
}
if (actionID === "selezione_stato_colloquio") {
  const selectedOption = $input.first().json.actions[0].selected_option.value;
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
  const selectedOption = $input.first().json.actions[0].selected_option.value;

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
  const previousBlocks = $input.first().json.view.blocks;
  blocks.push(...previousBlocks);
} else {
  if (blocks[0].block_id !== matchingReferenceBlock.block_id) {
    blocks.unshift(matchingReferenceBlock, divider);
  }
}

const uploadViewBlocks = {
  view_id: $("payload_parser").first().json.view.id,
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

return { uploadViewBlocks };

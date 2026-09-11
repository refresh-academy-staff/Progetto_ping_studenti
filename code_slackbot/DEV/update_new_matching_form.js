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

return { uploadViewBlocks };


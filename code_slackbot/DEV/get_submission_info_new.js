const infoMatching = $input.first().json.view.blocks.find(b => b.block_id === "info_matching");

const azienda = infoMatching.fields[1].text
const posizione = infoMatching.fields[3].text
const sede = infoMatching.fields[5].text
const fonte = infoMatching.fields[7].text

const removeMrkdwn = (text) => {
  const first = text[0];
  const last = text[text.length -1];

  if (first !== last) {
    if (first !== "_" || first !== "*") {
       return {error: "the string doesn't appear to be in markdown"}
    }
  }
  return text.slice(1, -1);
}

const userID = $input.first().json.user.id
if (!userID) {
  return {error: "User ID non presente"}
}

const values = $input.first().json.view.state.values
if (!values) {
  return {error: "Nessun valore trovato"}
}

const valuesKeys = Object.keys(values)

const submission = {
  context: {
    user_id: userID,
    azienda: removeMrkdwn(azienda),
    posizione: removeMrkdwn(posizione),
    sede: removeMrkdwn(sede),
    fonte: removeMrkdwn(fonte)
  },
  submittedValues: {}
};

valuesKeys.forEach(key => {

  const subField = Object.keys(values[key])[0]
  const childBlock = values[key][subField]

  const childBlockType = childBlock.type

  switch (childBlockType) {
    case ("checkboxes"):
      if (childBlock.selected_options.length === 0) {
        submission.submittedValues[key] = null
      } else {
        submission.submittedValues[key] = childBlock.selected_options[0].value;
      }
      break;
    case ("radio_buttons"):
    case ("static_select"):
      submission.submittedValues[key] = childBlock.selected_option?.value;
      break;
    case ("datepicker"):
      submission.submittedValues[key] = childBlock.selected_date;
      break;
    case ("plain_text_input"):
      submission.submittedValues[key] = childBlock.value;
      break;
  }
})

return {submission}

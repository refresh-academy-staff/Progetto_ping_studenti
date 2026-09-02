const infoMatching = $input.first().json.view.blocks.find(b => b.block_id === "info_matching");

const azienda = infoMatching.elements[0].elements[0].elements[0].text
const posizione = infoMatching.elements[0].elements[1].elements[0].text
const sede = infoMatching.elements[0].elements[2].elements[0].text
const fonte = infoMatching.elements[0].elements[3]?.elements[0].text

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
    azienda: azienda,
    posizione: posizione,
    sede: sede,
    fonte: fonte
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

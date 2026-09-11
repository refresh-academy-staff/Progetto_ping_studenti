const matchingID = $input.first().json.payload.view.blocks[0].block_id
if (!matchingID) {
  return {error: "ID Matching non fornito"}
}

const userID = $input.first().json.payload.user.id
if (!userID) {
  return {error: "User ID non presente"}
}

const values = $input.first().json.payload.view.state.values
if (!values) {
  return {error: "Nessun valore trovato"}
}

const valuesKeys = Object.keys(values)

const submission = {
  context: {
    matching_id: matchingID,
    user_id: userID
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

const matchingID = $input.first().json.view.blocks[0].block_id

if (!matchingID) {
  return {error: "ID Matching non fornito"}
}

const userID = $input.first().json.user.id

const stateValues = $input.first().json.view.state.values

const valuesFields = Object.keys(stateValues)
const values = valuesFields.map(x => {
  const subField = Object.keys(stateValues[x])[0]
  const valueObject = stateValues[x][subField]

  const obj = {}

  switch (valueObject.type) {
    case ("radio_buttons"):
    case ("static_select"):
      if (subField === "selezione_motivo_chiusura") {
        obj["main_update"] = "chiusura";
        obj["motivo_chiusura"] = valueObject.selected_option?.value ?? null
      } else {
        obj[x] = valueObject.selected_option?.value ?? null
      }
      break;
    case ("checkboxes"):        //
      const selectedOptionsValues = valueObject.selected_options.map(x => x.value)
      obj[x] = selectedOptionsValues
      break;
    case ("datepicker"):
      obj[x] = valueObject.selected_date
      break;
    case ("plain_text_input"):
      obj[x] = valueObject.value
      break;
  }
  return obj
})

return {
  matching_id: matchingID,
  user_id: userID,
  values: values,
}

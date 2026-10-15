const b = $input.first().json.body
const payload = b.payload && JSON.parse(b.payload)

// Valori da controllare (undefined se non esistono)
const type = payload?.type
const value = payload?.actions?.[0]?.value
const blockId = payload?.actions?.[0]?.block_id
const callbackId = payload?.view?.callback_id

let action = "other"

if (b.type === "notification") {
  action = "notification"
} else if (value === "new_opp_bot") {
  action = "new_opp_bot"
} else if (value === "new_opp_form") {
  action = "open_new_form"
} else if (callbackId === "new_matching_form") {
  if (type === "view_submission") {
    action = "new_matching_form_submit"
  }
} else if (callbackId === "new_matching_details") {
  if (type === "block_actions") {
    action = "new_matching_details_click"
  } else if (type === "view_submission") {
    action = "new_matching_details_submit"
  }
} else if (blockId === "selezione_matching") {
  action = "selezione_matching"
} else if (callbackId === "update_form") {
  if (type === "view_submission") {
    action = "update_form_submit"
  } else if (type === "block_actions") {
    action = "update_form_click"
  }
}

return {
  ...b,
  payload,
  action
}
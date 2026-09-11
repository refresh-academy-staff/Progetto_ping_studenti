const getIndexes = (header) => {
  const indexes = {}
  header.forEach((head, index) => {
    const key = formatter(head);
    indexes[key] = index
  })
  return indexes
}

const assignID = (sheet, prefix) => {
  let lastRow = sheet.getLastRow();

  if (lastRow === 1) {
    Logger.log("There aren't any matching updates records")
  }
  const currentIDS = sheet.getRange(2, 1, lastRow).getValues();
  let newID = `${prefix}-${Utilities.getUuid().slice(0, 5)}` 
  while (currentIDS.includes(newID)) {
    newID = `${prefix}-${Utilities.getUuid().slice(0, 5)}`
  }
  return newID
}

const formatter = (text) => {
  const formatted = text
    .split(" ")
    .map((x, index ) => {
      const firstChar = x[0]
      if (index === 0) {
        return x.toLowerCase()
      }
      return x.replace(firstChar, firstChar.toUpperCase())
    })
    .join("")
    .replaceAll("à", "a")

  return formatted
}
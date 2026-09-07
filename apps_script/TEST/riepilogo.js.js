function onOpen(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (ss.getId() !== "1kfZTjFALTAEUg-qtBTo-SwcWhQGyvdqXaf50EcLLL4Y") {
    return
  }
  const sh = ss.getSheetById(1515286325);
  const shMatching = ss.getSheetById(1910429051);
  const matchings = shMatching.getDataRange().getValues();

  sh.getDataRange().getValues()
    .forEach((p, index) => {
      if (index === 0) return

      const id = p[1];
      const dropDownCellIndex = 8
      const aziende = matchings
      .filter(m => m[2] === id)
      .flatMap(m => `${m[0]}-${m[3]}`)
      const rule = SpreadsheetApp.newDataValidation().requireValueInList(aziende).build();
      sh.getRange(index + 1, dropDownCellIndex).setDataValidation(rule)
    })
  const testSh = ss.getSheetById(646915623)
}

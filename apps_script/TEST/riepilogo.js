function onOpen(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (ss.getId() !== DATA_SPREADSHEET_DEV) {
    return
  }
  const sh = ss.getSheetById(SH_RIEPILOGO);
  const shMatching = ss.getSheetById(SH_MATCHING);
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
}

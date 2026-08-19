const  aggiornaListaAziende = () => {

  const DEST_SPREADSHEET_ID = '11jVyrC2B5OFriucEZ792sCZOAEDVVbMxyAWRIVygK8U'
  
  const ssSource = SpreadsheetApp.getActiveSpreadsheet();
  const shSource = ssSource.getSheetByName("Data_PingStingBot");
  const shDest = ssSource.getSheetByName("Tabelle_appoggio");
  
  if (!shSource) {
    SpreadsheetApp.getUi().alert("Error: Source sheet 'Data_PingStingBot' not found.");
    return;
  }
  
  if (!shDest) {
    SpreadsheetApp.getUi().alert("Error: Source sheet 'Tabelle_appoggio' not found.");
    return;
  }

  //Get all values for "Nome_aziende" in the "Aziende" table in "Tabelle_appoggio"
  const destData = shDest.getDataRange().getValues();
  if (destData.length < 1) {
    SpreadsheetApp.getUi().alert("The dest sheet doesn't contain a header row on Row 1.");
    return;
  }

  const destHeaders = destData[0]; 
  
  const idxNomeAzienda = destHeaders.indexOf("Nome_azienda");
  
  if (idxNomeAzienda === -1) {
    SpreadsheetApp.getUi().alert("Error: Could not find 'Nome_azienda' in headers.");
    return;
  }

  const names = destData
    .slice(1)
    .map(row => row[idxNomeAzienda]) 

  const sourceData = shSource.getDataRange().getValues();

  if (sourceData.length < 1) {
    SpreadsheetApp.getUi().alert("The source sheet doesn't contain a header row on Row 1.");
    return;
  }
  
  // Headers are in Row 1 (Index 0)
  const sourceHeaders = sourceData[0]; 

  const idxAzienda = sourceHeaders.indexOf("Azienda");
  
  if (idxAzienda === -1) {
    SpreadsheetApp.getUi().alert("Error: Could not find 'Azienda' in headers.");
    return;
  }

  const newNames = sourceData
  .slice(1)
  .map(row => [row[idxAzienda]])
  .filter(row => row[0] !== "non nota all'interessato" && row[0] !== "" && !names.includes(row[0]))
  
  const uniqueNames = doublesRemover(newNames);
  
  if (uniqueNames.length > 0) {
    let lastRowValuedIndex = names.length;

    while (names[lastRowValuedIndex - 1] === "" && lastRowValuedIndex !== 0) {
      lastRowValuedIndex--
    }


    shDest.getRange(lastRowValuedIndex + 2,idxNomeAzienda + 1,uniqueNames.length).setValues(uniqueNames);
  }
}

const getMatchings = () => {
  const ssSource = SpreadsheetApp.getActiveSpreadsheet();
  const shSource = ssSource.getSheetByName("Matching");

  const sourceValues = shSource
    .getDataRange()
    .getValues()

  const targetCol = sourceValues[0]
    .indexOf("Azienda")
    + 1
  Logger.log(targetCol)
  const data = shSource
    .getRange(2, targetCol, 3)
    .getValues()
    .flatMap(x => x);

  Logger.log(data)
} 

const doublesRemover = (array) => {
  const cleanArray = [];
  for (let i = 0; i < array.length; i++) {
    if (cleanArray.includes(array[i][0])) {
      continue
    }
    cleanArray.push(array[i][0])
  }
  const structuredData = cleanArray.map(x => [x]);
  return structuredData
}
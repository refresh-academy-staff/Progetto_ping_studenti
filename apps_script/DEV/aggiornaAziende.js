const  aggiornaListaAziende = () => {
  
  const ssSource = SpreadsheetApp.openById(DATA_SPREADSHEET_DEV);
  const shSource = ssSource.getSheetById(SH_MATCHING);
  const shDest = ssSource.getSheetById(SH_AZIENDE);
  
  if (!shSource) {
    SpreadsheetApp.getUi().alert("Error: Source sheet 'Registrazioni' not found.");
    return;
  }
  
  if (!shDest) {
    SpreadsheetApp.getUi().alert("Error: Source sheet 'Aziende' not found.");
    return;
  }

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

  const current = destData
    .slice(1)
    .map(row => {
      const info = {
        name: row[idxNomeAzienda],
        id: row[0]
      }
      return info
    }) 

  const lastID = current.reduce((acc, x) => {
    const lastNumber = parseInt(x.id.split("AZ")[1]);
    return lastNumber > acc ? lastNumber : acc
  }, 0)

  const sourceData = shSource.getDataRange().getValues();

  if (sourceData.length < 1) {
    SpreadsheetApp.getUi().alert("The source sheet doesn't contain a header row on Row 1.");
    return;
  }
  
  const sourceHeaders = sourceData[0]; 

  const idxAzienda = sourceHeaders.indexOf("Azienda");
  
  if (idxAzienda === -1) {
    SpreadsheetApp.getUi().alert("Error: Could not find 'Azienda' in headers.");
    return;
  }

  const currentNames = current.map(azienda => azienda.name)
  const newNames = sourceData
  .slice(1)
  .map(row => row[idxAzienda])
  .filter(azienda => !currentNames.includes(azienda))

  const uniqueNames = doublesRemover(newNames);
  const listaNuoveAziede = uniqueNames.map((x, index) => {
    const newID = `AZ${lastID + index + 1}`;
    const nuovaAzienda = [newID, ...x];
    return nuovaAzienda
  })

  if (listaNuoveAziede.length > 0) {
    
    let lastRowValuedIndex = current.length;

    while (current[lastRowValuedIndex - 1].name === "" && lastRowValuedIndex !== 0) {
      lastRowValuedIndex--
    }

    shDest.getRange(lastRowValuedIndex + 2, 1, listaNuoveAziede.length, 2).setValues(listaNuoveAziede);
  }
}

const doublesRemover = (array) => {
  const cleanArray = [];
  for (let i = 0; i < array.length; i++) {
    if (cleanArray.includes(array[i])) {
      continue
    }
    cleanArray.push(array[i])
  }
  const structuredData = cleanArray.map(x => [x]);
  return structuredData
}
const appendRows = (sheet, rows) => {
  if (rows.length === 0) return

  sheet.getRange(
    sheet.getLastRow() + 1,
    1,
    rows.length,
    rows[0].length         
  ).setValues(rows) 
}
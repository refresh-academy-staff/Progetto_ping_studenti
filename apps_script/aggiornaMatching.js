function aggiungiNuoviMatching() {

  const DEST_SPREADSHEET_ID = '11jVyrC2B5OFriucEZ792sCZOAEDVVbMxyAWRIVygK8U'
  
  const ssSource = SpreadsheetApp.getActiveSpreadsheet();
  const shSource = ssSource.getSheetByName("Data_PingStingBot");
  const shDest = ssSource.getSheetByName("Matching");

  if (!shSource) {
    SpreadsheetApp.getUi().alert("Error: Source sheet 'Data_PingStingBot' not found.");
    return;
  }
  
  if (!shDest) {
    SpreadsheetApp.getUi().alert("Error: Source sheet 'Matching' not found.");
    return;
  }

  const sourceData = shSource.getDataRange().getValues();
  const idxMatching = sourceData[0].indexOf("Matching");
  const idxMatchingAgg = sourceData[0].indexOf("Matching aggiornato");

  const sourceHeader = sourceData[0];
  const newMatchingsHeader = [...sourceHeader, "Index"]

  const newMatchings = sourceData
    .map((row, index) => [...row, index + 1])
    .filter(row => row[idxMatching] === "nuovo" && row[idxMatchingAgg] === "no") 
  

  newMatchings.unshift(newMatchingsHeader);


  const idxIDStudente = newMatchingsHeader.indexOf("ID studente");
  const idxTipoEvento = newMatchingsHeader.indexOf("Tipo di evento");
  const idxDataEvento = newMatchingsHeader.indexOf("Data evento")
  const idxPosizione = newMatchingsHeader.indexOf("Posizione");
  const idxAzienda = newMatchingsHeader.indexOf("Azienda");
  const idxDataColloquio = newMatchingsHeader.indexOf("Data colloquio");
  const idxDataFineContratto = newMatchingsHeader.indexOf("Data fine contratto");
  const idxUltimaAttiv = newMatchingsHeader.indexOf("Ultima attività");
  const idxIndex = newMatchingsHeader.indexOf("Index");

  const destData = shDest.getDataRange().getValues();
  const destHeader = destData[0]

  let counter = 0;

  newMatchings.forEach((m, index) => {

    if (index === 0) return

    const candidatura = m[idxTipoEvento] === "Candidatura" ? "inviata" : null
    const dataCandidatura = candidatura ? m[idxDataEvento] : null
    const colloquioProg = m[idxTipoEvento] === "Colloquio programmato" ? "programmato" : null
    const colloquioSost = m[idxTipoEvento] === "Colloquio sostenuto" ? "sostenuto" : null
    const colloquio = colloquioProg ?? colloquioSost ?? null
    const dataColloquioProg = colloquioProg ? m[idxDataColloquio] : null
    const dataColloquioSost = colloquioSost ? m[idxDataColloquio] : null 
    const assunzione = m[idxTipoEvento] === "Assunzione" ? "sì" : null
    const dataFineContratto = m[idxDataFineContratto] ?? null
    const ultimaAttiv = m[idxUltimaAttiv]

    const newRow = [null, null, m[idxIDStudente], m[idxAzienda], m[idxPosizione], null, candidatura, dataCandidatura, colloquio,dataColloquioProg, dataColloquioSost, null, assunzione, null, dataFineContratto, ultimaAttiv]

    shDest.appendRow(newRow);
    shSource.getRange(m[parseInt(idxIndex)], idxMatchingAgg + 1).setValue("sì");

    counter++
  })

  Logger.log(`Aggiunte ${counter} righe su ${newMatchings.length - 1} con successo.`)
}

const aggiornaMatching = () => {

  const DEST_SPREADSHEET_ID = '11jVyrC2B5OFriucEZ792sCZOAEDVVbMxyAWRIVygK8U'
  
  const ssSource = SpreadsheetApp.getActiveSpreadsheet();
  const shSource = ssSource.getSheetByName("Data_PingStingBot");
  const shDest = ssSource.getSheetByName("Matching");

  if (!shSource) {
    SpreadsheetApp.getUi().alert("Error: Source sheet 'Data_PingStingBot' not found.");
    return;
  }
  
  if (!shDest) {
    SpreadsheetApp.getUi().alert("Error: Source sheet 'Matching' not found.");
    return;
  }

  const destData = shDest.getDataRange().getValues();

  const destHeader = destData[0];
  const dIdxMatchingID = destHeader.indexOf("ID matching");
  const dIdxPersona = destHeader.indexOf("Persona");
  const dIdxAzienda = destHeader.indexOf("Azienda");
  const dIdxPosizione = destHeader.indexOf("Posizione");
  const dIdxFonte = destHeader.indexOf("Fonte");
  const dIdxCandidatura = destHeader.indexOf("Candidatura");
  const dIdxDataCandidatura = destHeader.indexOf("Data candidatura");
  const dIdxColloquio = destHeader.indexOf("Colloquio");
  const dIdxDataColloquioPrevista = destHeader.indexOf("Data colloquio prevista");
  const dIdxDataColloquioEffettiva = destHeader.indexOf("Data colloquio effettiva");
  const dIdxEsitoColloquio = destHeader.indexOf("Esito colloquio");
  const dIdxAssunzione = destHeader.indexOf("Assunzione");
  const dIdxTipoContratto = destHeader.indexOf("Tipo contratto");
  const dIdxScadenzaContratto = destHeader.indexOf("Scadenza contratto");

  const sourceData = shSource.getDataRange().getValues();
  
  const sourceHeader = sourceData[0];
  const sIdxIDEvento = sourceHeader.indexOf("ID evento");
  const sIdxIDStudente = sourceHeader.indexOf("ID studente");
  const sIdxTipoEvento = sourceHeader.indexOf("Tipo di evento");
  const sIdxDataEvento = sourceHeader.indexOf("Data evento");
  const sIdxPosizione = sourceHeader.indexOf("Posizione");
  const sIdxAzienda = sourceHeader.indexOf("Azienda");
  const sIdxSede = sourceHeader.indexOf("Sede");
  const sIdxDataColloquio = sourceHeader.indexOf("Data colloquio");
  const sIdxDataFineContratto = sourceHeader.indexOf("Data fine contratto");
  const sIdxMatching = sourceHeader.indexOf("Matching");
  const sIdxMatchingAgg = sourceHeader.indexOf("Matching aggiornato");

  const newInfoHeader = [...sourceHeader, "Index"]

  const idxIndex = newInfoHeader.length - 1


  const newInfo = sourceData
    .map((row, index) => [...row, index + 1])
    .filter(row => row[sIdxMatching] !== "nuovo" && row[sIdxMatchingAgg] === "no") 
  

  newInfo.unshift(newInfoHeader);

  let counter = 0;

  newInfo.forEach((row, i) => {

    if (i === 0) return

    const idxMatchingToUpdate = destData.findIndex(destRow => destRow[dIdxMatchingID] === row[sIdxMatching]);
    const matchingToUpdate = destData[idxMatchingToUpdate];

    const eventType = row[sIdxTipoEvento]

    const sectionCandidatura = 
      eventType === "Candidatura" ?
        ["sì", row[sIdxDataEvento]]
        :
        [matchingToUpdate[dIdxCandidatura], matchingToUpdate[dIdxDataCandidatura]] 
    
    const sectionColloquio = 
      eventType === "Colloquio programmato" ? 
        ["programmato", row[sIdxDataColloquio], null, null]
        :
        eventType === "Colloquio sostenuto" ?
          ["sostenuto", matchingToUpdate[dIdxDataColloquioPrevista], row[sIdxDataColloquio], null]
          :
          [matchingToUpdate[dIdxColloquio], matchingToUpdate[dIdxDataColloquioPrevista], matchingToUpdate[dIdxDataColloquioEffettiva], matchingToUpdate[dIdxEsitoColloquio]]

    const sectionAssunzione = 
      eventType === "Assunzione" ?
        ["sì", null, row[sIdxDataFineContratto]]
        :
        [matchingToUpdate[dIdxAssunzione], null, matchingToUpdate[dIdxScadenzaContratto]]
      
    const updatedRow = sectionCandidatura.concat(sectionColloquio,sectionAssunzione);

    shDest.getRange(idxMatchingToUpdate + 1, dIdxCandidatura + 1, 1, updatedRow.length).setValues([updatedRow]);
    shSource.getRange(row[parseInt(idxIndex)], sIdxMatchingAgg + 1).setValue("sì");

    counter++

  })

  Logger.log(
    `Trovati ${newInfo.length - 1} aggiornamenti. 
    Aggiornati ${counter} matching con successo.
  `)
}
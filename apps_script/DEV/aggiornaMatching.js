const doPost = (e) => {

  const postData = JSON.parse(e.postData.contents)

  switch (postData.action) {
    case "update":
      aggiornaTuttiMatchings();
      break;
    case "new_matching":
      aggiungiNuoviMatching();
      break;
  }

  return HtmlService.createHtmlOutput('<b>Matching aggiornati</b>');
}

const aggiungiNuoviMatching = () => {

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const shSource = ss.getSheetById(935935300);
  const shDest = ss.getSheetById(1910429051);

  if (!shSource) {
    SpreadsheetApp.getUi().alert("Error: Source sheet not found.");
    return;
  }

  if (!shDest) {
    SpreadsheetApp.getUi().alert("Error: Destination sheet not found.");
    return;
  }

  const sourceData = shSource.getDataRange().getValues();
  const sourceHeader = sourceData[0];
  const newMatchingsHeader = [...sourceHeader, "Index"]

  const idxIDRegistrazione = newMatchingsHeader.indexOf("ID registrazione");
  const idxIDStudente = newMatchingsHeader.indexOf("ID studente");
  const idxStatoOpportunita = newMatchingsHeader.indexOf("Stato opportunità");
  const idxDataRegistrazione = newMatchingsHeader.indexOf("Data registrazione")
  const idxPosizione = newMatchingsHeader.indexOf("Posizione");
  const idxAzienda = newMatchingsHeader.indexOf("Azienda");
  const idxSede = newMatchingsHeader.indexOf("Sede");
  const idxFonte = newMatchingsHeader.indexOf("Fonte");
  const idxDataColloquio = newMatchingsHeader.indexOf("Data colloquio");
  const idxFeedbackColloquio = newMatchingsHeader.indexOf("Feedback colloquio");
  const idxTipoContratto = newMatchingsHeader.indexOf("Tipo contratto");
  const idxDataInizioContratto = newMatchingsHeader.indexOf("Data inizio contratto");
  const idxDataFineContratto = newMatchingsHeader.indexOf("Data fine contratto");
  const idxMatchingCreato = newMatchingsHeader.indexOf("Matching creato");
  const idxNote = newMatchingsHeader.indexOf("Note");
  const idxIndex = newMatchingsHeader.indexOf("Index");

  const newMatchings = sourceData
    .map((row, index) => [...row, index + 1])
    .filter(row => row[idxMatchingCreato] === "no")

  newMatchings.unshift(newMatchingsHeader);

  const destData = shDest.getDataRange().getValues();
  const destHeader = destData[0];
  const dIdx = getDestIndex(destHeader);

  let counter = 0;

  newMatchings.forEach((m, index) => {

    if (index === 0) return

    const idMatching = assignID(shDest, "MA");

    const newMatching = new Array(destHeader.length).fill("");

    newMatching[dIdx.matchingID] = idMatching;
    newMatching[dIdx.studenteID] = m[idxIDStudente];
    newMatching[dIdx.azienda] = m[idxAzienda];
    newMatching[dIdx.posizione] = m[idxPosizione];
    newMatching[dIdx.sede] = m[idxSede];
    newMatching[dIdx.fonte] = m[idxFonte];
    newMatching[dIdx.ultimaModifica] = m[idxDataRegistrazione];
    newMatching[dIdx.stato] = "aperto";

    switch (m[idxStatoOpportunita]) {
      case "candidatura_inviata": 
        newMatching[dIdx.candidatura] = "inviata";
        newMatching[dIdx.dataCandidatura] = m[idxDataRegistrazione];
        newMatching[dIdx.noteCandidatura] = m[idxNote];
        newMatching[dIdx.ultimaAttivita] = "Candidatura";
        break;
      case "colloquio_programmato":
        newMatching[dIdx.colloquio] = "programmato";
        newMatching[dIdx.dataColloquio] = m[idxDataColloquio];
        newMatching[dIdx.noteColloquio] = m[idxNote];
        newMatching[dIdx.ultimaAttivita] = "Colloquio programmato";
        break;
      case "colloquio_sostenuto":
        newMatching[dIdx.colloquio] = "sostenuto";
        newMatching[dIdx.colloquiSvolti] = 1;
        newMatching[dIdx.dataColloquio] = m[idxDataColloquio];
        newMatching[dIdx.feedbackColloquio] = m[idxFeedbackColloquio];
        newMatching[dIdx.noteColloquio] = m[idxNote];
        newMatching[dIdx.ultimaAttivita] = "Colloquio sostenuto";
        break;
      case "assunzione_prevista": 
        newMatching[dIdx.assunzione] = "Assunzione prevista";
        newMatching[dIdx.tipoContratto] = m[idxTipoContratto];
        newMatching[dIdx.dataInizioContratto] = m[idxDataInizioContratto];
        newMatching[dIdx.dataScadenzaContratto] = m[idxDataFineContratto];
        newMatching[dIdx.noteAssunzione] = m[idxNote];
        newMatching[dIdx.ultimaAttivita] = "Assunzione prevista";
        break; 
      case "assunzione_avvenuta": 
        newMatching[dIdx.assunzione] = "Assunzione avvenuta";
        newMatching[dIdx.tipoContratto] = m[idxTipoContratto];
        newMatching[dIdx.dataInizioContratto] = m[idxDataInizioContratto];
        newMatching[dIdx.dataScadenzaContratto] = m[idxDataFineContratto]; 
        newMatching[dIdx.noteAssunzione] = m[idxNote];
        newMatching[dIdx.ultimaAttivita] = "Assunzione avvenuta";
        break;
    }

    shDest.appendRow(newMatching);
    const idRegistrazione = assignID(shSource, "RE");
    shSource.getRange(m[parseInt(idxIndex)], idxIDRegistrazione + 1).setValue(idRegistrazione);
    shSource.getRange(m[parseInt(idxIndex)], idxMatchingCreato + 1).setValue("sì");

    counter++
  })

  Logger.log(`Aggiunte ${counter} righe su ${newMatchings.length - 1} con successo.`)
}

const aggiornaTuttiMatchings = () => {

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const shSource = ss.getSheetById(594811163);
  const shDest = ss.getSheetById(1910429051);

  if (!shSource) {
    SpreadsheetApp.getUi().alert("Error: Source sheet not found.");
    return;
  }

  if (!shDest) {
    SpreadsheetApp.getUi().alert("Error: Destination sheet not found.");
    return;
  }

  const destData = shDest.getDataRange().getValues();
  const destHeader = destData[0];

  const dIdx = getDestIndex(destHeader);


  const sourceData = shSource.getDataRange().getValues();
  const sourceHeader = sourceData[0];
  const newInfoHeader = [...sourceHeader, "Index"]

  const sIdx = getSourceIndex(newInfoHeader);

  const newInfo = sourceData
    .map((row, index) => [...row, index + 1])
    .filter(row => row[sIdx.matchingAgg] === "no")


  newInfo.unshift(newInfoHeader);

  let counter = 0;

  newInfo.forEach((row, i) => {

    if (i === 0) return

    const idxMatchingToUpdate = destData.findIndex(destRow => destRow[dIdx.matchingID] === row[sIdx.matchingID]);
    const matchingToUpdate = destData[idxMatchingToUpdate];
    const updatedRow = matchingToUpdate.slice();

    const nuovoStato = row[sIdx.nuovoStato]


    switch (nuovoStato) {

      case ("colloquio_programmato"):
        updatedRow[dIdx.colloquio] = "programmato"
        updatedRow[dIdx.dataColloquio] = row[sIdx.dataColloquio]
        updatedRow[dIdx.ultimaAttivita] = "Colloquio programmato"
        break;
      case ("colloquio_sostenuto"):
      case ("collprog_avvenuto"):
        updatedRow[dIdx.colloquio] = "sostenuto"
        updatedRow[dIdx.dataColloquio] = row[sIdx.dataColloquio]
        updatedRow[dIdx.colloquiSvolti] = updatedRow[dIdx.colloquiSvolti] ? updatedRow[dIdx.colloquiSvolti] + 1 : 1
        updatedRow[dIdx.feedbackColloquio] = row[sIdx.feedbackColloquio]
        updatedRow[dIdx.ultimaAttivita] = "Colloquio sostenuto"
        break;
      case ("colloquio_rimandato"):
        updatedRow[dIdx.colloquio] = "rimandato"
        updatedRow[dIdx.dataColloquio] = row[sIdx.dataColloquio]
        updatedRow[dIdx.ultimaAttivita] = "Colloquio rimandato"
        break;
      case ("colloquio_non_presentato"):
        updatedRow[dIdx.colloquio] = "non presente"
        updatedRow[dIdx.ultimaAttivita] = "Non presente al colloquio"
        break;
      case ("colloquio_annullato"):
        updatedRow[dIdx.colloquio] = "annullato"
        updatedRow[dIdx.ultimaAttivita] = "Colloquio annullato"
        break;
      case ("assunzione_prevista"):
        updatedRow[dIdx.assunzione] = "prevista"
        updatedRow[dIdx.tipoContratto] = row[sIdx.tipoContratto];
        updatedRow[dIdx.dataInizioContratto] = row[sIdx.dataInizioContratto];
        updatedRow[dIdx.dataScadenzaContratto] = row[sIdx.dataFineContratto];
        updatedRow[dIdx.ultimaAttivita] = "Assunzione prevista"
        break;
      case ("assunzione_avvenuta"):
        updatedRow[dIdx.assunzione] = "avvenuta"
        updatedRow[dIdx.tipoContratto] = row[sIdx.tipoContratto];
        updatedRow[dIdx.dataInizioContratto] = row[sIdx.dataInizioContratto];
        updatedRow[dIdx.dataScadenzaContratto] = row[sIdx.dataFineContratto];
        updatedRow[dIdx.ultimaAttivita] = "Assunzione programmata"
        break;
      case ("assunzione_annullata"):
        updatedRow[dIdx.assunzione] = "annullata"
        updatedRow[dIdx.ultimaAttivita] = "Colloquio annullata"
        break;
      case ("chiusura"):
        updatedRow[dIdx.stato] = "chiuso"
        updatedRow[dIdx.motivoChiusura] = row[sIdx.motivoChiusura]
        updatedRow[dIdx.ultimaAttivita] = "Chiusura"
        break;
    }

    switch (nuovoStato) {
      case ("colloquio_programmato"):
      case ("colloquio_sostenuto"):
      case ("colloquio_rimandato"):
      case ("colloquio_annullato"):
      case ("colloquio_non_presentato"):
        updatedRow[dIdx.noteColloquio] = row[sIdx.note];
        break;
      case ("assunzione_prevista"):
      case ("assunzione_avvenuta"):
      case ("assunzione_annulata"):
        updatedRow[dIdx.noteAssunzione] = row[sIdx.note];
        break;
      case ("chiusura"):
        updatedRow[dIdx.noteChiusura] = row[sIdx.note];
        break;
    }

    updatedRow[dIdx.ultimaModifica] = new Date();

    const columnsToUpdate = updatedRow.slice(dIdx.stato +1)

    shDest.getRange(idxMatchingToUpdate + 1, dIdx.stato + 2, 1, columnsToUpdate.length).setValues([columnsToUpdate]);

    const idAggiornamento = assignID(shSource, "AG");
    shSource.getRange(row[parseInt(sIdx.index)], sIdx.idAggiornamento + 1).setValue(idAggiornamento);
    shSource.getRange(row[parseInt(sIdx.index)], sIdx.matchingAgg + 1).setValue("sì");

    counter++

  })

  Logger.log(
    `Trovati ${newInfo.length - 1} aggiornamenti.
    Aggiornati ${counter} matching con successo.
  `)
}
const getDestIndex = (header) => {
  const dIdx = {
    matchingID: header.indexOf("ID matching"),
    studente: header.indexOf("Studente"),
    studenteID: header.indexOf("ID studente"),
    azienda: header.indexOf("Azienda"),
    posizione: header.indexOf("Posizione"),
    fonte: header.indexOf("Fonte"),
    stato: header.indexOf("Stato"),
    motivoChiusura: header.indexOf("Motivo chiusura"),
    noteChiusura: header.indexOf("Note chiusura"),
    candidatura: header.indexOf("Candidatura"),
    dataCandidatura: header.indexOf("Data candidatura"),
    noteCandidatura: header.indexOf("Note candidatura"),
    colloquiSvolti: header.indexOf("Colloqui svolti"),
    colloquio: header.indexOf("Colloquio"),
    dataColloquio: header.indexOf("Data colloquio"),
    feedbackColloquio: header.indexOf("Feedback colloquio"),
    noteColloquio: header.indexOf("Note colloquio"),
    assunzione: header.indexOf("Assunzione"),
    tipoContratto: header.indexOf("Tipo contratto"),
    dataInizioContratto: header.indexOf("Data inizio contratto"),
    dataScadenzaContratto: header.indexOf("Data scadenza contratto"),
    noteAssunzione: header.indexOf("Note assunzione"),
    ultimaAttivita: header.indexOf("Ultima attività"),
    ultimaModifica: header.indexOf("Ultima modifica")
  }
  return dIdx
}
const getSourceIndex = (header) => {

  const sIdx = {
    idAggiornamento: header.indexOf("ID aggiornamento"),
    matchingID: header.indexOf("ID matching"),
    nomeStudente: header.indexOf("Studente"),
    idStudente: header.indexOf("ID studente"),
    nuovoStato: header.indexOf("Nuovo stato"),
    dataColloquio: header.indexOf("Data colloquio"),
    feedbackColloquio: header.indexOf("Feedback colloquio"),
    tipoContratto	: header.indexOf("Tipo contratto"),
    dataInizioContratto: header.indexOf("Inizio contratto"),
    dataFineContratto: header.indexOf("Fine contratto"),
    motivoChiusura: header.indexOf("Motivo chiusura"),
    note: header.indexOf("Note"),
    matchingAgg: header.indexOf("Matching aggiornato"),
    dataAggiornamento: header.indexOf("Data aggiornamento"),
    index: header.indexOf("Index")
  }

  return sIdx
}
const assignID = (sheet, prefix) => {
  let lastRow = sheet.getLastRow();

  if (lastRow === 1) {
    Logger.log("There aren't any matching updates records")
  }

  if (lastRow === 2) {
    const newID = `${prefix}10000`
    return newID
  }

  let lastValue = sheet.getRange(lastRow, 1).getValue();

  while (lastValue === "") {
    lastRow--
    lastValue = sheet.getRange(lastRow, 1).getValue();
  }

  if (!lastValue.startsWith(prefix)) {
    Logger.log(`Could not find an ID with matching prefix - ${prefix}`)
    return
  }
  const lastValueNumber = parseInt(lastValue.split(prefix)[1]);
  const newID = `${prefix}${lastValueNumber + 1}`
  return newID
}


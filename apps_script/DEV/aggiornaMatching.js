const doPost = (e) => {

  const SPREADSHEET_ID = "1kfZTjFALTAEUg-qtBTo-SwcWhQGyvdqXaf50EcLLL4Y"

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

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

  const SPREADSHEET_ID = '1kfZTjFALTAEUg-qtBTo-SwcWhQGyvdqXaf50EcLLL4Y'

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const shSource = ss.getSheetById(935935300);
  const shDest = ss.getSheetById(1910429051);

  if (!shSource) {
    SpreadsheetApp.getUi().alert("Error: Source sheet not found.");
    return;
  }

  if (!shDest) {
    SpreadsheetApp.getUi().alert("Error: Source sheet not found.");
    return;
  }

  const sourceData = shSource.getDataRange().getValues();
  const sourceHeader = sourceData[0];
  const newMatchingsHeader = [...sourceHeader, "Index"]


  const sIdxIDRegistrazione = sourceData[0].indexOf("ID registrazione");
  const idxIDStudente = newMatchingsHeader.indexOf("ID studente");
  const idxStatoOpportunita = newMatchingsHeader.indexOf("Stato opportunità");
  const idxDataRegistrazione = newMatchingsHeader.indexOf("Data registrazione")
  const idxPosizione = newMatchingsHeader.indexOf("Posizione");
  const idxAzienda = newMatchingsHeader.indexOf("Azienda");
  const idxSede = newMatchingsHeader.indexOf("Sede");
  const idxDataColloquio = newMatchingsHeader.indexOf("Data colloquio");
  const idxTipoContratto = newMatchingsHeader.indexOf("Tipo contratto");
  const idxDataInizioContratto = newMatchingsHeader.indexOf("Data inizio contratto");
  const idxDataFineContratto = newMatchingsHeader.indexOf("Data fine contratto");
  const idxMatchingCreato = sourceData[0].indexOf("Matching creato");
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

    const newMatching = new Array(destHeader.length).fill("");

    newMatching[dIdx.studenteID] = m[idxIDStudente] 
    newMatching[dIdx.azienda] = m[idxAzienda]
    newMatching[dIdx.posizione] = m[idxPosizione]

    switch (m[idxStatoOpportunita]) {
      case "Candidatura": 
        newMatching[dIdx.candidatura] = "inviata";
        newMatching[dIdx.dataCandidatura] = m[idxDataRegistrazione];
        newMatching[idx.ultimaAttivita] = "Candidatura";
        break;
      case "Colloquio programmato":
        newMatching[dIdx.colloquio] = "programmato";
        newMatching[dIdx.dataColloquioPrevista] = m[idxDataColloquio];
        newMatching[dIdx.ultimaAttivita] = "Colloquio programmato";
        break;
      case "Colloquio sostenuto":
        newMatching[dIdx.colloquio] = "sostenuto";
        newMatching[dIdx.colloquiSvolti] = 1;
        newMatching[dIdx.dataColloquioEffettiva] = m[idxDataColloquio];
        newMatching[idx.ultimaAttivita] = "Colloquio sostenuto";
        break;
      case "Assunzione prevista": 
        newMatching[dIdx.assunzione] = "Assunzione prevista";
        newMatching[dIdx.tipoContratto] = m[idxTipoContratto];
        newMatching[dIdx.dataInizioContratto] = m[idxDataInizioContratto];
        newMatching[dIdx.dataScadenzaContratto] = m[idxDataFineContratto];
        newMatching[idx.ultimaAttivita] = "Assunzione prevista";
        break; 
      case "Assunzione avvenuta": 
        newMatching[dIdx.assunzione] = "Assunzione avvenuta";
        newMatching[dIdx.tipoContratto] = m[idxTipoContratto];
        newMatching[dIdx.dataInizioContratto] = m[idxDataInizioContratto];
        newMatching[dIdx.dataScadenzaContratto] = m[idxDataFineContratto]; 
        newMatching[idx.ultimaAttivita] = "Assunzione avvenuta";
        break;
    }

    shDest.appendRow(newMatching);
    shSource.getRange(m[parseInt(idxIndex)], idxMatchingCreato + 1).setValue("sì");

    counter++
  })

  Logger.log(`Aggiunte ${counter} righe su ${newMatchings.length - 1} con successo.`)
}

const aggiornaTuttiMatchings = () => {

  const SPREADSHEET_ID = "1kfZTjFALTAEUg-qtBTo-SwcWhQGyvdqXaf50EcLLL4Y"

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
        updatedRow[dIdx.dataColloquioPrevista] = row[sIdx.dataColloquio]
        updatedRow[dIdx.ultimaAttivita] = "Colloquio programmato"
        break;
      case ("colloquio_sostenuto"):
      case ("collprog_avvenuto"):
        updatedRow[dIdx.colloquio] = "sostenuto"
        updatedRow[dIdx.dataColloquioEffettiva] = row[sIdx.dataColloquio]
        updatedRow[dIdx.colloquiSvolti] = updatedRow[dIdx.colloquiSvolti] ? updatedRow[dIdx.colloquiSvolti] + 1 : 1
        updatedRow[dIdx.feedbackColloquio] = row[sIdx.feedbackColloquio]
        updatedRow[dIdx.ultimaAttivita] = "Colloquio sostenuto"
        break;
      case ("colloquio_rimandato"):
        updatedRow[dIdx.colloquio] = "rimandato"
        updatedRow[dIdx.dataColloquioPrevista] = row[sIdx.dataColloquio]
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
        updatedRow[dIdx.chiusura] = "chiusa"
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

    const columnsToUpdate = updatedRow.slice(dIdx.chiusura +1)

    shDest.getRange(idxMatchingToUpdate + 1, dIdx.chiusura + 2, 1, columnsToUpdate.length).setValues([columnsToUpdate]);
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
    chiusura: header.indexOf("Opp_chiusa"),
    motivoChiusura: header.indexOf("Motivo chiusura"),
    noteChiusura: header.indexOf("Note chiusura"),
    candidatura: header.indexOf("Candidatura"),
    dataCandidatura: header.indexOf("Data candidatura"),
    noteCandidatura: header.indexOf("Note candidatura"),
    colloquiSvolti: header.indexOf("Colloqui svolti"),
    colloquio: header.indexOf("Colloquio"),
    dataColloquioPrevista: header.indexOf("Data colloquio prevista"),
    dataColloquioEffettiva: header.indexOf("Data colloquio effettiva"),
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


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

  const ss = SpreadsheetApp.openById(DATA_SPREADSHEET_DEV);
  const shSource = ss.getSheetById(SH_REGISTRAZIONI);
  const shDest = ss.getSheetById(SH_MATCHING);

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

  const sourceIndexes = getIndexes(newMatchingsHeader);

  const newMatchings = sourceData
    .map((row, index) => [...row, index + 1])
    .filter(row => row[sourceIndexes.matchingCreato] === "no")

  newMatchings.unshift(newMatchingsHeader);

  const destData = shDest.getDataRange().getValues();
  const destHeader = destData[0];
  const destIndexes = getIndexes(destHeader);

  let counter = 0;

  newMatchings.forEach((m, index) => {

    if (index === 0) return

    const idMatching = assignID(shDest, "MA");

    const newMatching = new Array(destHeader.length).fill("");

    newMatching[destIndexes.idMatching] = idMatching;
    newMatching[destIndexes.idStudente] = m[sourceIndexes.idStudente];
    newMatching[destIndexes.azienda] = m[sourceIndexes.azienda];
    newMatching[destIndexes.posizione] = m[sourceIndexes.posizione];
    newMatching[destIndexes.sede] = m[sourceIndexes.sede];
    newMatching[destIndexes.fonte] = m[sourceIndexes.fonte];
    newMatching[destIndexes.ultimaModifica] = m[sourceIndexes.dataRegistrazione];

    switch (m[sourceIndexes.statoOpportunita]) {
      case "candidatura_inviata": 
        newMatching[destIndexes.candidatura] = "inviata";
        newMatching[destIndexes.dataCandidatura] = m[sourceIndexes.dataRegistrazione];
        newMatching[destIndexes.noteCandidatura] = m[sourceIndexes.note];
        newMatching[destIndexes.ultimaAttivita] = "Candidatura";
        break;
      case "colloquio_programmato":
        newMatching[destIndexes.colloquio] = "programmato";
        newMatching[destIndexes.dataColloquio] = m[sourceIndexes.dataColloquio];
        newMatching[destIndexes.noteColloquio] = m[sourceIndexes.note];
        newMatching[destIndexes.ultimaAttivita] = "Colloquio programmato";
        break;
      case "colloquio_sostenuto":
        newMatching[destIndexes.colloquio] = "sostenuto";
        newMatching[destIndexes.colloquiSvolti] = 1;
        newMatching[destIndexes.dataColloquio] = m[sourceIndexes.dataColloquio];
        newMatching[destIndexes.feedbackColloquio] = m[sourceIndexes.feedbackColloquio];
        newMatching[destIndexes.noteColloquio] = m[sourceIndexes.note];
        if (m[sourceIndexes.feedbackColloquio] === "feedback_colloquio_si_neg") {
          newMatching[destIndexes.ultimaAttivita] = "Chiusura";
          newMatching[destIndexes.stato] = "chiuso"
          newMatching[destIndexes.motivoChiusura] = "Colloquio negativo"
          break;
        }
        newMatching[destIndexes.ultimaAttivita] = "Colloquio sostenuto";
        break;
      case "assunzione_prevista": 
        newMatching[destIndexes.assunzione] = "Assunzione prevista";
        newMatching[destIndexes.tipoContratto] = m[sourceIndexes.tipoContratto];
        newMatching[destIndexes.dataInizioContratto] = m[sourceIndexes.dataInizioContratto];
        newMatching[destIndexes.dataScadenzaContratto] = m[sourceIndexes.dataFineContratto];
        newMatching[destIndexes.noteAssunzione] = m[sourceIndexes.note];
        newMatching[destIndexes.ultimaAttivita] = "Assunzione prevista";
        break; 
      case "assunzione_avvenuta": 
        newMatching[destIndexes.assunzione] = "Assunzione avvenuta";
        newMatching[destIndexes.tipoContratto] = m[sourceIndexes.tipoContratto];
        newMatching[destIndexes.dataInizioContratto] = m[sourceIndexes.dataInizioContratto];
        newMatching[destIndexes.dataScadenzaContratto] = m[sourceIndexes.dataFineContratto]; 
        newMatching[destIndexes.noteAssunzione] = m[sourceIndexes.note];
        newMatching[destIndexes.ultimaAttivita] = "Assunzione avvenuta";
        break;
    }

    shDest.appendRow(newMatching);
    const idRegistrazione = assignID(shSource, "RE");
    shSource.getRange(m[parseInt(sourceIndexes.index)], sourceIndexes.idRegistrazione + 1).setValue(idRegistrazione);
    shSource.getRange(m[parseInt(sourceIndexes.index)], sourceIndexes.matchingCreato + 1).setValue("sì");

    counter++
  })

  Logger.log(`Aggiunte ${counter} righe su ${newMatchings.length - 1} con successo.`)
}

const aggiornaTuttiMatchings = () => {

  const ss = SpreadsheetApp.openById(DATA_SPREADSHEET_DEV);
  const shSource = ss.getSheetById(SH_AGGIORNAMENTI_MATCHING);
  const shDest = ss.getSheetById(SH_MATCHING);

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

  const destIndexes = getIndexes(destHeader);


  const sourceData = shSource.getDataRange().getValues();
  const sourceHeader = sourceData[0];
  const newInfoHeader = [...sourceHeader, "Index"]

  const sourceIndexes = getIndexes(newInfoHeader);

  const newInfo = sourceData
    .map((row, index) => [...row, index + 1])
    .filter(row => row[sourceIndexes.matchingAggiornato] === "no")


  newInfo.unshift(newInfoHeader);

  let counter = 0;

  newInfo.forEach((row, i) => {

    if (i === 0) return

    const idxMatchingToUpdate = destData.findIndex(destRow => destRow[destIndexes.idMatching] === row[sourceIndexes.idMatching]);
    const matchingToUpdate = destData[idxMatchingToUpdate];
    const updatedRow = matchingToUpdate.slice();

    const nuovoStato = row[sourceIndexes.nuovoStato]


    switch (nuovoStato) {

      case ("colloquio_programmato"):
        updatedRow[destIndexes.colloquio] = "programmato"
        updatedRow[destIndexes.dataColloquio] = row[sourceIndexes.dataColloquio]
        updatedRow[destIndexes.ultimaAttivita] = "Colloquio programmato"
        break;
      case ("colloquio_sostenuto"):
      case ("collprog_avvenuto"):
        updatedRow[destIndexes.colloquio] = "sostenuto"
        updatedRow[destIndexes.dataColloquio] = row[sourceIndexes.dataColloquio]
        updatedRow[destIndexes.colloquiSvolti] = updatedRow[destIndexes.colloquiSvolti] ? updatedRow[destIndexes.colloquiSvolti] + 1 : 1
        updatedRow[destIndexes.feedbackColloquio] = row[sourceIndexes.feedbackColloquio]
        if (row[sourceIndexes.feedbackColloquio] === "feedback_colloquio_si_neg") {
          updatedRow[destIndexes.ultimaAttivita] = "Chiusura";
          updatedRow[destIndexes.motivoChiusura] = "Colloquio negativo"
          break;
        }
        updatedRow[destIndexes.ultimaAttivita] = "Colloquio sostenuto"
        break;
      case ("colloquio_rimandato"):
        updatedRow[destIndexes.colloquio] = "rimandato"
        updatedRow[destIndexes.dataColloquio] = row[sourceIndexes.dataColloquio]
        updatedRow[destIndexes.ultimaAttivita] = "Colloquio rimandato"
        break;
      case ("colloquio_non_presentato"):
        updatedRow[destIndexes.colloquio] = "non presente"
        updatedRow[destIndexes.ultimaAttivita] = "Non presente al colloquio"
        break;
      case ("colloquio_annullato"):
        updatedRow[destIndexes.colloquio] = "annullato"
        updatedRow[destIndexes.ultimaAttivita] = "Colloquio annullato"
        break;
      case ("assunzione_prevista"):
        updatedRow[destIndexes.assunzione] = "prevista"
        updatedRow[destIndexes.tipoContratto] = row[sourceIndexes.tipoContratto];
        updatedRow[destIndexes.dataInizioContratto] = row[sourceIndexes.inizioContratto];
        updatedRow[destIndexes.dataScadenzaContratto] = row[sourceIndexes.dataFineContratto];
        updatedRow[destIndexes.ultimaAttivita] = "Assunzione prevista"
        break;
      case ("assunzione_avvenuta"):
        updatedRow[destIndexes.assunzione] = "avvenuta"
        updatedRow[destIndexes.tipoContratto] = row[sourceIndexes.tipoContratto];
        updatedRow[destIndexes.dataInizioContratto] = row[sourceIndexes.inizioContratto];
        updatedRow[destIndexes.dataScadenzaContratto] = row[sourceIndexes.dataFineContratto];
        updatedRow[destIndexes.ultimaAttivita] = "Assunzione avvenuta"
        break;
      case ("assunzione_annullata"):
        updatedRow[destIndexes.ultimaAttivita] = "Chiusura";
        updatedRow[destIndexes.motivoChiusura] = "Altro"
        updatedRow[destIndexes.noteChiusura] = row[sourceIndexes.note];
        updatedRow[destIndexes.assunzione] = "Assunzione annullata"
        break;
      case ("chiusura"):
        updatedRow[destIndexes.motivoChiusura] = row[sourceIndexes.motivoChiusura]
        updatedRow[destIndexes.ultimaAttivita] = "Chiusura"
        break;
    }

    switch (nuovoStato) {
      case ("colloquio_programmato"):
      case ("colloquio_sostenuto"):
      case ("colloquio_rimandato"):
      case ("colloquio_annullato"):
      case ("colloquio_non_presentato"):
        updatedRow[destIndexes.noteColloquio] = row[sourceIndexes.note];
        break;
      case ("assunzione_prevista"):
      case ("assunzione_avvenuta"):
        updatedRow[destIndexes.noteAssunzione] = row[sourceIndexes.note];
        break;
      case ("chiusura"):
        updatedRow[destIndexes.noteChiusura] = row[sourceIndexes.note];
        break;
    }

    updatedRow[destIndexes.ultimaModifica] = new Date();

    const columnsToUpdate = updatedRow.slice(destIndexes.stato +1)
    shDest.getRange(idxMatchingToUpdate + 1, destIndexes.stato + 2, 1, columnsToUpdate.length).setValues([columnsToUpdate]);

    const idAggiornamento = assignID(shSource, "AG");
    shSource.getRange(row[parseInt(sourceIndexes.index)], sourceIndexes.idAggiornamento + 1).setValue(idAggiornamento);
    shSource.getRange(row[parseInt(sourceIndexes.index)], sourceIndexes.matchingAggiornato + 1).setValue("sì");

    counter++

  })

  Logger.log(
    `Trovati ${newInfo.length - 1} aggiornamenti.
    Aggiornati ${counter} matching con successo.
  `)
}
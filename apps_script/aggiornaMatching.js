function aggiungiNuoviMatching() {

  const DEST_SPREADSHEET_ID = '1BS3XbUV2iEp5jZzxrSIZR65002id-q_SV4esIg2h8fY'

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

const doPost = (e) => {

  const postData = JSON.parse(e.postData.contents)

  const ssSourceIds = {
    test: "1BS3XbUV2iEp5jZzxrSIZR65002id-q_SV4esIg2h8fY",
    dev: "1kfZTjFALTAEUg-qtBTo-SwcWhQGyvdqXaf50EcLLL4Y",
  }

  const SPREADSHEET_ID = ssSourceIds[postData.env]

  const ssSource = SpreadsheetApp.openById(SPREADSHEET_ID);
  const shSource = ssSource.getSheetById(594811163);
  const shDest = ssSource.getSheetById(1910429051);

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
  const dIdxMatchingID = destHeader.indexOf("ID matching");
  const dIdxStudente = destHeader.indexOf("Studente");
  const dIdxStudenteID = destHeader.indexOf("ID studente");
  const dIdxAzienda = destHeader.indexOf("Azienda");
  const dIdxPosizione = destHeader.indexOf("Posizione");
  const dIdxFonte = destHeader.indexOf("Fonte");
  const dIdxChiusura = destHeader.indexOf("Opp_chiusa");
  const dIdxMotivoChiusura = destHeader.indexOf("Motivo chiusura");
  const dIdxNoteChiusura = destHeader.indexOf("Note chiusura");
  const dIdxCandidatura = destHeader.indexOf("Candidatura");
  const dIdxDataCandidatura = destHeader.indexOf("Data candidatura");
  const dIdxNoteCandidatura = destHeader.indexOf("Note candidatura");
  const dIdxColloquiSvolti = destHeader.indexOf("Colloqui svolti");
  const dIdxColloquio = destHeader.indexOf("Colloquio");
  const dIdxDataColloquioPrevista = destHeader.indexOf("Data colloquio prevista");
  const dIdxDataColloquioEffettiva = destHeader.indexOf("Data colloquio effettiva");
  const dIdxFeedbackColloquio = destHeader.indexOf("Feedback colloquio");
  const dIdxNoteColloquio = destHeader.indexOf("Note colloquio");
  const dIdxAssunzione = destHeader.indexOf("Assunzione");
  const dIdxTipoContratto = destHeader.indexOf("Tipo contratto");
  const dIdxScadenzaContratto = destHeader.indexOf("Scadenza contratto");
  const dIdxNoteAssunzione = destHeader.indexOf("Note assunzione");
  const dIdxUltimaAttività = destHeader.indexOf("Ultima attività");
  const dIdxUltimaModifica = destHeader.indexOf("Ultima modifica");

  const sourceData = shSource.getDataRange().getValues();

  const sourceHeader = sourceData[0];
  const sIdxIDAggiornamen = sourceHeader.indexOf("ID aggiornamento");
  const sIdxMatchingID = sourceHeader.indexOf("ID matching");
  const sIdxNomeStudente = sourceHeader.indexOf("Studente");
  const sIdxIDStudente = sourceHeader.indexOf("ID studente");
  const sIdxNuovoStato = sourceHeader.indexOf("Nuovo stato");
  const sIdxDataColloquio = sourceHeader.indexOf("Data colloquio");
  const sIdxFeedbackColloquio = sourceHeader.indexOf("Feedback colloquio");
  const sIdxTipoContratto	 = sourceHeader.indexOf("Tipo contratto");
  const sIdxDataInizioContratto = sourceHeader.indexOf("Inizio contratto");
  const sIdxDataFineContratto = sourceHeader.indexOf("Fine contratto");
  const sIdxMotivoChiusura = sourceHeader.indexOf("Motivo chiusura");
  const sIdxNote = sourceHeader.indexOf("Note");
  const sIdxMatchingAgg = sourceHeader.indexOf("Matching aggiornato");

  const newInfoHeader = [...sourceHeader, "Index"]

  const idxIndex = newInfoHeader.length - 1


  const newInfo = sourceData
    .map((row, index) => [...row, index + 1])
    .filter(row => row[sIdxMatchingAgg] === "no")


  newInfo.unshift(newInfoHeader);

  let counter = 0;

  newInfo.forEach((row, i) => {

    if (i === 0) return

    const idxMatchingToUpdate = destData.findIndex(destRow => destRow[dIdxMatchingID] === row[sIdxMatchingID]);
    const matchingToUpdate = destData[idxMatchingToUpdate];
    const updatedRow = matchingToUpdate.slice();

    const nuovoStato = row[sIdxNuovoStato]

    switch (nuovoStato) {

      case ("colloquio_programmato"):
        updatedRow[dIdxColloquio] = "programmato"
        updatedRow[dIdxDataColloquioPrevista] = row[sIdxDataColloquio]
        updatedRow[dIdxUltimaAttività] = "Colloquio programmato"
        break;
      case ("colloquio_sostenuto"):
      case ("collprog_avvenuto"):
        updatedRow[dIdxColloquio] = "sostenuto"
        updatedRow[dIdxDataColloquioEffettiva] = row[sIdxDataColloquio]
        updatedRow[dIdxColloquiSvolti] = updatedRow[dIdxColloquiSvolti] ? updatedRow[dIdxColloquiSvolti] + 1 : 1
        updatedRow[dIdxFeedbackColloquio] = row[sIdxFeedbackColloquio]
        updatedRow[dIdxUltimaAttività] = "Colloquio sostenuto"
        break;
      case ("colloquio_rimandato"):
        updatedRow[dIdxColloquio] = "rimandato"
        updatedRow[dIdxDataColloquioPrevista] = row[sIdxDataColloquio]
        updatedRow[dIdxUltimaAttività] = "Colloquio rimandato"
        break;
      case ("colloquio_non_presentato"):
        updatedRow[dIdxColloquio] = "non presente"
        updatedRow[dIdxUltimaAttività] = "Non presente al colloquio"
        break;
      case ("colloquio_annullato"):
        updatedRow[dIdxColloquio] = "annullato"
        updatedRow[dIdxUltimaAttività] = "Colloquio annullato"
        break;
      case ("assunzione_prevista"):
        updatedRow[dIdxAssunzione] = "prevista"
        updatedRow[dIdxTipoContratto] = row[sIdxTipoContratto];
        updatedRow[dIdxScadenzaContratto] = row[sIdxDataFineContratto];
        updatedRow[dIdxUltimaAttività] = "Assunzione prevista"
        break;
      case ("assunzione_avvenuta"):
        updatedRow[dIdxAssunzione] = "avvenuta"
        updatedRow[dIdxTipoContratto] = row[sIdxTipoContratto];
        updatedRow[dIdxScadenzaContratto] = row[sIdxDataFineContratto];
        updatedRow[dIdxUltimaAttività] = "Assunzione programmata"
        break;
      case ("assunzione_annullata"):
        updatedRow[dIdxAssunzione] = "annullata"
        updatedRow[dIdxUltimaAttività] = "Colloquio annullata"
        break;
      case ("chiusura"):
        updatedRow[dIdxChiusura] = "chiusa"
        updatedRow[dIdxMotivoChiusura] = row[sIdxMotivoChiusura]
        updatedRow[dIdxUltimaAttività] = "Chiusura"
        break;
    }

    switch (nuovoStato) {
      case ("colloquio_programmato"):
      case ("colloquio_sostenuto"):
      case ("colloquio_rimandato"):
      case ("colloquio_annullato"):
      case ("colloquio_non_presentato"):
        updatedRow[dIdxNoteColloquio] = row[sIdxNote];
        break;
      case ("assunzione_prevista"):
      case ("assunzione_avvenuta"):
      case ("assunzione_annulata"):
        updatedRow[dIdxNoteAssunzione] = row[sIdxNote];
        break;
      case ("chiusura"):
        updatedRow[dIdxNoteChiusura] = row[sIdxNote];
        break;
    }

    updatedRow[dIdxUltimaModifica] = new Date();

    const columnsToUpdate = updatedRow.slice(dIdxChiusura +1)

    shDest.getRange(idxMatchingToUpdate + 1, dIdxChiusura + 2, 1, columnsToUpdate.length).setValues([columnsToUpdate]);
    shSource.getRange(row[parseInt(idxIndex)], sIdxMatchingAgg + 1).setValue("sì");

    counter++

  })

  Logger.log(
    `Trovati ${newInfo.length - 1} aggiornamenti.
    Aggiornati ${counter} matching con successo.
  `)

  return HtmlService.createHtmlOutput('<b>Matching aggiornati</b>');
}
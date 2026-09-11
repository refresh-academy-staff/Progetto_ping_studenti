const notifyUser = () => {
  const sendMessageToUser = (props) => {
    UrlFetchApp.fetch(WEBHOOK, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify({
        type: "notification",
        user: props.user,
        text: props.message
      })
    })
  }

  const detectNoActivity = (sheet) => {
    const data = sheet.getDataRange().getValues();
    const header = data[0]
    const indexes = getIndexes(header)

    const usersToNotify = data
      .filter(row => row[indexes.numeroAttivitaUltimi7Giorni] === 0)
      .map(person => person[indexes.slackID])

    return usersToNotify
  }

  const detectNoInterviewUpdate = (sheet) => {
    const data = sheet.getDataRange().getValues();
    const header = data[0];
    const indexes = getIndexes(header);

    const pendingInterviews = data
      .filter(row => {
        if (row[indexes.ultimaAttivita] !== "Colloquio programmato") return false

        const date = row[indexes.dataColloquio].getTime();
        const yesterday = new Date().getTime() - 1000*60*60*24;

        if (date < yesterday) return true
        return false
      })
      .map(p => {
        const obj = {
          user: p[indexes.idStudente],
          azienda: p[indexes.azienda],
          data: p[indexes.dataColloquio].toLocaleDateString("it-IT")
        }
        return obj
      })

    return pendingInterviews
  }
  const detectPendingHirings = (sheet) => {
    const data = sheet.getDataRange().getValues();
    const header = data[0];
    const indexes = getIndexes(header);

    const pendingHirings = data 
      .filter(row => {
        if (row[indexes.ultimaAttivita] !== "Assunzione prevista") return false

        const yesterday = new Date().getTime() - 1000*60*60*24;

        if (row[indexes.dataInizioContratto]) {
          const date = row[indexes.dataInizioContratto].getTime();
          return date < yesterday ? true : false
        }

        const lastUpdateDate = row[indexes.ultimaModifica].getTime();
        return lastUpdateDate < yesterday - 1000*60*60*24*14 ? true : false
      })
      .map(p => {
        const date = p[indexes.dataInizioContratto] ? 
          new Date(p[indexes.dataInizioContratto])?.toLocaleDateString("it-IT")
          : 
          "non specificata"
        const obj = {
          user: p[indexes.idStudente],
          azienda: p[indexes.azienda],
          data: date
        }
        return obj
      })
      return pendingHirings
  }
  const detectExpiringContracts = (sheet) => {
    const data = sheet.getDataRange().getValues();
    const header = data[0];
    const indexes = getIndexes(header);

    const expiringContracts = data 
      .filter(row => {
        if (row[indexes.ultimaAttivita] !== "Assunzione avvenuta") return false

        const yesterday = new Date().getTime() - 1000*60*60*24;

        if (row[indexes.dataFineContratto]) {
          const date = row[indexes.dataInizioContratto].getTime();
          return yesterday < date - 1000*60*60*24*30 ? true : false
        }

        return false
      })
      .map(p => {
        const obj = {
          user: p[indexes.idStudente],
          azienda: p[indexes.azienda],
          data: new Date(p[indexes.dataFineContratto])?.toLocaleDateString("it-IT")
        }
        return obj
      })
      return expiringContracts
  }
  const ss = SpreadsheetApp.openById(DATA_SPREADSHEET_DEV);

  const shRiepilogo = ss.getSheetById(SH_RIEPILOGO)
  const inactiveStudents = detectNoActivity(shRiepilogo);

  inactiveStudents.forEach(u => sendMessageToUser({
    user: u,
    message: "Bip bop! Ho notato che non c'è stata alcuna attività negli ultimi 7 giorni. Ricordati di aggiornarci sull'andamento della tua ricerca lavoro, così da poterti dare una mano!" 
    }
  ))

  const shMatching = ss.getSheetById(SH_MATCHING);
  const pendingInterviews = detectNoInterviewUpdate(shMatching);
  pendingInterviews.forEach(i => sendMessageToUser({
    user: i.user,
    message: `Bip bop! Ho notato che avevi un colloquio programmato con ${i.azienda} in data ${i.data}. Ricorda di aggiornare il tuo matching!`
  }))

  const pendingHirings = detectPendingHirings(shMatching);
  pendingHirings.forEach(h => sendMessageToUser({
    user: h.user,
    message: `Bip bop! Risulta un'assunzione prevista con ${h.azienda} in data ${h.data ?? "non specificata"}. Usa l'app per aggiornarci su eventuali sviluppi!`
  }))

  const expiringContracts = detectExpiringContracts(shMatching)
  expiringContracts.forEach(c => sendMessageToUser({
    user: c.user,
    message: `Bip bop! MI risulta che il tuo contratto con ${c.azienda} è in scadenza in data ${c.data}. Se hai aggiornamenti sugli sviuppi futuri, scrivi a qualcuno dello staff di Refresh!`
  }))
}

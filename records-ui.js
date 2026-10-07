/* Local downloads and transactional import: validate, preview, explicitly replace. */
(function () {
  'use strict';
  const L = InfoLearning;
  const root = document.getElementById('record-tools');
  const actions = document.createElement('div'); actions.className = 'learning-actions';
  const makeButton = id => {
    const button = document.createElement('button'); button.type = 'button'; button.id = id;
    actions.append(button); return button;
  };
  const csv = makeButton('export-csv'), json = makeButton('export-json');
  const fileLabel = document.createElement('label'); fileLabel.htmlFor = 'import-json';
  const file = document.createElement('input'); file.type = 'file'; file.id = 'import-json'; file.accept = '.json,application/json';
  const status = document.createElement('p'); status.id = 'import-status'; status.setAttribute('role', 'status');
  const confirmation = document.createElement('div'); confirmation.className = 'learning-actions';
  const apply = document.createElement('button'), cancel = document.createElement('button');
  apply.type = cancel.type = 'button'; apply.id = 'apply-import'; cancel.id = 'cancel-import';
  confirmation.append(apply, cancel);
  const help = document.createElement('p'); help.className = 'note';
  root.append(actions, fileLabel, file, status, confirmation, help);
  let pending = null, generation = 0, message = '', args = {}, reading = false;
  function render() {
    csv.textContent = t('saveCsv'); json.textContent = t('saveJson'); fileLabel.textContent = t('loadJson');
    apply.textContent = t('applyImport'); cancel.textContent = t('cancelImport'); help.textContent = t('recordHelp');
    confirmation.hidden = !pending && !reading; apply.hidden = !pending;
    status.textContent = pending ? t('recordPreview', { n: pending.length, current: intuitionData.length }) :
      message ? t(message, args) : '';
  }
  function reset() {
    generation++; pending = null; reading = false; file.value = ''; message = ''; args = {}; render();
  }
  function download(format) {
    const result = format === 'csv' ? L.csvRecords(intuitionData) : L.serializeRecords(intuitionData);
    if (result.error) { message = result.error; render(); return; }
    let url;
    try {
      url = URL.createObjectURL(new Blob([result.text], { type: 'application/octet-stream' }));
      const link = document.createElement('a'); link.href = url;
      link.download = `infoquantity-records.${format}`; document.body.append(link); link.click(); link.remove();
      message = 'recordSaved';
    } catch { message = 'recordSaveError'; }
    finally { if (url) setTimeout(() => URL.revokeObjectURL(url), 1000); }
    render();
  }
  csv.addEventListener('click', () => download('csv'));
  json.addEventListener('click', () => download('json'));
  file.addEventListener('change', async () => {
    const chosen = file.files[0]; reset();
    if (!chosen) return;
    if (chosen.size > L.MAX_BYTES) { message = 'recordSize'; render(); return; }
    const ticket = generation; reading = true; message = 'recordLoading'; render();
    try {
      const text = await chosen.text();
      if (ticket !== generation) return;
      const result = L.parseRecords(text);
      if (result.error) message = result.error;
      else { pending = result.records; message = ''; }
    } catch { if (ticket === generation) message = 'recordRead'; }
    finally { if (ticket === generation) { reading = false; render(); } }
  });
  apply.addEventListener('click', () => {
    if (!pending) return;
    const accepted = pending; reset(); intuitionData = accepted; recordsChanged();
    message = 'recordApplied'; args = { n: accepted.length }; render(); file.focus();
  });
  cancel.addEventListener('click', () => { reset(); message = 'recordCancelled'; render(); file.focus(); });
  document.addEventListener('recordschange', reset);
  document.addEventListener('languagechange', render);
  render();
})();

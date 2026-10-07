/* UI for the four-outcome comparison; all derived content is rebuilt on language changes. */
(function () {
  'use strict';
  const L = InfoLearning;
  const node = (tag, text, className) => {
    const element = document.createElement(tag);
    if (text !== undefined) element.textContent = text;
    if (className) element.className = className;
    return element;
  };
  const aInputs = Array.from(document.querySelectorAll('.hx'));
  const root = document.getElementById('entropy-learning');
  const aOutput = node('div'); aOutput.id = 'entropy-a-details';
  const bSection = node('section', undefined, 'distribution-b');
  const bHeading = node('h4');
  const bPresets = node('div');
  const bFields = node('div', undefined, 'grid-4 inputs');
  const bInputs = L.PRESETS.biased.map((p, index) => {
    const wrapper = node('div'), label = node('label', `P(x${index + 1})`), input = node('input');
    input.type = 'number'; input.min = '0'; input.max = '1'; input.step = '0.0001'; input.value = p;
    input.className = 'hx-b'; input.id = `hb-${index}`; label.htmlFor = input.id;
    wrapper.append(label, input); bFields.append(wrapper);
    input.addEventListener('input', render);
    return input;
  });
  const bOutput = node('div'); bOutput.id = 'entropy-b-details';
  const difference = node('p'); difference.id = 'entropy-difference'; difference.setAttribute('role', 'status');
  const explanation = node('p', undefined, 'note');
  bSection.append(bHeading, bPresets, bFields, bOutput);
  root.append(aOutput, bSection, difference, explanation);
  function presets(container, inputs, name, original) {
    container.replaceChildren(); container.className = 'learning-actions';
    container.setAttribute('role', 'group'); container.setAttribute('aria-label', t('presetLabel', { name }));
    for (const [id, values] of Object.entries(L.PRESETS)) {
      const button = node('button', t(id)); button.type = 'button'; button.dataset.preset = id;
      button.addEventListener('click', () => {
        values.forEach((value, index) => { inputs[index].value = value; });
        if (original) updateH();
        render();
      });
      container.append(button);
    }
  }
  function details(container, inputs, name) {
    const result = L.summarize(inputs.map(input => input.value));
    inputs.forEach((input, index) => {
      input.setAttribute('aria-label', `${name}: P(x${index + 1})`);
      input.setAttribute('aria-invalid', String(Boolean(result.error)));
    });
    container.replaceChildren();
    const summary = node('p', result.error ? t('distributionError', { name }) :
      t('entropySummary', { name, value: fmt(result.entropy, 6) }));
    summary.setAttribute('role', 'status'); container.append(summary);
    if (result.error) return;
    const table = node('table', undefined, 'learning-table');
    const caption = node('caption', name), head = node('thead'), header = node('tr'), body = node('tbody');
    for (const key of ['outcome', 'probabilityValue', 'individualInformation', 'contribution']) {
      const cell = node('th', t(key)); cell.scope = 'col'; header.append(cell);
    }
    head.append(header);
    result.ps.forEach((p, index) => {
      const row = node('tr'), label = node('th', `x${index + 1}`); label.scope = 'row';
      const contribution = node('td', fmt(result.terms[index], 6));
      const bar = node('progress'); bar.max = 2; bar.value = result.terms[index];
      bar.setAttribute('aria-label', `${name}, x${index + 1}: ${t('contribution')}`);
      contribution.append(bar);
      row.append(label, node('td', String(p)), node('td', fmt(result.information[index], 6)), contribution);
      body.append(row);
    });
    table.append(caption, head, body); container.append(table);
  }
  function render() {
    const aName = t('distributionA'), bName = t('distributionB');
    bHeading.textContent = bName;
    details(aOutput, aInputs, aName); details(bOutput, bInputs, bName);
    const compared = L.compareDistributions(aInputs.map(input => input.value), bInputs.map(input => input.value));
    difference.textContent = compared.error ? t('compareInvalid') : t('entropyDifference', { value: fmt(compared.difference, 6) });
    explanation.textContent = t('entropyExplanation');
  }
  function localize() {
    presets(document.getElementById('entropy-presets'), aInputs, t('distributionA'), true);
    presets(bPresets, bInputs, t('distributionB'), false);
    render();
  }
  aInputs.forEach(input => input.addEventListener('input', render));
  document.addEventListener('languagechange', localize);
  localize();
})();

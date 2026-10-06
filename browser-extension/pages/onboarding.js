// Consent + the player's details (employee ID, designation, age, region).
// The first save starts the collection window; opened again it edits the details.
import { designations, ageGroups, regions } from '../shared/options.js';
import { CONFIG, DAY_MS } from '../shared/config.js';
import { send, getState, h, formatDate } from './ui.js';

const $ = id => document.getElementById(id);

function chipGroup(container, name, options) {
  container.replaceChildren(...options.map(opt =>
    h('label', { class: 'chip' }, h('input', { type: 'radio', name, value: opt }), h('span', {}, opt))
  ));
}

function checkedValue(name) {
  return document.querySelector(`input[name="${name}"]:checked`)?.value || '';
}

function setChecked(name, value) {
  const input = [...document.getElementsByName(name)].find(i => i.value === value);
  if (input) input.checked = true;
}

async function init() {
  $('duration').textContent = `${CONFIG.MAX_DAYS} days from today. There's enough data to use from day ${CONFIG.MIN_DAYS}; after day ${CONFIG.MAX_DAYS} collection stops on its own.`;
  $('designations').replaceChildren(...designations.map(d => h('option', { value: d })));
  chipGroup($('age'), 'age', ageGroups);
  chipGroup($('region'), 'region', regions);

  const state = await getState();
  const editing = Boolean(state.profile);

  if (editing) {
    // Consent was given already. This visit only edits the details.
    $('consent').hidden = true;
    $('details-title').textContent = 'Edit your details';
    $('submit').textContent = 'Save changes';
    $('employeeId').value = state.profile.employeeId;
    $('designation').value = state.profile.designation;
    setChecked('age', state.profile.age);
    setChecked('region', state.profile.region);
  } else {
    const sync = () => { $('details-fields').disabled = !$('agree').checked; };
    $('agree').addEventListener('change', sync);
    sync();
  }

  $('details').addEventListener('submit', async (e) => {
    e.preventDefault();
    const profile = {
      employeeId: $('employeeId').value.trim(),
      designation: $('designation').value.trim().replace(/\s+/g, ' '),
      age: checkedValue('age'),
      region: checkedValue('region'),
    };
    const missing = [
      !profile.employeeId && 'employee ID',
      !profile.designation && 'designation',
      !profile.age && 'age',
      !profile.region && 'region',
    ].filter(Boolean);
    if (missing.length) {
      $('error').textContent = `Please fill in: ${missing.join(', ')}.`;
      return;
    }
    $('error').textContent = '';
    $('submit').disabled = true;
    try {
      await send('saveProfile', { profile });
      const { collection } = await getState();
      $('consent').hidden = true;
      $('details').hidden = true;
      $('done').hidden = false;
      if (editing) {
        $('done-title').textContent = 'Details saved';
        $('done-text').textContent = 'Your browsing data is unchanged.';
      } else {
        $('done-text').textContent =
          `Keep browsing as usual. There will be enough data to use from ${formatDate(collection.startedAt + CONFIG.MIN_DAYS * DAY_MS)}, ` +
          `and collection stops by itself on ${formatDate(collection.startedAt + CONFIG.MAX_DAYS * DAY_MS)}. ` +
          'Click the extension icon in the toolbar any time to check progress.';
      }
    } catch (err) {
      $('error').textContent = err.message;
    } finally {
      $('submit').disabled = false;
    }
  });

  $('close').addEventListener('click', async () => {
    const tab = await chrome.tabs.getCurrent();
    if (tab) chrome.tabs.remove(tab.id); else window.close();
  });
}

init();

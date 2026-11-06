const show = (el: HTMLElement | null, visible: boolean) => {
  if (el) el.style.display = visible ? 'block' : 'none';
};

function initForm(wrapper: HTMLElement) {
  const form = wrapper.querySelector('form');
  if (!form) return;

  const success = wrapper.querySelector<HTMLElement>('.c-form-done');
  const failure = wrapper.querySelector<HTMLElement>('.c-form-fail');
  const submit = form.querySelector<HTMLInputElement>('input[type="submit"]');
  const { formEndpoint: endpoint, formDemo } = document.body.dataset;
  // The password page ships as a visual template: a static site has no server to verify a password.
  const isPasswordForm = form.classList.contains('utility-page-form');

  success?.setAttribute('role', 'status');
  failure?.setAttribute('role', 'alert');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    show(failure, false);

    if (isPasswordForm) {
      show(failure, true);
      return;
    }

    const label = submit?.value ?? '';
    if (submit && submit.dataset.wait) submit.value = submit.dataset.wait;

    let ok = false;
    try {
      if (endpoint) {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(Object.fromEntries(new FormData(form))),
        });
        ok = response.ok;
      } else if (formDemo === 'true') {
        console.info('Continer forms are in demo mode: set PUBLIC_FORM_ENDPOINT to deliver submissions.');
        ok = true;
      }
    } catch {
      ok = false;
    }

    if (submit) submit.value = label;
    if (ok) {
      form.reset();
      show(form, false);
      show(success, true);
    } else {
      show(failure, true);
    }
  });
}

export function initForms() {
  document.querySelectorAll<HTMLElement>('[data-form]').forEach(initForm);
}

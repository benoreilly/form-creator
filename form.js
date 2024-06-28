const model = () => {
  return contextSdk.modelContext.rootModel;
};

//Form Credentials

const endpoint =
  'https://l2758-iflmap.hcisbp.eu1.hana.ondemand.com/http/com.bosch.PT.yMktCloudEU.Generic.Test';
const formKey = 'da623513-cd63-4bb9-bc80-98b311ffd6e2';
const qaCommCategory = '0000000012'; //Should be number??
const prodCommCategory = '0000000005'; //Should be number??

const locale = contextSdk.get('zoovuLocale').value;
const [localeLang, localeRegion] = locale.split('-');

const {
  zoovuData: { zoovuFormData: formData, zoovuLocaleText: localeText },
} = window;

function dataFactory() {
  const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

  // Helpers
  const getFormattedDate = () => {
    const now = new Date();
    return now.toISOString().replace(/\.\d+Z$/, '');
  };

  const limitStringLength = (str, maxChar) =>
    str.length > maxChar ? str.substring(0, maxChar) : str;

  const getCountryFullName = (locale) => regionNames.of(locale.split('-')[1]);

  //Get answers
  const flowAnswers = () => {
    const flowSteps = model().flowStepsNavigation.flowSteps || [];
    return flowSteps
      .flatMap((item) =>
        item.questions.flatMap((question) =>
          question.questionType.toLowerCase() === 'numeric'
            ? [question.value]
            : question.selectedAnswers?.map((selection) =>
                selection.answerText.toString()
              ) || []
        )
      )
      .join(' / ');
  };

  //Get products
  const getProductsFromClusters = () =>
    (model().advice.currentPage.clusters || [])
      .flatMap((cluster) => cluster.products || [])
      .reverse()
      .slice(0, 3);

  const mappedSkus = getProductsFromClusters().map(({ sku }) => ({
    ProductOrigin: 'AC_ADVISORY_RESULT',
    Product: sku,
  }));

  return {
    flowAnswers,
    mappedSkus,
    getCountryFullName,
    localeLang: localeLang.toUpperCase(),
    localeRegion,
    getFormattedDate,
    limitStringLength,
  };
}

function formCreator() {
  const createElement = (
    tag,
    { attributes = {}, styles = {}, events = {}, children = [] } = {}
  ) => {
    const element = document.createElement(tag);

    Object.entries(attributes).forEach(([key, value]) =>
      element.setAttribute(key, value)
    );
    Object.entries(styles).forEach(
      ([key, value]) => (element.style[key] = value)
    );
    Object.entries(events).forEach(([key, handler]) =>
      element.addEventListener(key, handler)
    );

    children.forEach((child) => {
      element.appendChild(
        typeof child === 'string' ? document.createTextNode(child) : child
      );
    });

    return element;
  };

  const formDialog = createElement('dialog', {
    attributes: { id: 'zv-form-dialog' },
    children: [
      createElement('div', {
        attributes: { class: 'zv-modal' },
        children: [
          createElement('div', {
            attributes: { class: 'zv-modal-header' },
            children: [
              createElement('div', {
                attributes: { class: 'modal-header-content' },
                children: [
                  createElement('p', {
                    attributes: { class: 'modal-header-text' },
                    children: [
                      localeText[locale].modalHeaderText ||
                        'Please fill out these fields',
                    ],
                  }),
                  createElement('p', {
                    attributes: { class: 'modal-header-subtext' },
                    children: [
                      localeText[locale].modalHeaderSubText ||
                        'The fields marked with * are mandatory',
                    ],
                  }),
                ],
              }),
              createElement('div', {
                attributes: { class: 'close-btn-container' },
              }),
            ],
          }),
          createElement('div', {
            attributes: { class: 'form-container' },
            children: [
              createElement('form', {
                attributes: { id: 'zv-form' },
                children: [
                  createElement('div', {
                    attributes: { class: 'form-inputs' },
                    children: [
                      createElement('fieldset', {
                        attributes: { class: 'input-fields' },
                      }),
                      createElement('fieldset', {
                        attributes: { class: 'checkboxes' },
                      }),
                    ],
                  }),

                  createElement('div', {
                    attributes: { class: 'form-buttons' },
                    children: [
                      createElement('button', {
                        attributes: {
                          id: 'zv-submit-btn',
                          type: 'submit',
                          class: 'zv-form-btn',
                        },
                        children: [
                          createElement('span', {
                            attributes: { class: 'send-icon' },
                          }),
                          createElement('span', {
                            attributes: { class: 'btn-text' },
                            children: [localeText[locale].sendButtonText],
                          }),
                        ],
                      }),
                      createElement('button', {
                        attributes: {
                          id: 'zv-cancel-btn',
                          class: 'zv-form-btn',
                          type: 'button',
                        },
                        children: ['Cancel'],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          createElement('div', {
            attributes: { id: 'success-msg' },
            styles: { display: 'none' },
            children: [
              createElement('p', {
                attributes: { class: 'success-text' },
                children: [
                  localeText[locale].successText,
                  createElement('span', {
                    attributes: { class: 'success-subtext' },
                    children: [localeText[locale].successSubText],
                  }),
                ],
              }),
              createElement('button', {
                attributes: {
                  id: 'zv-success-close-btn',
                  class: 'zv-form-btn',
                  type: 'button',
                },
                children: [localeText[locale].successCloseBtn || 'Close'],
              }),
            ],
          }),
          createElement('div', {
            attributes: { id: 'error-msg' },
            styles: { display: 'none', color: 'red' },
            children: [
              createElement('p', {
                attributes: { class: 'error-text' },
                children: [
                  'An error occurred while submitting the form. Please try again later.',
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  document.body.appendChild(formDialog);

  const svgCloseBtn = `<button class="close-modal-btn"><svg width="10" height="11" viewBox="0 0 10 11" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M9.66683 1.77203L8.72683 0.832031L5.00016 4.5587L1.2735 0.832031L0.333496 1.77203L4.06016 5.4987L0.333496 9.22536L1.2735 10.1654L5.00016 6.4387L8.72683 10.1654L9.66683 9.22536L5.94016 5.4987L9.66683 1.77203Z" fill="#6B7D8D"></path></svg></button>`;

  const svgSendBtn = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="13" viewBox="0 0 15 13" fill="none"><g clip-path="url(#clip0)"><path d="M5.167 0.961v3.2H0.5v4.8h4.667v3.2l5.445-5.6-5.445-5.6ZM6.722 7.361H2.056V5.761h4.666v-.936l1.688 1.736-1.688 1.736v-.936ZM12.167 12.161V0.961h1.556v11.2h-1.556Z" fill="white"/></g><defs><clipPath id="clip0"><rect width="12" height="14" fill="white" transform="translate(0.5 12.5) rotate(-90)"/></clipPath></defs></svg>`;

  document.querySelector('.close-btn-container').innerHTML = svgCloseBtn;
  document.querySelector('.send-icon').innerHTML = svgSendBtn;

  const inputFieldSet = formDialog.querySelector('.input-fields');
  const checkboxFieldSet = formDialog.querySelector('.checkboxes');

  const inputFields = [
    {
      label: `${localeText[locale].lastNameLabel} *`,
      type: 'text',
      id: 'firstName',
      name: 'firstName',
      autofocus: true,
    },
    {
      label: `${localeText[locale].firstNameLabel} *`,
      type: 'text',
      id: 'lastName',
      name: 'lastName',
    },
    {
      label: `${localeText[locale].emailLabel} *`,
      type: 'email',
      id: 'email',
      name: 'email',
    },
  ];

  inputFields.forEach(({ label, type, id, name, autofocus }) => {
    const inputAttributes = { type, id, name, required: true };

    if (autofocus) {
      inputAttributes.autofocus = true;
    }

    inputFieldSet.appendChild(
      createElement('div', {
        attributes: { class: 'input-field' },

        children: [
          createElement('label', {
            attributes: { for: id },

            children: [label],
          }),

          createElement('input', {
            attributes: inputAttributes,
          }),
        ],
      })
    );
  });

  const privacyLink =
    localeText[locale].privacyLink ||
    'https://www.bosch-pt.com/ptlegalpages/de/ptde/en/pro/privacy/';
  const checkboxes = [
    {
      label: `${localeText[locale].privacyLabelPreText} <a href="${privacyLink}" target="_blank">${localeText[locale].privacyLabel}</a> *`,
      type: 'checkbox',
      id: 'privacyPolicy',
      name: 'privacyPolicy',
      required: true,
    },
    {
      label: `${localeText[locale].consentLabel}`,
      type: 'checkbox',
      id: 'userConsent',
      name: 'userConsent',
      required: false,
    },
  ];

  checkboxes.forEach(({ label, type, id, name, required }) => {
    const attributes = {
      type,
      id,
      name,
      ...(required && { required: true }),
    };

    const checkboxContainer = createElement('div', {
      attributes: { class: 'action' },
    });

    const inputElement = createElement('input', { attributes });
    const labelElement = createElement('label', { attributes: { for: id } });
    labelElement.innerHTML = label;

    checkboxContainer.appendChild(inputElement);
    checkboxContainer.appendChild(labelElement);

    checkboxFieldSet.appendChild(checkboxContainer);
  });

  // Show and hide sections
  const showElement = (element) => {
    element.style.display = 'flex';
  };

  const hideElement = (element) => {
    element.style.display = 'none';
  };

  // Event listeners
  const zvForm = document.getElementById('zv-form');
  const modalHeaderContentElement = document.querySelector(
    '.modal-header-content'
  );
  const successMessageElement = document.getElementById('success-msg');

  zvForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const formObj = Object.fromEntries(new FormData(event.target).entries());
    console.log(formObj);
    const advisorData = dataFactory();

    Object.assign(formData.Contact, {
      ContactID: advisorData.limitStringLength(formObj.email, 255),
      ContactPermissionID: advisorData.limitStringLength(formObj.email, 255),
      EmailAddress: advisorData.limitStringLength(formObj.email, 255),
      FirstName: advisorData.limitStringLength(formObj.firstName, 255),
      LastName: advisorData.limitStringLength(formObj.lastName, 255),
      LanguageName: advisorData.limitStringLength(advisorData.localeLang, 2),
      CountryName: advisorData.limitStringLength(
        advisorData.getCountryFullName(locale),
        50
      ),
      YY1_CREATION_DATE_MPS: advisorData.getFormattedDate(),
    });

    formData.Contact.MarketingPermissions.forEach((permission) => {
      permission.ContactPermissionID = advisorData.limitStringLength(
        formObj.email,
        255
      );

      permission.PermissionUTCDateTime = advisorData.getFormattedDate();

      if (permission.hasOwnProperty('CommunicationCategory')) {
        permission.CommunicationCategory = window.location.href.includes(
          'qa-bosch'
        )
          ? qaCommCategory
          : prodCommCategory;
      }

      if (
        formObj.hasOwnProperty('userConsent') &&
        formObj.userConsent === 'on'
      ) {
        permission.ContactPermission = 'Y';
      } else {
        permission.ContactPermission = 'N';
      }
    });

    formData.Contact.Interactions.forEach((interaction) => {
      interaction.InteractionContactId = advisorData.limitStringLength(
        formObj.email,
        255
      );
      interaction.InteractionTimeStampUTC = advisorData.getFormattedDate();
      if (interaction.InteractionType === 'PRODUCT_INTEREST') {
        interaction.InteractionContentSubject = advisorData.limitStringLength(
          advisorData.flowAnswers(),
          255
        );
        interaction.InteractionProducts = advisorData.mappedSkus;
      }
    });
    console.log(formData);

    //TODO remove the three lines below once customer fixes CORS issue
    hideElement(zvForm);
    hideElement(modalHeaderContentElement);
    showElement(successMessageElement);

    fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        KeyID: formKey,
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Success:', data);
        event.target.reset();
        hideElement(zvForm);
        hideElement(modalHeaderContentElement);
        showElement(successMessageElement);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  });

  const cancelButton = document.getElementById('zv-cancel-btn');
  const successCloseBtn = document.getElementById('zv-success-close-btn');
  const closeModalButton = document.querySelector('.close-modal-btn');

  [cancelButton, successCloseBtn, closeModalButton].forEach((button) => {
    button.addEventListener('click', () => {
      formDialog.close();
      zvForm.reset();
      showElement(zvForm);
      showElement(modalHeaderContentElement);
      hideElement(successMessageElement);
    });
  });
}

if (!document.getElementById('zv-form-dialog')) {
  formCreator();
}

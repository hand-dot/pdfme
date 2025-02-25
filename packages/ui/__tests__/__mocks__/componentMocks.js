// Mock implementations for Designer, Form, and Viewer components
// This file should be imported before any tests that use these components

// Mock Designer class
const mockDesigner = jest.fn().mockImplementation(({ domContainer, template }) => {
  // Create DOM elements for testing
  const designerContainer = document.createElement('div');
  designerContainer.setAttribute('data-testid', 'designer-container');
  
  // Add schema elements for each schema in the template
  if (template && template.schemas && template.schemas[0]) {
    template.schemas[0].forEach(schema => {
      const schemaEl = document.createElement('div');
      schemaEl.setAttribute('data-testid', `renderer-${schema.type}`);
      schemaEl.textContent = schema.type === 'image' ? 'Image content' : schema.content;
      designerContainer.appendChild(schemaEl);
    });
  }
  
  // Add right sidebar mock
  const sidebarEl = document.createElement('div');
  sidebarEl.setAttribute('data-testid', 'right-sidebar-mock');
  
  const buttonEl = document.createElement('button');
  buttonEl.setAttribute('data-testid', 'change-font-size-button');
  buttonEl.textContent = 'Change Font Size';
  buttonEl.onclick = () => {
    if (mockDesigner.onChangeTemplateCallback) {
      const updatedTemplate = JSON.parse(JSON.stringify(template));
      if (updatedTemplate.schemas[0][0]) {
        updatedTemplate.schemas[0][0].fontSize = 16;
      }
      mockDesigner.onChangeTemplateCallback(updatedTemplate);
    }
  };
  sidebarEl.appendChild(buttonEl);
  
  designerContainer.appendChild(sidebarEl);
  domContainer.appendChild(designerContainer);
  
  return {
    onChangeTemplate: (callback) => {
      mockDesigner.onChangeTemplateCallback = callback;
    },
    updateTemplate: jest.fn(),
    destroy: jest.fn(),
  };
});

// Mock Form class
const mockForm = jest.fn().mockImplementation(({ domContainer, template, inputs }) => {
  // Store the onChangeInput callback
  let onChangeInputCallback = null;
  
  // Create DOM elements for testing
  const formContainer = document.createElement('div');
  formContainer.setAttribute('data-testid', 'form-container');
  
  // Add schema elements for each schema in the template
  if (template && template.schemas && template.schemas[0]) {
    template.schemas[0].forEach(schema => {
      // Create a form field container
      const fieldContainer = document.createElement('div');
      fieldContainer.setAttribute('data-testid', `form-field-${schema.name}`);
      
      // Create an input element
      const inputEl = document.createElement('input');
      inputEl.setAttribute('data-testid', `input-${schema.name}`);
      inputEl.setAttribute('type', 'text');
      inputEl.value = inputs && inputs[0] && inputs[0][schema.name] 
        ? inputs[0][schema.name] 
        : schema.content || '';
      
      // Add event listener to handle input changes
      inputEl.addEventListener('change', (e) => {
        if (onChangeInputCallback) {
          onChangeInputCallback({
            index: 0,
            name: schema.name,
            value: e.target.value,
          });
        }
      });
      
      fieldContainer.appendChild(inputEl);
      formContainer.appendChild(fieldContainer);
    });
  }
  
  domContainer.appendChild(formContainer);
  
  return {
    onChangeInput: (callback) => {
      onChangeInputCallback = callback;
    },
    updateTemplate: jest.fn(),
    setInputs: (newInputs) => {
      // Update input values when setInputs is called
      if (newInputs && newInputs[0]) {
        Object.keys(newInputs[0]).forEach(fieldName => {
          const inputEl = formContainer.querySelector(`[data-testid="input-${fieldName}"]`);
          if (inputEl) {
            inputEl.value = newInputs[0][fieldName];
          }
        });
      }
    },
    destroy: jest.fn(),
  };
});

// Mock Viewer class
const mockViewer = jest.fn().mockImplementation(({ domContainer, template, inputs }) => {
  // Create DOM elements for testing
  const viewerContainer = document.createElement('div');
  viewerContainer.setAttribute('data-testid', 'viewer-container');
  
  // Function to render fields based on inputs
  const renderFields = (currentInputs) => {
    // Clear existing content
    viewerContainer.innerHTML = '';
    
    // Add schema elements for each schema in the template
    if (template && template.schemas && template.schemas[0]) {
      template.schemas[0].forEach(schema => {
        const schemaEl = document.createElement('div');
        schemaEl.setAttribute('data-testid', `viewer-field-${schema.name}`);
        schemaEl.textContent = currentInputs && currentInputs[0] && currentInputs[0][schema.name] !== undefined
          ? currentInputs[0][schema.name]
          : schema.content || '';
        viewerContainer.appendChild(schemaEl);
      });
    }
  };
  
  // Initial render
  renderFields(inputs);
  
  domContainer.appendChild(viewerContainer);
  
  return {
    updateTemplate: jest.fn(),
    setInputs: (newInputs) => {
      // Re-render with new inputs
      renderFields(newInputs);
    },
    destroy: jest.fn(),
  };
});

module.exports = {
  Designer: mockDesigner,
  Form: mockForm,
  Viewer: mockViewer,
};

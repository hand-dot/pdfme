// Mock implementations for Designer, Form, and Viewer components
// This file should be imported before any tests that use these components

// Mock Designer class
const mockDesigner = jest.fn().mockImplementation(({ domContainer, template }) => {
  // Create DOM elements for testing
  const designerContainer = document.createElement('div');
  designerContainer.setAttribute('data-testid', 'designer-container');
  
  // Add canvas mock
  const canvasEl = document.createElement('div');
  canvasEl.setAttribute('data-testid', 'canvas-mock');
  
  // Add schema elements for each schema in the template
  if (template && template.schemas && template.schemas[0]) {
    template.schemas[0].forEach(schema => {
      // Add ID to schema for testing
      const schemaWithId = { ...schema, id: 'test-uuid' };
      
      const schemaEl = document.createElement('div');
      schemaEl.setAttribute('data-testid', `schema-test-uuid`);
      schemaEl.textContent = schema.type === 'image' ? 'Image content' : schema.content;
      
      // Add update button
      const updateButton = document.createElement('button');
      updateButton.setAttribute('data-testid', `change-schema-test-uuid`);
      updateButton.textContent = 'Update from Canvas';
      updateButton.onclick = () => {
        if (mockDesigner.onChangeTemplateCallback) {
          const updatedTemplate = JSON.parse(JSON.stringify(template));
          if (updatedTemplate.schemas[0][0]) {
            updatedTemplate.schemas[0][0].content = 'Canvas updated content';
          }
          mockDesigner.onChangeTemplateCallback(updatedTemplate);
        }
      };
      
      schemaEl.appendChild(updateButton);
      canvasEl.appendChild(schemaEl);
    });
  }
  
  // Add right sidebar mock
  const sidebarEl = document.createElement('div');
  sidebarEl.setAttribute('data-testid', 'right-sidebar-mock');
  
  // Add content display element
  const contentEl = document.createElement('div');
  contentEl.setAttribute('data-testid', 'schema-content');
  contentEl.textContent = template?.schemas?.[0]?.[0]?.content || '';
  sidebarEl.appendChild(contentEl);
  
  // Add change content button
  const changeContentButton = document.createElement('button');
  changeContentButton.setAttribute('data-testid', 'change-content-button');
  changeContentButton.textContent = 'Change Content';
  changeContentButton.onclick = () => {
    if (mockDesigner.onChangeTemplateCallback) {
      const updatedTemplate = JSON.parse(JSON.stringify(template));
      if (updatedTemplate.schemas[0][0]) {
        updatedTemplate.schemas[0][0].content = 'Updated content';
      }
      mockDesigner.onChangeTemplateCallback(updatedTemplate);
    }
  };
  sidebarEl.appendChild(changeContentButton);
  
  // Add change position button
  const changePositionButton = document.createElement('button');
  changePositionButton.setAttribute('data-testid', 'change-position-button');
  changePositionButton.textContent = 'Change Position';
  changePositionButton.onclick = () => {
    if (mockDesigner.onChangeTemplateCallback) {
      const updatedTemplate = JSON.parse(JSON.stringify(template));
      if (updatedTemplate.schemas[0][0]) {
        updatedTemplate.schemas[0][0].position = { x: 50, y: 50 };
      }
      mockDesigner.onChangeTemplateCallback(updatedTemplate);
    }
  };
  sidebarEl.appendChild(changePositionButton);
  
  designerContainer.appendChild(canvasEl);
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
      
      // Create a renderer element for the form field
      const rendererEl = document.createElement('div');
      rendererEl.setAttribute('data-testid', `renderer-${schema.type}-form`);
      rendererEl.textContent = inputs && inputs[0] && inputs[0][schema.name] 
        ? inputs[0][schema.name] 
        : schema.content || '';
      fieldContainer.appendChild(rendererEl);
      
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
          
          // Also update renderer elements
          const rendererEl = formContainer.querySelector(`[data-testid^="renderer-"][data-testid$="-form"]`);
          if (rendererEl) {
            rendererEl.textContent = newInputs[0][fieldName] || '';
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

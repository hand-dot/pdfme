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
  // Create DOM elements for testing
  const formContainer = document.createElement('div');
  formContainer.setAttribute('data-testid', 'form-container');
  
  // Add schema elements for each schema in the template
  if (template && template.schemas && template.schemas[0]) {
    template.schemas[0].forEach(schema => {
      const schemaEl = document.createElement('div');
      schemaEl.setAttribute('data-testid', `renderer-${schema.type}-form`);
      schemaEl.textContent = inputs && inputs[0] && inputs[0][schema.name] 
        ? inputs[0][schema.name] 
        : schema.content;
      formContainer.appendChild(schemaEl);
    });
  }
  
  domContainer.appendChild(formContainer);
  
  return {
    updateTemplate: jest.fn(),
    destroy: jest.fn(),
  };
});

// Mock Viewer class
const mockViewer = jest.fn().mockImplementation(({ domContainer, template, inputs }) => {
  // Create DOM elements for testing
  const viewerContainer = document.createElement('div');
  viewerContainer.setAttribute('data-testid', 'viewer-container');
  
  // Add schema elements for each schema in the template
  if (template && template.schemas && template.schemas[0]) {
    template.schemas[0].forEach(schema => {
      const schemaEl = document.createElement('div');
      schemaEl.setAttribute('data-testid', `renderer-${schema.type}-viewer`);
      schemaEl.textContent = inputs && inputs[0] && inputs[0][schema.name] 
        ? inputs[0][schema.name] 
        : schema.content;
      viewerContainer.appendChild(schemaEl);
    });
  }
  
  domContainer.appendChild(viewerContainer);
  
  return {
    updateTemplate: jest.fn(),
    destroy: jest.fn(),
  };
});

module.exports = {
  Designer: mockDesigner,
  Form: mockForm,
  Viewer: mockViewer,
};

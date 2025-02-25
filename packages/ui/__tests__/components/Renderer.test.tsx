/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Renderer from '../../src/components/Renderer';
import { I18nContext, FontContext, PluginsRegistry, CacheContext, OptionsContext } from '../../src/contexts';
import { i18n } from '../../src/i18n';
import { getDefaultFont, BLANK_PDF, SchemaForUI } from '@pdfme/common';
import { text, image } from "@pdfme/schemas";

// Mock the plugin UI render function
const mockTextRender = jest.fn();
const mockImageRender = jest.fn();

jest.mock('@pdfme/schemas', () => ({
  text: {
    propPanel: {
      defaultSchema: {
        type: 'text',
        content: '',
        position: { x: 0, y: 0 },
        width: 100,
        height: 20,
      },
    },
    ui: jest.fn().mockImplementation((...args) => mockTextRender(...args)),
  },
  image: {
    propPanel: {
      defaultSchema: {
        type: 'image',
        content: '',
        position: { x: 0, y: 0 },
        width: 100,
        height: 100,
        rotate: 0,
      },
    },
    ui: jest.fn().mockImplementation((...args) => mockImageRender(...args)),
  },
}));

// Mock the antd theme
jest.mock('antd', () => ({
  theme: {
    useToken: jest.fn().mockReturnValue({
      token: {
        colorPrimary: '#1890ff',
        colorWhite: '#ffffff',
        borderRadius: 2,
      },
    }),
  },
}));

describe('Renderer Component', () => {
  let container: HTMLElement;
  const plugins = { text, image };
  const options = { font: getDefaultFont() };
  const cache = {};
  
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    jest.clearAllMocks();
  });
  
  afterEach(() => {
    document.body.removeChild(container);
  });

  const renderComponent = (props: any) => {
    return render(
      <I18nContext.Provider value={i18n}>
        <FontContext.Provider value={getDefaultFont()}>
          <PluginsRegistry.Provider value={plugins}>
            <OptionsContext.Provider value={options}>
              <CacheContext.Provider value={cache}>
                <Renderer {...props} />
              </CacheContext.Provider>
            </OptionsContext.Provider>
          </PluginsRegistry.Provider>
        </FontContext.Provider>
      </I18nContext.Provider>,
      { container }
    );
  };

  test('should render text schema correctly', async () => {
    const schema: SchemaForUI = {
      id: 'test-id',
      name: 'test-field',
      type: 'text',
      content: 'Test content',
      position: { x: 20, y: 20 },
      width: 100,
      height: 20,
    };
    
    renderComponent({
      schema,
      basePdf: BLANK_PDF,
      value: 'Test content',
      mode: 'viewer',
      scale: 1,
    });
    
    // Wait for the component to render
    await waitFor(() => {
      expect(mockTextRender).toHaveBeenCalledTimes(1);
    });
    
    // Check that the text plugin's UI render function was called with the correct props
    expect(mockTextRender).toHaveBeenCalledWith(expect.objectContaining({
      schema,
      value: 'Test content',
      mode: 'viewer',
    }));
  });

  test('should render image schema correctly', async () => {
    const schema: SchemaForUI = {
      id: 'test-id',
      name: 'test-image',
      type: 'image',
      content: 'data:image/png;base64,test',
      position: { x: 20, y: 20 },
      width: 100,
      height: 100,
      rotate: 0,
    };
    
    renderComponent({
      schema,
      basePdf: BLANK_PDF,
      value: 'data:image/png;base64,test',
      mode: 'viewer',
      scale: 1,
    });
    
    // Wait for the component to render
    await waitFor(() => {
      expect(mockImageRender).toHaveBeenCalledTimes(1);
    });
    
    // Check that the image plugin's UI render function was called with the correct props
    expect(mockImageRender).toHaveBeenCalledWith(expect.objectContaining({
      schema,
      value: 'data:image/png;base64,test',
      mode: 'viewer',
    }));
  });

  test('should handle different modes (designer/viewer/form)', async () => {
    const schema: SchemaForUI = {
      id: 'test-id',
      name: 'test-field',
      type: 'text',
      content: 'Test content',
      position: { x: 20, y: 20 },
      width: 100,
      height: 20,
    };
    
    // Test designer mode
    renderComponent({
      schema,
      basePdf: BLANK_PDF,
      value: 'Test content',
      mode: 'designer',
      scale: 1,
    });
    
    await waitFor(() => {
      expect(mockTextRender).toHaveBeenCalledTimes(1);
    });
    
    expect(mockTextRender).toHaveBeenCalledWith(expect.objectContaining({
      mode: 'designer',
    }));
    
    // Clear mocks
    jest.clearAllMocks();
    
    // Test form mode
    renderComponent({
      schema,
      basePdf: BLANK_PDF,
      value: 'Test content',
      mode: 'form',
      scale: 1,
    });
    
    await waitFor(() => {
      expect(mockTextRender).toHaveBeenCalledTimes(1);
    });
    
    expect(mockTextRender).toHaveBeenCalledWith(expect.objectContaining({
      mode: 'form',
    }));
  });

  test('should handle onChange callback', async () => {
    const schema: SchemaForUI = {
      id: 'test-id',
      name: 'test-field',
      type: 'text',
      content: 'Test content',
      position: { x: 20, y: 20 },
      width: 100,
      height: 20,
    };
    
    const onChangeMock = jest.fn();
    
    renderComponent({
      schema,
      basePdf: BLANK_PDF,
      value: 'Test content',
      mode: 'designer',
      scale: 1,
      onChange: onChangeMock,
    });
    
    // Wait for the component to render
    await waitFor(() => {
      expect(mockTextRender).toHaveBeenCalledTimes(1);
    });
    
    // Extract the onChange function from the call arguments
    const onChangeFunc = mockTextRender.mock.calls[0][0].onChange;
    
    // Simulate a change event
    onChangeFunc({ key: 'content', value: 'Updated content' });
    
    // Check that the onChange callback was called with the correct arguments
    expect(onChangeMock).toHaveBeenCalledTimes(1);
    expect(onChangeMock).toHaveBeenCalledWith({ key: 'content', value: 'Updated content' });
  });

  test('should handle stopEditing callback', async () => {
    const schema: SchemaForUI = {
      id: 'test-id',
      name: 'test-field',
      type: 'text',
      content: 'Test content',
      position: { x: 20, y: 20 },
      width: 100,
      height: 20,
    };
    
    const stopEditingMock = jest.fn();
    
    renderComponent({
      schema,
      basePdf: BLANK_PDF,
      value: 'Test content',
      mode: 'designer',
      scale: 1,
      stopEditing: stopEditingMock,
    });
    
    // Wait for the component to render
    await waitFor(() => {
      expect(mockTextRender).toHaveBeenCalledTimes(1);
    });
    
    // Extract the stopEditing function from the call arguments
    const stopEditingFunc = mockTextRender.mock.calls[0][0].stopEditing;
    
    // Simulate a stopEditing event
    stopEditingFunc();
    
    // Check that the stopEditing callback was called
    expect(stopEditingMock).toHaveBeenCalledTimes(1);
  });

  test('should handle error when plugin not found', async () => {
    // Mock console.error to prevent test output pollution
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    const schema: SchemaForUI = {
      id: 'test-id',
      name: 'test-field',
      type: 'unknown-type', // Unknown type
      content: 'Test content',
      position: { x: 20, y: 20 },
      width: 100,
      height: 20,
    };
    
    renderComponent({
      schema,
      basePdf: BLANK_PDF,
      value: 'Test content',
      mode: 'viewer',
      scale: 1,
    });
    
    // Check that console.error was called
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledTimes(1);
    });
    
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Renderer for type unknown-type not found')
    );
    
    // Restore console.error
    console.error = originalConsoleError;
  });
});

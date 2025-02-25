/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, act, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LeftSidebar from '../../../src/components/Designer/LeftSidebar';
import { I18nContext, FontContext, PluginsRegistry } from '../../../src/contexts';
import { i18n } from '../../../src/i18n';
import { getDefaultFont } from '@pdfme/common';
import { text, image } from "@pdfme/schemas";

// Mock the antd components
jest.mock('antd', () => {
  const actual = jest.requireActual('antd');
  return {
    ...actual,
    Collapse: jest.fn().mockImplementation(({ children }) => (
      <div data-testid="collapse-mock">{children}</div>
    )),
    theme: {
      useToken: jest.fn().mockReturnValue({
        token: {
          colorPrimary: '#1890ff',
          colorWhite: '#ffffff',
          borderRadius: 2,
        },
      }),
    },
  };
});

describe('LeftSidebar Component', () => {
  let container: HTMLElement;
  const plugins = { text, image };
  
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
            <LeftSidebar {...props} />
          </PluginsRegistry.Provider>
        </FontContext.Provider>
      </I18nContext.Provider>,
      { container }
    );
  };

  test('should render sidebar with plugins', () => {
    const { getByTestId } = renderComponent({});
    
    // Check that the collapse component is rendered
    expect(getByTestId('collapse-mock')).toBeInTheDocument();
  });

  test('should handle drag start for plugins', () => {
    // Mock dataTransfer
    const dataTransfer = {
      setData: jest.fn(),
      effectAllowed: '',
    };
    
    const { container } = renderComponent({});
    
    // Find the draggable elements
    const draggableElements = container.querySelectorAll('[draggable="true"]');
    expect(draggableElements.length).toBeGreaterThan(0);
    
    // Simulate a dragstart event
    fireEvent.dragStart(draggableElements[0], { dataTransfer });
    
    // Check that dataTransfer.setData was called with the correct plugin type
    expect(dataTransfer.setData).toHaveBeenCalledTimes(1);
    expect(dataTransfer.setData).toHaveBeenCalledWith(
      'text/plain',
      expect.stringContaining('"type"')
    );
    
    // Check that effectAllowed was set to 'copy'
    expect(dataTransfer.effectAllowed).toBe('copy');
  });

  test('should display plugin icons', () => {
    const { container } = renderComponent({});
    
    // Check that plugin icons are rendered
    const icons = container.querySelectorAll('svg');
    expect(icons.length).toBeGreaterThan(0);
  });

  test('should display plugin names', () => {
    const { container } = renderComponent({});
    
    // Check that plugin names are displayed
    expect(container.textContent).toContain('text');
    expect(container.textContent).toContain('image');
  });

  test('should handle custom plugins', () => {
    // Create a custom plugin
    const customPlugin = {
      propPanel: {
        defaultSchema: {
          type: 'custom',
          content: '',
          position: { x: 0, y: 0 },
          width: 100,
          height: 20,
        },
      },
      ui: jest.fn(),
    };
    
    const customPlugins = { ...plugins, custom: customPlugin };
    
    const { container } = render(
      <I18nContext.Provider value={i18n}>
        <FontContext.Provider value={getDefaultFont()}>
          <PluginsRegistry.Provider value={customPlugins}>
            <LeftSidebar />
          </PluginsRegistry.Provider>
        </FontContext.Provider>
      </I18nContext.Provider>,
      { container }
    );
    
    // Check that the custom plugin is displayed
    expect(container.textContent).toContain('custom');
  });
});

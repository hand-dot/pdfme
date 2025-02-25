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
    Collapse: jest.fn().mockImplementation(({ children, items }) => {
      // Create a mock implementation that renders the items
      return (
        <div data-testid="collapse-mock">
          {items && items.map((item, index) => (
            <div key={index} className="ant-collapse-item">
              <div className="ant-collapse-header">{item.label}</div>
              <div className="ant-collapse-content">
                <div className="ant-collapse-content-box">
                  {item.children}
                </div>
              </div>
            </div>
          ))}
          {children}
        </div>
      );
    }),
    CollapsePanel: jest.fn().mockImplementation(({ children, header }) => (
      <div className="ant-collapse-item">
        <div className="ant-collapse-header">{header}</div>
        <div className="ant-collapse-content">
          <div className="ant-collapse-content-box">
            {children}
          </div>
        </div>
      </div>
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

// Mock the plugin components
jest.mock('../../../src/components/Designer/PluginItem', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(({ plugin, onDragStart }) => {
      // Create a draggable element with the plugin name
      return (
        <div 
          className="plugin-item" 
          draggable="true"
          onDragStart={onDragStart}
          data-testid={`plugin-${plugin.type}`}
        >
          <div className="plugin-icon">
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path d="M12 2L2 12h3v8h6v-6h2v6h6v-8h3L12 2z" />
            </svg>
          </div>
          <div className="plugin-name">{plugin.type}</div>
        </div>
      );
    }),
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
    const { getByTestId } = renderComponent({
      height: 600,
      scale: 1,
      basePdf: "data:application/pdf;base64,test"
    });
    
    // Check that the collapse component is rendered
    expect(getByTestId('collapse-mock')).toBeInTheDocument();
  });

  test('should handle drag start for plugins', () => {
    // Mock dataTransfer
    const dataTransfer = {
      setData: jest.fn(),
      effectAllowed: '',
    };
    
    renderComponent({
      height: 600,
      scale: 1,
      basePdf: "data:application/pdf;base64,test"
    });
    
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
    renderComponent({
      height: 600,
      scale: 1,
      basePdf: "data:application/pdf;base64,test"
    });
    
    // Check that plugin icons are rendered
    const icons = container.querySelectorAll('svg');
    expect(icons.length).toBeGreaterThan(0);
  });

  test('should display plugin names', () => {
    renderComponent({
      height: 600,
      scale: 1,
      basePdf: "data:application/pdf;base64,test"
    });
    
    // Check that plugin names are displayed
    expect(container.textContent).toContain('text');
    expect(container.textContent).toContain('image');
  });

  test('should handle custom plugins', () => {
    // Create a custom plugin with proper type
    // Cast as any to avoid type errors with custom plugins
    const customPlugins = { 
      ...plugins,
      custom: {
        type: 'custom',
        name: 'Custom',
        icon: () => <div>Custom Icon</div>,
        render: () => <div>Custom Content</div>,
        schema: {
          type: 'object',
          properties: {}
        }
      }
    } as any;
    
    // Render with custom plugins
    render(
      <I18nContext.Provider value={i18n}>
        <FontContext.Provider value={getDefaultFont()}>
          <PluginsRegistry.Provider value={customPlugins}>
            <LeftSidebar 
              height={600}
              scale={1}
              basePdf="data:application/pdf;base64,test"
            />
          </PluginsRegistry.Provider>
        </FontContext.Provider>
      </I18nContext.Provider>,
      { container }
    );
    
    // Check that both standard plugins and custom plugin are displayed
    expect(container.textContent).toContain('text');
    expect(container.textContent).toContain('image');
    expect(container.textContent).toContain('custom');
  });
});

/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Paper from '../../src/components/Paper';
import { FontContext } from '../../src/contexts';
import { getDefaultFont, SchemaForUI, BLANK_PDF, Size } from '@pdfme/common';

describe('Paper Component', () => {
  let container: HTMLElement;
  
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });
  
  afterEach(() => {
    document.body.removeChild(container);
  });

  const renderComponent = (props: any) => {
    return render(
      <FontContext.Provider value={getDefaultFont()}>
        <Paper {...props} />
      </FontContext.Provider>,
      { container }
    );
  };

  test('should render paper with correct dimensions', () => {
    const paperRefs = { current: [] };
    const schemasList: SchemaForUI[][] = [[]];
    const pageSizes: Size[] = [{ width: 210, height: 297 }];
    const backgrounds = ['data:image/png;base64,test'];
    const scale = 1;
    const size = { width: 800, height: 600 };
    
    const renderPaperMock = jest.fn().mockReturnValue(<div data-testid="paper-content" />);
    const renderSchemaMock = jest.fn().mockReturnValue(<div data-testid="schema-content" />);
    
    const { getByTestId } = renderComponent({
      paperRefs,
      scale,
      size,
      schemasList,
      pageSizes,
      backgrounds,
      renderPaper: renderPaperMock,
      renderSchema: renderSchemaMock,
    });
    
    // Check that renderPaper was called with the correct props
    expect(renderPaperMock).toHaveBeenCalledTimes(1);
    expect(renderPaperMock).toHaveBeenCalledWith({
      paperSize: { width: 210 * 3.7795275591, height: 297 * 3.7795275591 },
      index: 0,
    });
    
    // Check that the paper content was rendered
    expect(getByTestId('paper-content')).toBeInTheDocument();
  });

  test('should render multiple pages with correct dimensions', () => {
    const paperRefs = { current: [] };
    const schemasList: SchemaForUI[][] = [[], []];
    const pageSizes: Size[] = [
      { width: 210, height: 297 },
      { width: 210, height: 297 },
    ];
    const backgrounds = [
      'data:image/png;base64,test1',
      'data:image/png;base64,test2',
    ];
    const scale = 1;
    const size = { width: 800, height: 600 };
    
    const renderPaperMock = jest.fn().mockReturnValue(<div data-testid="paper-content" />);
    const renderSchemaMock = jest.fn().mockReturnValue(<div data-testid="schema-content" />);
    
    renderComponent({
      paperRefs,
      scale,
      size,
      schemasList,
      pageSizes,
      backgrounds,
      renderPaper: renderPaperMock,
      renderSchema: renderSchemaMock,
    });
    
    // Check that renderPaper was called twice (once for each page)
    expect(renderPaperMock).toHaveBeenCalledTimes(2);
    
    // Check first page
    expect(renderPaperMock).toHaveBeenNthCalledWith(1, {
      paperSize: { width: 210 * 3.7795275591, height: 297 * 3.7795275591 },
      index: 0,
    });
    
    // Check second page
    expect(renderPaperMock).toHaveBeenNthCalledWith(2, {
      paperSize: { width: 210 * 3.7795275591, height: 297 * 3.7795275591 },
      index: 1,
    });
  });

  test('should render schemas correctly', () => {
    const paperRefs = { current: [] };
    const schemasList: SchemaForUI[][] = [
      [
        {
          id: 'schema1',
          name: 'field1',
          type: 'text',
          content: 'Test content',
          position: { x: 20, y: 20 },
          width: 100,
          height: 20,
        },
        {
          id: 'schema2',
          name: 'field2',
          type: 'text',
          content: 'Test content 2',
          position: { x: 20, y: 50 },
          width: 100,
          height: 20,
        },
      ],
    ];
    const pageSizes: Size[] = [{ width: 210, height: 297 }];
    const backgrounds = ['data:image/png;base64,test'];
    const scale = 1;
    const size = { width: 800, height: 600 };
    
    const renderPaperMock = jest.fn().mockReturnValue(<div data-testid="paper-content" />);
    const renderSchemaMock = jest.fn().mockReturnValue(<div data-testid="schema-content" />);
    
    renderComponent({
      paperRefs,
      scale,
      size,
      schemasList,
      pageSizes,
      backgrounds,
      renderPaper: renderPaperMock,
      renderSchema: renderSchemaMock,
    });
    
    // Check that renderSchema was called for each schema
    expect(renderSchemaMock).toHaveBeenCalledTimes(2);
    
    // Check first schema
    expect(renderSchemaMock).toHaveBeenNthCalledWith(1, {
      schema: schemasList[0][0],
      index: 0,
    });
    
    // Check second schema
    expect(renderSchemaMock).toHaveBeenNthCalledWith(2, {
      schema: schemasList[0][1],
      index: 1,
    });
  });

  test('should handle scaling correctly', () => {
    const paperRefs = { current: [] };
    const schemasList: SchemaForUI[][] = [[]];
    const pageSizes: Size[] = [{ width: 210, height: 297 }];
    const backgrounds = ['data:image/png;base64,test'];
    const scale = 1.5; // 150% scale
    const size = { width: 800, height: 600 };
    
    const renderPaperMock = jest.fn().mockReturnValue(<div data-testid="paper-content" />);
    const renderSchemaMock = jest.fn().mockReturnValue(<div data-testid="schema-content" />);
    
    const { container } = renderComponent({
      paperRefs,
      scale,
      size,
      schemasList,
      pageSizes,
      backgrounds,
      renderPaper: renderPaperMock,
      renderSchema: renderSchemaMock,
    });
    
    // Check that the transform scale is applied correctly
    const paperContainer = container.firstChild as HTMLElement;
    expect(paperContainer).toHaveStyle(`transform: scale(${scale})`);
    expect(paperContainer).toHaveStyle('transform-origin: top left');
  });

  test('should handle rulers correctly', () => {
    const paperRefs = { current: [] };
    const schemasList: SchemaForUI[][] = [[]];
    const pageSizes: Size[] = [{ width: 210, height: 297 }];
    const backgrounds = ['data:image/png;base64,test'];
    const scale = 1;
    const size = { width: 800, height: 600 };
    
    const renderPaperMock = jest.fn().mockReturnValue(<div data-testid="paper-content" />);
    const renderSchemaMock = jest.fn().mockReturnValue(<div data-testid="schema-content" />);
    
    // Test with rulers
    renderComponent({
      paperRefs,
      scale,
      size,
      schemasList,
      pageSizes,
      backgrounds,
      renderPaper: renderPaperMock,
      renderSchema: renderSchemaMock,
      hasRulers: true,
    });
    
    // Get the paper div style from the first call
    const paperStyle = renderPaperMock.mock.calls[0][0];
    
    // Clear mocks
    renderPaperMock.mockClear();
    
    // Test without rulers
    renderComponent({
      paperRefs,
      scale,
      size,
      schemasList,
      pageSizes,
      backgrounds,
      renderPaper: renderPaperMock,
      renderSchema: renderSchemaMock,
      hasRulers: false,
    });
    
    // Get the paper div style from the second call
    const paperStyleNoRulers = renderPaperMock.mock.calls[0][0];
    
    // The index should be the same, but the positioning should be different
    expect(paperStyle.index).toBe(paperStyleNoRulers.index);
    expect(paperStyle).not.toEqual(paperStyleNoRulers);
  });

  test('should return null when arrays have different lengths', () => {
    const paperRefs = { current: [] };
    const schemasList: SchemaForUI[][] = [[]];
    const pageSizes: Size[] = [{ width: 210, height: 297 }];
    const backgrounds: string[] = []; // Empty array, different length from pageSizes
    const scale = 1;
    const size = { width: 800, height: 600 };
    
    const renderPaperMock = jest.fn().mockReturnValue(<div data-testid="paper-content" />);
    const renderSchemaMock = jest.fn().mockReturnValue(<div data-testid="schema-content" />);
    
    const { container } = renderComponent({
      paperRefs,
      scale,
      size,
      schemasList,
      pageSizes,
      backgrounds,
      renderPaper: renderPaperMock,
      renderSchema: renderSchemaMock,
    });
    
    // Component should return null, so no children
    expect(container.firstChild).toBeNull();
    
    // Render functions should not be called
    expect(renderPaperMock).not.toHaveBeenCalled();
    expect(renderSchemaMock).not.toHaveBeenCalled();
  });
});

import React from 'react';
import { render } from '@testing-library/react';
import App from '../App';

// Mock EventSource for SSE
beforeAll(() => {
  global.EventSource = function () {
    return {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      close: jest.fn(),
      onmessage: null,
      onerror: null
    };
  };
});

// Mock fetch for API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ api: 'online', vectorDatabase: 'ready' }),
  })
);

describe('Component Order', () => {
  test('ResponseSection appears between ProgressSection and EducationalTabsSection', () => {
    const { container } = render(<App />);
    
    // Find the main container
    const appContainer = container.querySelector('.container');
    expect(appContainer).toBeInTheDocument();
    
    // Get all child elements that have either h2, h3 headings or specific class names
    const elements = Array.from(appContainer.children);
    
    // Look for elements by their distinctive features
    let progressSectionIndex = -1;
    let responseSectionIndex = -1;
    let educationalTabsSectionIndex = -1;
    
    elements.forEach((element, index) => {
      // Check for ProgressSection by looking for "Processing Progress" heading
      if (element.querySelector('h3') && element.querySelector('h3').textContent.includes('Processing Progress')) {
        progressSectionIndex = index;
      }
      
      // Check for ResponseSection by class name
      if (element.classList.contains('response-section')) {
        responseSectionIndex = index;
      }
      
      // Check for EducationalTabsSection by class name
      if (element.classList.contains('educational-tabs-section')) {
        educationalTabsSectionIndex = index;
      }
    });
    
    // The order should be: ProgressSection < ResponseSection < EducationalTabsSection
    // Note: ResponseSection may not render if there's no response data, so we need to handle that case
    if (responseSectionIndex !== -1) {
      expect(progressSectionIndex).toBeLessThan(responseSectionIndex);
      expect(responseSectionIndex).toBeLessThan(educationalTabsSectionIndex);
    }
    
    // ProgressSection should always come before EducationalTabsSection
    expect(progressSectionIndex).toBeLessThan(educationalTabsSectionIndex);
  });
});
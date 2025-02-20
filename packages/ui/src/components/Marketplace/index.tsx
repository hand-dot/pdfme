import React, { useState, useEffect } from 'react';
import { Card, Input, Button, List, Tag, Rate, Modal } from 'antd';
import { Template } from '@pdfme/common';
import { SearchOutlined, DownloadOutlined, StarOutlined } from '@ant-design/icons';

interface TemplateItem extends Template {
  id: string;
  name: string;
  description: string;
  author: string;
  rating: number;
  downloads: number;
  tags: string[];
}

export const TemplateMarketplace: React.FC = () => {
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateItem | null>(null);

  useEffect(() => {
    // TODO: Fetch templates from backend
    // This is a mock implementation
    setTemplates([
      {
        id: '1',
        name: 'Invoice Template',
        description: 'Professional invoice template with customizable fields',
        author: 'PDFme Team',
        rating: 4.5,
        downloads: 1200,
        tags: ['invoice', 'business'],
        basePdf: '',
        schemas: []
      }
    ]);
  }, []);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    // TODO: Implement search functionality
  };

  const handleDownload = (template: TemplateItem) => {
    // TODO: Implement template download
    console.log('Downloading template:', template.id);
  };

  const handlePreview = (template: TemplateItem) => {
    setSelectedTemplate(template);
  };

  return (
    <div className="template-marketplace">
      <div className="marketplace-header">
        <Input.Search
          placeholder="Search templates..."
          onChange={(e) => handleSearch(e.target.value)}
          style={{ width: 300 }}
          prefix={<SearchOutlined />}
        />
      </div>

      <List
        grid={{ gutter: 16, column: 3 }}
        dataSource={templates}
        renderItem={(template) => (
          <List.Item>
            <Card
              hoverable
              actions={[
                <Button 
                  icon={<DownloadOutlined />}
                  onClick={() => handleDownload(template)}
                >
                  Download
                </Button>,
                <Button
                  onClick={() => handlePreview(template)}
                >
                  Preview
                </Button>
              ]}
            >
              <Card.Meta
                title={template.name}
                description={
                  <>
                    <p>{template.description}</p>
                    <div>
                      <Rate disabled defaultValue={template.rating} />
                      <span style={{ marginLeft: 8 }}>
                        ({template.downloads} downloads)
                      </span>
                    </div>
                    <div style={{ marginTop: 8 }}>
                      {template.tags.map(tag => (
                        <Tag key={tag}>{tag}</Tag>
                      ))}
                    </div>
                  </>
                }
              />
            </Card>
          </List.Item>
        )}
      />

      <Modal
        title="Template Preview"
        open={!!selectedTemplate}
        onCancel={() => setSelectedTemplate(null)}
        footer={[
          <Button 
            key="download"
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => selectedTemplate && handleDownload(selectedTemplate)}
          >
            Download Template
          </Button>
        ]}
        width={800}
      >
        {selectedTemplate && (
          <div>
            <h3>{selectedTemplate.name}</h3>
            <p>{selectedTemplate.description}</p>
            {/* TODO: Add template preview component */}
          </div>
        )}
      </Modal>
    </div>
  );
};

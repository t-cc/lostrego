import React from 'react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { ContentImage } from '@/components/ui/content-image';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import type { ContentItem } from '@/types/content';
import type { Field, Model } from '@/types/model';
import type { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, CheckCircle, XCircle } from 'lucide-react';

interface ContentListProps {
  selectedModel: Model | null;
  contentItems: ContentItem[];
  onAddNew: () => void;
  onEdit: (item: ContentItem) => void;
}

export function ContentTable({
  selectedModel,
  contentItems,
  onAddNew,
  onEdit,
}: ContentListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  if (!selectedModel) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Select a model to manage content</p>
      </div>
    );
  }

  const getTitleField = (model: Model) => {
    return model.fields?.find((field) => field.useAsTitle);
  };

  const getDisplayValue = (item: ContentItem, model: Model) => {
    const titleField = getTitleField(model);

    if (titleField?.id && titleField.id in item.data) {
      const value = item.data[titleField.id];

      if (
        titleField.type === 'media' &&
        Array.isArray(value) &&
        value.length > 0
      ) {
        const url = value[0]; // Take the first image URL
        return <ContentImage src={url} alt="Title" />;
      } else if (Array.isArray(value)) {
        return value.filter(Boolean).join(', ');
      } else if (typeof value === 'boolean') {
        return value ? (
          <div className="flex justify-end">
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
        ) : (
          <div className="flex justify-end">
            <XCircle className="w-5 h-5 text-red-500" />
          </div>
        );
      } else {
        return String(value || '');
      }
    }
    return item.id;
  };

  const getFieldValue = (field: Field, item: ContentItem) => {
    if (!field || !field.id || !(field.id in item.data)) {
      return '';
    }

    const value = item.data[field.id];

    if (field.type === 'media' && Array.isArray(value) && value.length > 0) {
      const url = value[0]; // Take the first image URL
      return <ContentImage src={url} alt={field.name} />;
    } else if (Array.isArray(value)) {
      return value.filter(Boolean).join(', ');
    } else if (typeof value === 'boolean') {
      return value ? (
        <div className="flex justify-end">
          <CheckCircle className="w-5 h-5 text-green-500" />
        </div>
      ) : (
        <div className="flex justify-end">
          <XCircle className="w-5 h-5 text-red-500" />
        </div>
      );
    } else if (field.type === 'number') {
      return value === undefined ? '' : String(value);
    } else {
      return String(value || '');
    }
  };

  const getSortValue = (item: ContentItem, model: Model) => {
    const titleField = getTitleField(model);

    if (titleField?.id && titleField.id in item.data) {
      const value = item.data[titleField.id];

      if (
        titleField.type === 'media' &&
        Array.isArray(value) &&
        value.length > 0
      ) {
        return ''; // media not sortable by image
      } else if (Array.isArray(value)) {
        return value.filter(Boolean).join(', ');
      } else if (typeof value === 'boolean') {
        return value ? 1 : 0;
      } else {
        return String(value || '');
      }
    }
    return item.id;
  };

  const getFieldSortValue = (field: Field, item: ContentItem) => {
    if (!field || !field.id || !(field.id in item.data)) {
      return '';
    }

    const value = item.data[field.id];

    if (field.type === 'media' && Array.isArray(value) && value.length > 0) {
      return ''; // not sortable
    } else if (Array.isArray(value)) {
      return value.filter(Boolean).join(', ');
    } else if (typeof value === 'boolean') {
      return value ? 1 : 0;
    } else if (field.type === 'number') {
      return value === undefined ? '' : String(value);
    } else {
      return String(value || '');
    }
  };

  const listFields =
    selectedModel.fields
      ?.filter((field) => field.showInList)
      .sort((a, b) => a.order - b.order) || [];

  const columns: ColumnDef<ContentItem>[] = [
    {
      id: 'title',
      accessorFn: (row) => getSortValue(row, selectedModel),
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            <div className="truncate max-w-[100px]" title="Title">
              Title
            </div>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return <div>{getDisplayValue(row.original, selectedModel)}</div>;
      },
    },
    ...listFields.map(
      (field) =>
        ({
          accessorKey: field.id,
          accessorFn: (row: ContentItem) => getFieldSortValue(field, row),
          header: ({ column }) => {
            return (
              <Button
                variant="ghost"
                onClick={() =>
                  column.toggleSorting(column.getIsSorted() === 'asc')
                }
              >
                <div className="truncate max-w-[100px]" title={field.name}>
                  {field.name}
                </div>
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            );
          },
          cell: ({ row }) => <div>{getFieldValue(field, row.original)}</div>,
        }) as ColumnDef<ContentItem>
    ),
    {
      id: 'createdAt',
      accessorFn: (row) => row.createdAt?.getTime() || 0,
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            <div className="truncate max-w-[100px]" title="Created">
              Created
            </div>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return <div>{row.original.createdAt?.toLocaleDateString()}</div>;
      },
    },
  ];

  const filteredContentItems = contentItems.filter((item) => {
    const displayValue = getDisplayValue(item, selectedModel);
    const valueString =
      typeof displayValue === 'string'
        ? displayValue
        : React.isValidElement(displayValue)
          ? 'media' // Or handle appropriately if needed
          : String(displayValue);
    return valueString.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div>
      <div className="flex items-center mb-8 gap-4">
        <h2 className="text-2xl font-bold mb-4 mr-auto">
          {selectedModel.name}
        </h2>
        <Input
          placeholder="Search content..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-[300px]"
        />
        <Button onClick={onAddNew}>Add New</Button>
      </div>
      {/* Content Items List */}
      <DataTable
        columns={columns}
        data={filteredContentItems}
        onRowClick={onEdit}
      />
    </div>
  );
}

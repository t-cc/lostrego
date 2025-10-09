import { useState } from 'react';

import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { menuItems } from '@/config/menu';
import { modelService } from '@/lib/models';
import type { User } from '@/types/auth';
import type { Field } from '@/types/model';
import { useNavigate } from 'react-router-dom';

import { ModelForm } from '../common/ModelForm';

interface AddModelProps {
  user: User;
}

export function AddModel({ user }: AddModelProps) {
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();

  const breadcrumbs = [
    { label: 'Models', href: '/models' },
    { label: 'New Model' },
  ];

  const handleSave = async (modelData: {
    name: string;
    description: string;
    fields: Field[];
  }) => {
    try {
      setSaving(true);
      await modelService.create(modelData);
      navigate('/models');
    } catch (err) {
      console.error('Error creating model:', err);
      alert('Error creating model');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout menuItems={menuItems} user={user} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Model</h1>
            <p className="text-gray-600">Create a new system model.</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/models')}>
            Cancel
          </Button>
        </div>

        <ModelForm
          model={null}
          onSave={handleSave}
          onCancel={() => navigate('/models')}
          isSaving={saving}
        />
      </div>
    </Layout>
  );
}

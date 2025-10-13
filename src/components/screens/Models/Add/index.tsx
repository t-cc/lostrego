import { useEffect, useState } from 'react';

import Layout from '@/components/layout/Layout';
import { menuItems } from '@/config/menu';
import { useSite } from '@/context/SiteContext';
import { modelService } from '@/lib/models';
import type { User } from '@/types/auth';
import type { Field, Model } from '@/types/model';
import { useNavigate } from 'react-router-dom';

import { ModelForm } from '../common/ModelForm';
import { ModelsLayout } from '../common/ModelsLayout';

interface AddModelProps {
  user: User;
}

export function AddModel({ user }: AddModelProps) {
  const { currentSite } = useSite();
  const [models, setModels] = useState<Model[]>([]);
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchModels();
  }, [currentSite]);

  const fetchModels = async () => {
    if (!currentSite?.id) {
      setModels([]);
      return;
    }

    try {
      const data = await modelService.getBySite(currentSite.id);
      setModels(data);
    } catch (err) {
      console.error('Error loading models:', err);
    }
  };

  const breadcrumbs = [
    { label: 'Models', href: '/models' },
    { label: 'New Model' },
  ];

  const handleSave = async (modelData: {
    name: string;
    description: string;
    appId: string;
    fields: Field[];
  }) => {
    if (!currentSite?.id) {
      alert('No site selected');
      return;
    }

    try {
      setSaving(true);
      const newModel = await modelService.create({
        ...modelData,
        site: currentSite.id,
      });
      navigate(`/models/${newModel.id}`);
    } catch (err) {
      console.error('Error creating model:', err);
      alert('Error creating model');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout menuItems={menuItems} user={user} breadcrumbs={breadcrumbs}>
      <ModelsLayout models={models}>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Model</h1>
            <p className="text-gray-600">Create a new system model.</p>
          </div>

          <ModelForm
            model={null}
            onSave={handleSave}
            onCancel={() => navigate('/models')}
            isSaving={saving}
          />
        </div>
      </ModelsLayout>
    </Layout>
  );
}

import { supabase } from '@/lib/supabase';
import { Campaign, CampaignTask } from '@/types';

export const campaignsService = {
  async getCampaigns(userId: string) {
    return await supabase
      .from('campaigns')
      .select('*')
      .eq('user_id', userId)
      .order('start_date', { ascending: false });
  },

  async getCampaignTasks(campaignId: string) {
    return await supabase
      .from('campaign_tasks')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('order_index', { ascending: false });
  },

  async saveCampaign(userId: string, campaign: Partial<Campaign>) {
    if (campaign.id) {
      return await supabase
        .from('campaigns')
        .update(campaign)
        .eq('id', campaign.id)
        .select()
        .single();
    } else {
      return await supabase
        .from('campaigns')
        .insert({ ...campaign, user_id: userId })
        .select()
        .single();
    }
  },

  async saveCampaignTasksBatch(tasks: Partial<CampaignTask>[]) {
    return await supabase
      .from('campaign_tasks')
      .insert(tasks);
  },

  async saveCampaignTask(task: Partial<CampaignTask>) {
    if (task.id) {
      return await supabase
        .from('campaign_tasks')
        .update(task)
        .eq('id', task.id)
        .select()
        .single();
    } else {
      return await supabase
        .from('campaign_tasks')
        .insert(task)
        .select()
        .single();
    }
  },

  async deleteCampaign(userId: string, id: string) {
    return await supabase
      .from('campaigns')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
  }
};

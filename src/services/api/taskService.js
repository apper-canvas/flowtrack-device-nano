import { getApperClient } from "@/services/apperClient";
import { toast } from "react-toastify";
import { fileService } from "@/services/api/fileService";
import React from "react";

export const taskService = {
  async getAll() {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "completed_at_c"}},
          {"field": {"Name": "CreatedOn"}}
        ],
        orderBy: [{"fieldName": "CreatedOn", "sorttype": "DESC"}]
      };

      const response = await apperClient.fetchRecords('task_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      // IMPORTANT: Handle empty or non-existent data
      if (!response?.data?.length) {
        return [];
      }

      return response.data;
    } catch (error) {
      console.error("Error fetching tasks:", error?.response?.data?.message || error);
      return [];
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "completed_at_c"}},
          {"field": {"Name": "CreatedOn"}}
        ]
      };

      const response = await apperClient.getRecordById('task_c', parseInt(id), params);

      if (!response?.data) {
        return null;
      }
      return response.data;
    } catch (error) {
      console.error(`Error fetching task ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  },

async create(taskData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        records: [
          {
            // CRITICAL: Only include fields with visibility: "Updateable"
            Name: taskData.title_c || taskData.title,
            Tags: taskData.Tags || "",
            title_c: taskData.title_c || taskData.title,
            description_c: taskData.description_c || taskData.description || "",
            priority_c: taskData.priority_c || taskData.priority,
            status_c: taskData.status_c || taskData.status || "active",
            completed_at_c: taskData.completed_at_c || taskData.completedAt || null
          }
        ]
      };

      const response = await apperClient.createRecord('task_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} records:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          const newTask = successful[0].data;
          
          // If files were attached, create file records
          if (taskData.task_file_c && taskData.task_file_c.length > 0) {
            try {
              await fileService.create(taskData, newTask.Id);
            } catch (fileError) {
              console.error("Error creating file records:", fileError);
              // Don't fail the task creation if file creation fails
              toast.error("Task created but failed to save files");
            }
          }
          
          return newTask;
        }
      }
      return null;
    } catch (error) {
      console.error("Error creating task:", error?.response?.data?.message || error);
      return null;
    }
  },

  async update(id, updates) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      // Prepare updateable fields only
      const updateData = {
        Id: parseInt(id)
      };

      // Map old field names to new database field names
      if (updates.title !== undefined) updateData.title_c = updates.title;
      if (updates.title_c !== undefined) updateData.title_c = updates.title_c;
      if (updates.description !== undefined) updateData.description_c = updates.description;
      if (updates.description_c !== undefined) updateData.description_c = updates.description_c;
      if (updates.priority !== undefined) updateData.priority_c = updates.priority;
      if (updates.priority_c !== undefined) updateData.priority_c = updates.priority_c;
      if (updates.status !== undefined) updateData.status_c = updates.status;
      if (updates.status_c !== undefined) updateData.status_c = updates.status_c;
      if (updates.completedAt !== undefined) updateData.completed_at_c = updates.completedAt;
      if (updates.completed_at_c !== undefined) updateData.completed_at_c = updates.completed_at_c;
      if (updates.Tags !== undefined) updateData.Tags = updates.Tags;

      // Update Name field to match title for consistency
      if (updates.title !== undefined || updates.title_c !== undefined) {
        updateData.Name = updates.title_c || updates.title;
      }

      const params = {
        records: [updateData]
      };

      const response = await apperClient.updateRecord('task_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} records:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          return successful[0].data;
        }
      }
      return null;
    } catch (error) {
      console.error("Error updating task:", error?.response?.data?.message || error);
      return null;
    }
  },

  async delete(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await apperClient.deleteRecord('task_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} records:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        return successful.length === 1;
      }
      return false;
    } catch (error) {
      console.error("Error deleting task:", error?.response?.data?.message || error);
      return false;
}
  }
};
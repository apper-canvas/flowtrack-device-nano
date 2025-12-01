import { getApperClient } from "@/services/apperClient";
import { toast } from "react-toastify";

export const fileService = {
  async getAll() {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "filename_c"}},
          {"field": {"Name": "file_url_c"}},
          {"field": {"Name": "task_file_c"}},
          {"field": {"Name": "task_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        orderBy: [{"fieldName": "CreatedOn", "sorttype": "DESC"}],
        pagingInfo: {"limit": 100, "offset": 0}
      };

      const response = await apperClient.fetchRecords('files_c', params);

      if (!response?.data?.length) {
        return [];
      } else {
        return response.data;
      }
    } catch (error) {
      console.error("Error fetching files:", error?.response?.data?.message || error);
      return [];
    }
  },

  async getById(recordId) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "filename_c"}},
          {"field": {"Name": "file_url_c"}},
          {"field": {"Name": "task_file_c"}},
          {"field": {"Name": "task_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ]
      };

      const response = await apperClient.getRecordById('files_c', recordId, params);

      if (!response?.data) {
        return null;
      } else {
        return response.data;
      }
    } catch (error) {
      console.error(`Error fetching file ${recordId}:`, error?.response?.data?.message || error);
      return null;
    }
  },

  async create(formData, taskId) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      // Convert files to API format
      const { ApperFileUploader } = window.ApperSDK;
      const convertedFiles = ApperFileUploader.toCreateFormat(formData.task_file_c);

      const params = {
        records: [
          {
            Name: formData.task_file_c[0]?.Name || 'Uploaded File',
            filename_c: formData.task_file_c[0]?.Name || '',
            file_url_c: formData.task_file_c[0]?.Path || '',
            task_file_c: convertedFiles,
            task_c: taskId // Link to the created task
          }
        ]
      };

      const response = await apperClient.createRecord('files_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} file records:`, failed);
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
      console.error("File creation error:", error?.response?.data?.message || error);
      return null;
    }
  },

  async update(id, data) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        records: [
          {
            Id: id,
            Name: data.Name,
            filename_c: data.filename_c,
            file_url_c: data.file_url_c,
            task_file_c: data.task_file_c
          }
        ]
      };

      const response = await apperClient.updateRecord('files_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} file records:`, failed);
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
      console.error("Error updating file:", error?.response?.data?.message || error);
      return null;
    }
  },

  async delete(recordIds) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = { 
        RecordIds: Array.isArray(recordIds) ? recordIds : [recordIds]
      };

      const response = await apperClient.deleteRecord('files_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} file records:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        return successful.length === params.RecordIds.length;
      }
    } catch (error) {
      console.error("Error deleting files:", error?.response?.data?.message || error);
      return false;
    }
  }
};
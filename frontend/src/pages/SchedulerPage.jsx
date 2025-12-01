import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  Clock,
  Play,
  Pause,
  Trash2,
  Plus,
  Calendar,
  RefreshCw
} from "lucide-react";
import { schedulerAPI } from "../services/api";
import ConfirmDialog from "../components/ConfirmDialog";

export default function SchedulerPage() {
  const [jobs, setJobs] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newJob, setNewJob] = useState({
    job_name: "",
    cron_schedule: "0 0 * * *", // Daily at midnight
    source_folder: "",
    batch_name_prefix: "",
    is_active: true
  });
  const [customCron, setCustomCron] = useState(false);
  const [cronTime, setCronTime] = useState({ hour: "0", minute: "0", day: "*", month: "*", weekday: "*" });
  const [loading, setLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {}
  });

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const jobsList = await schedulerAPI.getAllJobs();
      setJobs(jobsList || []);
    } catch (error) {
      console.error("Error loading jobs:", error);
      toast.error("Failed to load scheduled jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async () => {
    if (!newJob.job_name || !newJob.cron_schedule || !newJob.source_folder) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await schedulerAPI.createJob(newJob);
      toast.success("Scheduled job created successfully");
      setShowCreateModal(false);
      setCustomCron(false);
      setCronTime({ hour: "0", minute: "0", day: "*", month: "*", weekday: "*" });
      setNewJob({
        job_name: "",
        cron_schedule: "0 0 * * *",
        source_folder: "",
        batch_name_prefix: "",
        is_active: true
      });
      loadJobs();
    } catch (error) {
      console.error("Error creating job:", error);
      toast.error("Failed to create scheduled job");
    }
  };

  const handlePauseJob = async (jobId) => {
    try {
      await schedulerAPI.pauseJob(jobId);
      toast.success("Job paused");
      loadJobs();
    } catch (error) {
      console.error("Error pausing job:", error);
      toast.error("Failed to pause job");
    }
  };

  const handleResumeJob = async (jobId) => {
    try {
      await schedulerAPI.resumeJob(jobId);
      toast.success("Job resumed");
      loadJobs();
    } catch (error) {
      console.error("Error resuming job:", error);
      toast.error("Failed to resume job");
    }
  };

  const handleDeleteJob = (jobId, jobName) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Scheduled Job",
      message:
        'Are you sure you want to delete the scheduled job "' +
        (jobName || "this job") +
        '"? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await schedulerAPI.deleteJob(jobId);
          toast.success("Job deleted");
          loadJobs();
        } catch (error) {
          console.error("Error deleting job:", error);
          toast.error("Failed to delete job");
        }
      }
    });
  };

  const cronPresets = [
    { label: "Every minute", value: "* * * * *" },
    { label: "Every hour", value: "0 * * * *" },
    { label: "Daily at midnight", value: "0 0 * * *" },
    { label: "Daily at 9 AM", value: "0 9 * * *" },
    { label: "Weekly on Monday", value: "0 0 * * 1" },
    { label: "Monthly on 1st", value: "0 0 1 * *" },
    { label: "Custom", value: "custom" }
  ];

  const handleCronScheduleChange = (value) => {
    if (value === "custom") {
      setCustomCron(true);
      // Build cron from current cronTime state
      const cron = `${cronTime.minute} ${cronTime.hour} ${cronTime.day} ${cronTime.month} ${cronTime.weekday}`;
      setNewJob({ ...newJob, cron_schedule: cron });
    } else {
      setCustomCron(false);
      setNewJob({ ...newJob, cron_schedule: value });
    }
  };

  const handleCronTimeChange = (field, value) => {
    const updated = { ...cronTime, [field]: value };
    setCronTime(updated);
    // Update the cron schedule
    const cron = `${updated.minute} ${updated.hour} ${updated.day} ${updated.month} ${updated.weekday}`;
    setNewJob({ ...newJob, cron_schedule: cron });
  };

  const parseCronSchedule = (cron) => {
    const presetMatch = cronPresets.find((p) => p.value === cron);
    if (presetMatch) return presetMatch.label;

    // Simple cron description
    const parts = cron.split(" ");
    if (parts.length === 5) {
      return `Custom: ${cron}`;
    }
    return cron;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Scheduled Jobs
          </h2>
          <p className="mt-1 text-gray-600 dark:text-gray-300">
            Automate batch processing with scheduled jobs
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadJobs}
            className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-200"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Refresh
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Job
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6">
          <p className="text-sm text-gray-600 dark:text-gray-300">Total Jobs</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {jobs.length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6">
          <p className="text-sm text-gray-600 dark:text-gray-300">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {jobs.filter((j) => j.is_active && j.status === "active").length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6">
          <p className="text-sm text-gray-600 dark:text-gray-300">Paused</p>
          <p className="text-2xl font-bold text-orange-600">
            {jobs.filter((j) => j.status === "paused").length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Completed Today
          </p>
          <p className="text-2xl font-bold text-blue-600">
            {
              jobs.filter(
                (j) =>
                  j.last_run &&
                  new Date(j.last_run).toDateString() ===
                    new Date().toDateString()
              ).length
            }
          </p>
        </div>
      </div>

      {/* Jobs List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Scheduled Jobs
          </h3>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
            <p className="mt-4 text-gray-600 dark:text-gray-300">
              Loading jobs...
            </p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">No Scheduled Jobs</p>
            <p className="text-sm">
              Create your first scheduled job to automate batch processing
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700 dark:divide-gray-700">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {job.job_name}
                      </h4>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          job.is_active && job.status === "active"
                            ? "bg-green-100 text-green-800"
                            : job.status === "paused"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {job.is_active && job.status === "active"
                          ? "Active"
                          : job.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{parseCronSchedule(job.cron_schedule)}</span>
                      </div>
                      <div>
                        <span className="font-medium">Source:</span>{" "}
                        {job.source_folder}
                      </div>
                      {job.last_run && (
                        <div>
                          <span className="font-medium">Last Run:</span>{" "}
                          {new Date(job.last_run).toLocaleString()}
                        </div>
                      )}
                      {job.next_run && (
                        <div>
                          <span className="font-medium">Next Run:</span>{" "}
                          {new Date(job.next_run).toLocaleString()}
                        </div>
                      )}
                    </div>

                    {job.last_error && (
                      <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                        <span className="font-medium">Last Error:</span>{" "}
                        {job.last_error}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    {job.is_active && job.status === "active" ? (
                      <button
                        onClick={() => handlePauseJob(job.id)}
                        className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        title="Pause job"
                      >
                        <Pause className="w-5 h-5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleResumeJob(job.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Resume job"
                      >
                        <Play className="w-5 h-5" />
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteJob(job.id, job.job_name)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete job"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Job Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl dark:shadow-gray-900/50 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Create Scheduled Job
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Job Name *
                </label>
                <input
                  type="text"
                  value={newJob.job_name}
                  onChange={(e) =>
                    setNewJob({ ...newJob, job_name: e.target.value })
                  }
                  placeholder="e.g., Daily Invoice Processing"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400
                           dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Schedule *
                </label>
                <select
                  value={customCron ? "custom" : newJob.cron_schedule}
                  onChange={(e) => handleCronScheduleChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400
                           dark:bg-gray-700 dark:text-white"
                >
                  {cronPresets.map((preset) => (
                    <option key={preset.value} value={preset.value}>
                      {preset.label}
                    </option>
                  ))}
                </select>

                {/* Custom Cron Time Picker */}
                {customCron && (
                  <div className="mt-3 p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Custom Schedule</p>
                    <div className="grid grid-cols-5 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Minute (0-59)</label>
                        <input
                          type="text"
                          value={cronTime.minute}
                          onChange={(e) => handleCronTimeChange("minute", e.target.value)}
                          placeholder="0-59 or *"
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded
                                   focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400
                                   dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Hour (0-23)</label>
                        <input
                          type="text"
                          value={cronTime.hour}
                          onChange={(e) => handleCronTimeChange("hour", e.target.value)}
                          placeholder="0-23 or *"
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded
                                   focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400
                                   dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Day (1-31)</label>
                        <input
                          type="text"
                          value={cronTime.day}
                          onChange={(e) => handleCronTimeChange("day", e.target.value)}
                          placeholder="1-31 or *"
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded
                                   focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400
                                   dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Month (1-12)</label>
                        <input
                          type="text"
                          value={cronTime.month}
                          onChange={(e) => handleCronTimeChange("month", e.target.value)}
                          placeholder="1-12 or *"
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded
                                   focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400
                                   dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Weekday (0-6)</label>
                        <input
                          type="text"
                          value={cronTime.weekday}
                          onChange={(e) => handleCronTimeChange("weekday", e.target.value)}
                          placeholder="0-6 or *"
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded
                                   focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400
                                   dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Use * for "any" value. Example: "30 14 * * *" = Every day at 2:30 PM
                    </p>
                  </div>
                )}

                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Cron expression: {newJob.cron_schedule}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Source Folder Path *
                </label>
                <input
                  type="text"
                  value={newJob.source_folder}
                  onChange={(e) =>
                    setNewJob({ ...newJob, source_folder: e.target.value })
                  }
                  placeholder="e.g., C:\Invoices\ToProcess"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400
                           dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Folder where PDFs will be automatically picked up
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Batch Name Prefix (Optional)
                </label>
                <input
                  type="text"
                  value={newJob.batch_name_prefix}
                  onChange={(e) =>
                    setNewJob({ ...newJob, batch_name_prefix: e.target.value })
                  }
                  placeholder="e.g., Auto-"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400
                           dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Prefix for automatically generated batch names
                </p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={newJob.is_active}
                  onChange={(e) =>
                    setNewJob({ ...newJob, is_active: e.target.checked })
                  }
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-400"
                />
                <label
                  htmlFor="is_active"
                  className="ml-2 block text-sm text-gray-700 dark:text-gray-200"
                >
                  Start job immediately after creation
                </label>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setCustomCron(false);
                  setCronTime({ hour: "0", minute: "0", day: "*", month: "*", weekday: "*" });
                  setNewJob({
                    job_name: "",
                    cron_schedule: "0 0 * * *",
                    source_folder: "",
                    batch_name_prefix: "",
                    is_active: true
                  });
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateJob}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Create Job
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
      />
    </div>
  );
}

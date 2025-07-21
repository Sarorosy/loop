import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import Select from "react-select";
import { format } from "date-fns";
import { useAuth } from "../utils/idb";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { Editor } from "@tinymce/tinymce-react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import dayjs from "dayjs";

export default function AddTask() {
  const [buckets, setBuckets] = useState([]);
  const [milestonesList, setMilestonesList] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  const editorRef = useRef(null);

  const todayDateTime = format(new Date(), "yyyy-MM-dd'T'HH:mm");

  const [formData, setFormData] = useState({
    bucketId: "",
    assignedTo: [],
    projectId: "",
    dueTime: "",
    dueDate: "",
    recurring: "No",
    recurringDuration: "",
    recurringType: "",
    followers: [],
    title: "",
    description: "",
    googleLink: "",
    additionalLink: "",
  });

   const dateRef = useRef();
   useEffect(() => {
    flatpickr(dateRef.current, {
      dateFormat: "d/m/Y", // Display format
      defaultDate: formData.dueDate ? dayjs(formData.dueDate).toDate() : null,
      onChange: (selectedDates) => {
        const formatted = dayjs(selectedDates[0]).format("YYYY-MM-DD");
        setFormData({ ...formData, dueDate: formatted });
      }
    });
  }, []);

  const [milestones, setMilestones] = useState([]);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    try {
      const [bucketsRes, milestonesRes, projectsRes, usersRes] =
        await Promise.all([
          fetch("https://loopback-skci.onrender.com/api/helper/allbuckets"),
          fetch("https://loopback-skci.onrender.com/api/helper/allbenchmarks"),
          fetch("https://loopback-skci.onrender.com/api/helper/allprojects"),
          fetch("https://loopback-skci.onrender.com/api/users/allusers"),
        ]);
      setBuckets((await bucketsRes.json())?.data || []);
      setMilestonesList((await milestonesRes.json())?.data || []);
      setProjects((await projectsRes.json())?.data || []);
      setUsers((await usersRes.json())?.data || []);
    } catch (error) {
      console.error("Error loading dropdown data:", error);
      toast.error("Failed to load dropdown data");
    }
  };

  const addMilestone = () => {
    setMilestones([
      ...milestones,
      { milestoneId: "", milestoneDueDate: todayDateTime },
    ]);
  };

  const removeMilestone = (index) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const handleMilestoneChange = (index, field, value) => {
    const updated = [...milestones];
    updated[index][field] = value;
    setMilestones(updated);
  };

  const addFile = () => {
    if (files.length < 3) setFiles([...files, { file: null, fileName: "" }]);
    else toast.error("Max 3 files allowed");
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleFileChange = (index, field, value) => {
    const updated = [...files];
    updated[index][field] = value;
    setFiles(updated);
  };

  const [creatingTask, setCreatingTask] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation function
    const validateForm = () => {
      const errors = [];

      // Required field validations
      if (!formData.title.trim()) {
        errors.push("Task title is required");
      }

      if (!formData.bucketId) {
        errors.push("Please select a bucket");
      }

      if (!formData.projectId) {
        //errors.push("Please select a project");
      }

      if (formData.assignedTo.length === 0) {
        errors.push("Please assign the task to at least one user");
      }

      if (!formData.dueDate) {
        //errors.push("Due date is required");
      }

      // Validate due date is not in the past
      if (formData.dueDate) {
        const today = new Date().toISOString().split("T")[0];
        if (formData.dueDate < today) {
          errors.push("Due date cannot be in the past");
        }
      }

      // Validate recurring task fields
      if (formData.recurring === "Yes") {
        if (!formData.recurringDuration) {
          errors.push("Please select recurring frequency");
        }
        if (!formData.recurringType) {
          errors.push("Please select recurring type");
        }
      }

      // Validate URL formats
      const urlPattern = /^https?:\/\/.+/;
      if (formData.googleLink && !urlPattern.test(formData.googleLink)) {
        errors.push(
          "Google link must be a valid URL starting with http:// or https://"
        );
      }

      if (
        formData.additionalLink &&
        !urlPattern.test(formData.additionalLink)
      ) {
        errors.push(
          "Additional link must be a valid URL starting with http:// or https://"
        );
      }

      // Validate milestones
      for (let i = 0; i < milestones.length; i++) {
        const milestone = milestones[i];
        if (!milestone.milestoneId) {
          errors.push(`Milestone ${i + 1}: Please select a milestone`);
        }
        if (!milestone.milestoneDueDate) {
          errors.push(`Milestone ${i + 1}: Due date is required`);
        }
      }

      // Validate files
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.file) {
          errors.push(`File ${i + 1}: Please select a file`);
        }
        if (!file.fileName.trim()) {
          errors.push(`File ${i + 1}: File name is required`);
        }

        // File size validation (10MB limit)
        if (file.file && file.file.size > 10 * 1024 * 1024) {
          errors.push(`File ${i + 1}: File size must be less than 10MB`);
        }

        // File type validation (optional - add allowed types as needed)
        const allowedTypes = [
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/webp",
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "text/plain",
          "text/csv",
        ];

        if (file.file && !allowedTypes.includes(file.file.type)) {
          errors.push(
            `File ${
              i + 1
            }: Unsupported file type. Please use images, PDFs, Word docs, Excel files, or text files.`
          );
        }
      }

      return errors;
    };

    // Run validation
    const validationErrors = validateForm();

    if (validationErrors.length > 0) {
      // Display all validation errors
      validationErrors.forEach((error) => {
        toast.error(error);
      });
      return;
    }

    try {
      setCreatingTask(true);
      // Show loading state
      const loadingToast = toast.loading("Creating task...");

      // Create FormData object
      const formDataToSend = new FormData();

      // Append basic form data
      formDataToSend.append("user_id", user?.id);
      formDataToSend.append("user_type", user?.fld_admin_type);
      formDataToSend.append(
        "user_name",
        user?.fld_first_name + " " + user?.fld_last_name
      );
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description || "");
      formDataToSend.append("bucket_name", formData.bucketId);
      formDataToSend.append("project_name", formData.projectId);
      formDataToSend.append("due_date", formData.dueDate);
      formDataToSend.append("due_time", formData.dueTime || "");
      formDataToSend.append("recurring", formData.recurring);
      formDataToSend.append(
        "google_sheets_or_docs_link",
        formData.googleLink || ""
      );
      formDataToSend.append("fld_asana_link", formData.additionalLink || "");

      // Append recurring fields if applicable
      if (formData.recurring === "Yes") {
        formDataToSend.append("recurring_duration", formData.recurringDuration);
        formDataToSend.append("recurring_type", formData.recurringType);
      } else {
        formDataToSend.append("recurring_tasks", formData.recurring ?? "No");
      }

      // Append arrays as JSON strings
      formDataToSend.append("assigned_to", JSON.stringify(formData.assignedTo));
      formDataToSend.append("follower", formData.followers.join(","));

      // Append milestones
      if (milestones.length > 0) {
        formDataToSend.append("benchmark_name", JSON.stringify(milestones));
      }

      // Append files
      files.forEach((fileObj, index) => {
        if (fileObj.file) {
          formDataToSend.append(`file_upload[]`, fileObj.file);
          formDataToSend.append(`file_names[]`, fileObj.fileName);
        }
      });

      // Make API call
      const response = await fetch("https://loopback-skci.onrender.com/api/tasks/create", {
        method: "POST",
        body: formDataToSend,
        // Don't set Content-Type header - let browser set it with boundary for FormData
      });

      const result = await response.json();

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      if (response.ok) {
        toast.success("Task created successfully!");
        navigate("/tasks/created-by-me");

        // Reset form after successful submission
        // setFormData({
        //   bucketId: "",
        //   assignedTo: [],
        //   projectId: "",
        //   dueTime: "",
        //   dueDate: "",
        //   recurring: "No",
        //   recurringDuration: "",
        //   recurringType: "",
        //   followers: [],
        //   title: "",
        //   description: "",
        //   googleLink: "",
        //   additionalLink: "",
        // });
        // setMilestones([]);
        // setFiles([]);

        // Optional: Redirect to task list or task detail page
        // window.location.href = '/tasks';
        // or if using React Router:
        // navigate('/tasks');
      } else {
        // Handle API errors
        const errorMessage = result.message || "Failed to create task";
        toast.error(errorMessage);

        // Log detailed error for debugging
        console.error("Task creation failed:", result);
      }
    } catch (error) {
      toast.dismiss(); // Dismiss any loading toasts

      // Handle network errors
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        toast.error(
          "Network error. Please check your connection and try again."
        );
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }

      console.error("Task creation error:", error);
    } finally {
      setCreatingTask(false);
    }
  };

  const selectOptions = (
    list,
    labelKey = "fld_first_name",
    valueKey = "id",
    extra = ""
  ) =>
    list.map((item) => ({
      value: item[valueKey],
      label: `${item[labelKey]} ${extra && item[extra]}`,
    }));

  const customSelectStyles = {
    control: (base) => ({
      ...base,
      border: "1px solid #e5e7eb",
      borderRadius: "0.5rem",
      padding: "0.125rem",
      fontSize: "0.875rem",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#3b82f6",
      },
    }),
    placeholder: (base) => ({
      ...base,
      color: "#9ca3af",
      fontSize: "0.875rem",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#3b82f6"
        : state.isFocused
        ? "#f3f4f6"
        : "white",
      color: state.isSelected ? "white" : "#374151",
      fontSize: "0.875rem",
    }),
  };

  return (
    <div className="">
      <div className="">
        <div className="">
          {/* Header */}
          <div className="">
            <h1 className="text-xl font-bold mb-4 flex items-center justify-between">
              Create New Task
            </h1>
          </div>

          <form className="bg-white w-full f-13 mt-5">
            <div>
              {/* Basic Information */}
              <div className="mb-8">
                <h2 className="text-[16px] font-medium text-gray-900 mb-4 flex items-end leading-none ">
                  <div className="w-1 h-5 bg-orange-600 rounded-full mr-3"></div>
                  Basic Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1">
                      Bucket
                    </label>
                    <Select
                      classNamePrefix="task-filter"
                      styles={customSelectStyles}
                      options={selectOptions(buckets, "fld_bucket_name")}
                      value={
                        selectOptions(buckets, "fld_bucket_name").find(
                          (o) => o.value === formData.bucketId
                        ) || null
                      }
                      onChange={(option) => {
  const selectedBucket = buckets.find((b) => b.id === option?.value);
  setFormData((prev) => ({
    ...prev,
    bucketId: option?.value || "",
    description: selectedBucket?.fld_default_description || prev.description,
  }));
}}
                      placeholder="Select Bucket"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1">
                      Assign To
                    </label>
                    <Select
                      classNamePrefix="task-filter"
                      styles={customSelectStyles}
                      isMulti
                      options={selectOptions(
                        users,
                        "fld_first_name",
                        "id",
                        "fld_last_name"
                      )}
                      value={selectOptions(
                        users,
                        "fld_first_name",
                        "id",
                        "fld_last_name"
                      ).filter((o) => formData.assignedTo.includes(o.value))}
                      onChange={(selectedOptions) =>
                        setFormData({
                          ...formData,
                          assignedTo: selectedOptions
                            ? selectedOptions.map((opt) => opt.value)
                            : [],
                        })
                      }
                      placeholder="Select Users"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1">
                      Project
                    </label>
                    <Select
                      classNamePrefix="task-filter"
                      styles={customSelectStyles}
                      options={selectOptions(projects, "fld_project_name")}
                      value={
                        selectOptions(projects, "fld_project_name").find(
                          (o) => o.value === formData.projectId
                        ) || null
                      }
                      onChange={(option) =>
                        setFormData({
                          ...formData,
                          projectId: option?.value || "",
                        })
                      }
                      placeholder="Select Project"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1">
                      Followers
                    </label>
                    <Select
                      classNamePrefix="task-filter"
                      styles={customSelectStyles}
                      isMulti
                      options={selectOptions(
                        users.filter((u) => u.id !== user?.id), // exclude current user
                        "fld_first_name"
                      )}
                      value={selectOptions(
                        users.filter((u) => u.id !== user?.id),
                        "fld_first_name"
                      ).filter((u) => formData.followers.includes(u.value))}
                      onChange={(selected) =>
                        setFormData({
                          ...formData,
                          followers: selected.map((s) => s.value),
                        })
                      }
                      placeholder="Select Followers"
                    />
                  </div>
                </div>
              </div>

              {/* Task Details */}
              <div className="mb-8">
                <h2 className="text-[16px] font-medium text-gray-900 mb-4 flex items-end leading-none ">
                  <div className="w-1 h-5 bg-orange-600 rounded-full mr-3"></div>
                  Task Details
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1">
                      Task Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      placeholder="Enter task title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    {/* <textarea
                      name="description"
                      placeholder="Enter task description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none"
                    /> */}

                    <Editor
                      apiKey="2crkajrj0p3qpzebc7qfndt5c6xoy8vwer3qt5hsqqyv8hb8"
                      onInit={(evt, editor) => (editorRef.current = editor)}
                      value={formData.description}
                      onEditorChange={(newContent) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: newContent,
                        }))
                      }
                     
                      init={{
                        height: 500,
                        menubar: true,
                        plugins: [
                          "advlist autolink lists link image charmap print preview anchor",
                          "searchreplace visualblocks code fullscreen",
                          "insertdatetime media table paste code help wordcount",
                        ],
                        toolbar:
                          "undo redo | formatselect | bold italic backcolor | \
            alignleft aligncenter alignright alignjustify | \
            bullist numlist outdent indent | removeformat | help",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Timing & Schedule */}
            <h2 className="text-[16px] font-medium text-gray-900 mb-4 flex items-end leading-none ">
              <div className="w-1 h-5 bg-orange-600 rounded-full mr-3"></div>
              Timing & Schedule
            </h2>
            <div className="mb-8 flex gap-5 items-start">
              <div className="w-1/2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1">
                      Due Date
                    </label>
                     <input
        type="text"
        name="dueDate"
        ref={dateRef}
        value={formData.dueDate ? dayjs(formData.dueDate).format("DD/MM/YYYY") : ""}
        readOnly
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors"
      />
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1">
                      Due Time
                    </label>
                    <input
                      type="time"
                      name="dueTime"
                      value={formData.dueTime}
                      onChange={(e) =>
                        setFormData({ ...formData, dueTime: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="w-1/2 flex gap-7">
                {/* <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-3">
                    Recurring Task
                  </label>
                  <div className="flex gap-6">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="recurring"
                        value="Yes"
                        checked={formData.recurring === "Yes"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            recurring: e.target.value,
                          })
                        }
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                      />
                      <span className="ml-2 text-[13px] text-gray-700">
                        Yes
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="recurring"
                        value="No"
                        checked={formData.recurring === "No"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            recurring: e.target.value,
                          })
                        }
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                      />
                      <span className="ml-2 text-[13px] text-gray-700">No</span>
                    </label>
                  </div>
                </div> */}

                {formData.recurring === "Yes" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full ">
                    <div>
                      <label className="block text-[13px] font-medium text-gray-700 mb-1">
                        Frequency
                      </label>
                      <select
                        name="recurring_duration"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                        required
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            recurringDuration: e.target.value,
                          })
                        }
                        value={formData.recurringDuration || ""}
                      >
                        <option value="">Select Frequency</option>
                        <option value="Weekly">Weekly</option>
                        <option value="Monthly">Monthly</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[13px] font-medium text-gray-700 mb-1">
                        Recurring Type
                      </label>
                      <select
                        name="recurring_type"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                        required
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            recurringType: e.target.value,
                          })
                        }
                        value={formData.recurringType || ""}
                      >
                        <option value="">Select Type</option>
                        <option value="Non Stop">Non Stop</option>
                        <option value="Stop after 3 times repetition">
                          Stop after 3 times repetition
                        </option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Links */}
            <div className="mb-8">
              <h2 className="text-[16px] font-medium text-gray-900 mb-4 flex items-end leading-none ">
                <div className="w-1 h-5 bg-orange-600 rounded-full mr-3"></div>
                Links & References
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1">
                    Google Sheets/Docs Link
                  </label>
                  <input
                    type="url"
                    name="googleLink"
                    placeholder="https://docs.google.com/..."
                    value={formData.googleLink}
                    onChange={(e) =>
                      setFormData({ ...formData, googleLink: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1">
                    Additional Link
                  </label>
                  <input
                    type="url"
                    name="additionalLink"
                    placeholder="https://example.com/..."
                    value={formData.additionalLink}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        additionalLink: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Milestones */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-[16px] font-medium text-gray-900 flex items-center">
                  <div className="w-1 h-5 bg-orange-600 rounded-full mr-3"></div>
                  Milestones
                </h2>
                <button
                  type="button"
                  onClick={addMilestone}
                  className="inline-flex items-center px-2 py-1 leading-none border border-transparent text-[13px] font-medium rounded-md text-orange-700 bg-orange-100 hover:bg-orange-200 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-orange-500 transition-colors"
                >
                  + Add Milestone
                </button>
              </div>
              <div className="space-y-3">
                {milestones.map((m, i) => (
                  <div
                    key={i}
                    className="bg-gray-50 rounded p-2 border border-gray-200 flex items-center gap-3"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                      <div>
                        <label className="block text-[13px] font-medium text-gray-700 mb-1">
                          Milestone
                        </label>
                        <Select
                          classNamePrefix="task-filter"
                          styles={customSelectStyles}
                          options={selectOptions(
                            milestonesList,
                            "fld_benchmark_name"
                          )}
                          value={
                            selectOptions(
                              milestonesList,
                              "fld_benchmark_name"
                            ).find((o) => o.value === m.milestoneId) || null
                          }
                          onChange={(option) =>
                            handleMilestoneChange(
                              i,
                              "milestoneId",
                              option?.value
                            )
                          }
                          placeholder="Select Milestone"
                        />
                      </div>
                      {/* <div>
                        <label className="block text-[13px] font-medium text-gray-700 mb-1">
                          Due Date & Time
                        </label>
                        <input
                          type="datetime-local"
                          value={m.milestoneDueDate}
                          onChange={(e) =>
                            handleMilestoneChange(
                              i,
                              "milestoneDueDate",
                              e.target.value
                            )
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                        />
                      </div> */}
                      <div className="mt-3 flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeMilestone(i)}
                          className="bg-red-600 hover:bg-red-700 p-2 rounded text-white mt-2"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {milestones.length === 0 && (
                  <div className="text-center py-2 text-gray-500 bg-red-50">
                    <p className="text-[13px]">No milestones added yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Files */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-[16px] font-medium text-gray-900 flex items-center">
                  <div className="w-1 h-5 bg-orange-600 rounded-full mr-3"></div>
                  Attachments
                  <span className="ml-2 text-[13px] text-gray-500 font-normal">
                    (Max 3 files)
                  </span>
                </h2>
                <button
                  type="button"
                  onClick={addFile}
                  className="inline-flex items-center px-2 py-1 leading-none border border-transparent text-[13px] font-medium rounded-md text-orange-700 bg-orange-100 hover:bg-orange-200 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-orange-500 transition-colors"
                >
                  + Add File
                </button>
              </div>
              <div className="space-y-3">
                {files.map((f, i) => (
                  <div
                    key={i}
                    className="bg-gray-50 rounded p-2 border border-gray-200 flex items-center gap-3"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4  w-full">
                      <div>
                        <label className="block text-[13px] font-medium text-gray-700 mb-1">
                          Select File
                        </label>
                        <input
                          type="file"
                          onChange={(e) =>
                            handleFileChange(i, "file", e.target.files[0])
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[13px] font-medium text-gray-700 mb-1">
                          File Name
                        </label>
                        <input
                          type="text"
                          placeholder="Enter file name"
                          value={f.fileName}
                          onChange={(e) =>
                            handleFileChange(i, "fileName", e.target.value)
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                        />
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="bg-red-600 hover:bg-red-700 p-2 rounded text-white mt-2"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
                {files.length === 0 && (
                  <div className="text-center py-2 text-gray-500 bg-red-50">
                    <p className="text-[13px]">No files attached yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleSubmit}
                className="inline-flex items-center px-2 py-1.5 border border-transparent text-[13px] leading-none font-medium rounded shadow-sm text-white bg-orange-500 hover:bg-orange-700 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-orange-500 transition-colors"
              >
                {creatingTask ? "Creating..." : "Create Task"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

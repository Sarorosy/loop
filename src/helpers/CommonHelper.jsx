export const formatDate = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  if (isNaN(date)) return "";

  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();

  return `${day < 10 ? "0" + day : day} ${month} ${year}`;
};


export const calculateTaskProgress = (task) => {
    let totalPercent = 0;

    if (
      task.fld_task_status == "Updated" ||
      task.fld_task_status == "Completed"
    ) {
      totalPercent = 100;
    } else if (task.fld_benchmark_name && task.fld_benchmark_name !== "") {
      const benchmarkNames = task.fld_benchmark_name.split(","); // e.g., ['6', '7', '8']
      const completedBenchmarks = task.fld_completed_benchmarks
        ? task.fld_completed_benchmarks.split(",")
        : []; // e.g., ['6', '7']

      let filteredBenchmarkNames = [...benchmarkNames];

      if (task.task_type === "crm_query") {
        if (!completedBenchmarks.includes("28")) {
          const index28 = benchmarkNames.indexOf("28");
          if (index28 !== -1) {
            filteredBenchmarkNames = benchmarkNames.slice(0, index28 + 1);
          }
        }
      }

      const totalBenchmarks = filteredBenchmarkNames.length;

      if (totalBenchmarks > 0) {
        const progressPerBenchmark = 100 / totalBenchmarks;

        filteredBenchmarkNames.forEach((benchmark) => {
          if (completedBenchmarks.includes(benchmark)) {
            totalPercent += progressPerBenchmark;
          }
        });
      }
    } else {
      totalPercent =
        task.fld_task_status == "Updated" || task.fld_task_status == "Completed"
          ? 100
          : 0;
    }

    return Math.min(totalPercent, 100); // Make sure it doesn't exceed 100
  };

  
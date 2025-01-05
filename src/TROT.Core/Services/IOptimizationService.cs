using TROT.Core.Models;

namespace TROT.Core.Services
{
    public interface IOptimizationService
    {
        Task<OptimizationPlan> CreateOptimizationPlanAsync(OptimizationRequest request);
        Task<List<ServiceProvider>> FindAvailableProvidersAsync(DateTime startTime, DateTime endTime, List<ServiceCategory> categories);
        Task<decimal> EstimateTotalCostAsync(OptimizationPlan plan);
        Task<bool> ValidateScheduleAsync(OptimizationPlan plan);
        Task<OptimizationPlan> UpdatePlanAsync(string planId, OptimizationRequest updatedRequest);
        Task<ExecutionStatus> GetPlanStatusAsync(string planId);
    }

    public class OptimizationPlan
    {
        public string Id { get; set; } = string.Empty;
        public List<ScheduledTask> Tasks { get; set; } = new();
        public List<AssignedProvider> Providers { get; set; } = new();
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public decimal TotalCost { get; set; }
        public ExecutionStatus Status { get; set; }
        public Dictionary<string, TimeSlot> ParallelExecutions { get; set; } = new();
    }

    public class ScheduledTask
    {
        public Task Task { get; set; } = new();
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string AssignedProviderId { get; set; } = string.Empty;
        public ExecutionStatus Status { get; set; }
        public List<string> DependentTaskIds { get; set; } = new();
    }

    public class AssignedProvider
    {
        public ServiceProvider Provider { get; set; } = new();
        public List<TimeSlot> AvailableSlots { get; set; } = new();
        public decimal AssignedCost { get; set; }
    }

    public class TimeSlot
    {
        public DateTime Start { get; set; }
        public DateTime End { get; set; }
        public bool IsBooked { get; set; }
    }

    public enum ExecutionStatus
    {
        Pending,
        InProgress,
        Completed,
        Delayed,
        Failed,
        Cancelled
    }
}

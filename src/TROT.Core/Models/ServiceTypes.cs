namespace TROT.Core.Models
{
    public enum ServiceCategory
    {
        Transportation,
        TaskExecution,
        SkillService,
        TimeManagement,
        Optimization
    }

    public class ServiceProvider
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public List<ServiceCategory> Categories { get; set; } = new();
        public List<string> Skills { get; set; } = new();
        public decimal Rating { get; set; }
        public bool IsAvailable { get; set; }
        public Dictionary<string, decimal> HourlyRates { get; set; } = new();
    }

    public class OptimizationRequest
    {
        public string UserId { get; set; } = string.Empty;
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public List<Task> Tasks { get; set; } = new();
        public List<ServiceCategory> RequiredServices { get; set; } = new();
        public decimal MaxBudget { get; set; }
        public List<string> PreferredProviders { get; set; } = new();
    }

    public class Task
    {
        public string Id { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public TimeSpan EstimatedDuration { get; set; }
        public Priority Priority { get; set; }
        public List<string> RequiredSkills { get; set; } = new();
        public Location Location { get; set; } = new();
        public bool CanBeParallel { get; set; }
    }

    public enum Priority
    {
        Low,
        Medium,
        High,
        Critical
    }

    public class Location
    {
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string Address { get; set; } = string.Empty;
    }
}

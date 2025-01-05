using TROT.Core.Models;
using System.Collections.Concurrent;

namespace TROT.Core.Services
{
    public class OptimizationService : IOptimizationService
    {
        private readonly ConcurrentDictionary<string, OptimizationPlan> _activePlans = new();
        private readonly Random _random = new(); // TODO: Replace with deterministic optimization

        public async Task<OptimizationPlan> CreateOptimizationPlanAsync(OptimizationRequest request)
        {
            // Validate request
            if (request.Tasks.Count == 0) throw new ArgumentException("No tasks provided");
            if (request.StartTime >= request.EndTime) throw new ArgumentException("Invalid time range");

            // Find available providers
            var providers = await FindAvailableProvidersAsync(request.StartTime, request.EndTime, request.RequiredServices);
            if (!providers.Any()) throw new InvalidOperationException("No available providers found");

            var plan = new OptimizationPlan
            {
                Id = Guid.NewGuid().ToString(),
                StartTime = request.StartTime,
                EndTime = request.EndTime,
                Status = ExecutionStatus.Pending
            };

            // Sort tasks by priority and dependencies
            var sortedTasks = SortTasksByPriority(request.Tasks);
            var scheduledTasks = new List<ScheduledTask>();
            var parallelGroups = new Dictionary<string, List<Task>>();

            // Group parallel tasks
            foreach (var task in sortedTasks)
            {
                if (task.CanBeParallel)
                {
                    var group = FindOrCreateParallelGroup(parallelGroups, task);
                    parallelGroups[group].Add(task);
                }
                else
                {
                    // Schedule non-parallel task
                    var provider = FindBestProvider(providers, task);
                    var timeSlot = FindOptimalTimeSlot(provider, task, plan.StartTime, plan.EndTime);
                    
                    scheduledTasks.Add(new ScheduledTask
                    {
                        Task = task,
                        StartTime = timeSlot.Start,
                        EndTime = timeSlot.End,
                        AssignedProviderId = provider.Id,
                        Status = ExecutionStatus.Pending
                    });
                }
            }

            // Schedule parallel tasks
            foreach (var group in parallelGroups)
            {
                var parallelTasks = ScheduleParallelTasks(group.Value, providers, plan.StartTime, plan.EndTime);
                scheduledTasks.AddRange(parallelTasks);
            }

            plan.Tasks = scheduledTasks;
            plan.Providers = providers.Select(p => new AssignedProvider
            {
                Provider = p,
                AssignedCost = CalculateProviderCost(p, scheduledTasks)
            }).ToList();

            plan.TotalCost = plan.Providers.Sum(p => p.AssignedCost);
            _activePlans.TryAdd(plan.Id, plan);

            return plan;
        }

        private string FindOrCreateParallelGroup(Dictionary<string, List<Task>> groups, Task task)
        {
            // Find compatible group based on time constraints and resource requirements
            foreach (var group in groups)
            {
                if (CanAddToGroup(group.Value, task))
                {
                    return group.Key;
                }
            }

            // Create new group
            var groupId = Guid.NewGuid().ToString();
            groups[groupId] = new List<Task>();
            return groupId;
        }

        private bool CanAddToGroup(List<Task> groupTasks, Task newTask)
        {
            // Check if new task can be executed in parallel with existing group tasks
            return groupTasks.All(t => 
                !HasResourceConflict(t, newTask) && 
                !HasLocationConflict(t, newTask));
        }

        private bool HasResourceConflict(Task task1, Task task2)
        {
            // Check if tasks require the same unique resources
            return task1.RequiredSkills.Intersect(task2.RequiredSkills).Any();
        }

        private bool HasLocationConflict(Task task1, Task task2)
        {
            // Check if tasks require presence at different locations
            if (task1.Location == null || task2.Location == null) return false;
            
            var distance = CalculateDistance(task1.Location, task2.Location);
            return distance > 1.0; // 1 km threshold for "same location"
        }

        private double CalculateDistance(Location loc1, Location loc2)
        {
            // Haversine formula for distance calculation
            var R = 6371; // Earth's radius in km
            var dLat = ToRad(loc2.Latitude - loc1.Latitude);
            var dLon = ToRad(loc2.Longitude - loc1.Longitude);
            var a = Math.Sin(dLat/2) * Math.Sin(dLat/2) +
                    Math.Cos(ToRad(loc1.Latitude)) * Math.Cos(ToRad(loc2.Latitude)) *
                    Math.Sin(dLon/2) * Math.Sin(dLon/2);
            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1-a));
            return R * c;
        }

        private double ToRad(double degrees) => degrees * Math.PI / 180;

        private List<Task> SortTasksByPriority(List<Task> tasks)
        {
            return tasks.OrderByDescending(t => t.Priority)
                       .ThenBy(t => t.EstimatedDuration)
                       .ToList();
        }

        private ServiceProvider FindBestProvider(List<ServiceProvider> providers, Task task)
        {
            return providers.OrderByDescending(p => 
                p.Skills.Count(s => task.RequiredSkills.Contains(s)))
                .ThenByDescending(p => p.Rating)
                .ThenBy(p => p.HourlyRates.Values.Average())
                .First();
        }

        private TimeSlot FindOptimalTimeSlot(ServiceProvider provider, Task task, DateTime start, DateTime end)
        {
            // Simple implementation - find first available slot
            // TODO: Implement more sophisticated scheduling algorithm
            return new TimeSlot
            {
                Start = start,
                End = start.Add(task.EstimatedDuration),
                IsBooked = true
            };
        }

        private List<ScheduledTask> ScheduleParallelTasks(List<Task> tasks, List<ServiceProvider> providers, DateTime start, DateTime end)
        {
            var scheduledTasks = new List<ScheduledTask>();
            var availableProviders = new List<ServiceProvider>(providers);

            foreach (var task in tasks)
            {
                var provider = FindBestProvider(availableProviders, task);
                availableProviders.Remove(provider);

                scheduledTasks.Add(new ScheduledTask
                {
                    Task = task,
                    StartTime = start,
                    EndTime = start.Add(task.EstimatedDuration),
                    AssignedProviderId = provider.Id,
                    Status = ExecutionStatus.Pending
                });
            }

            return scheduledTasks;
        }

        private decimal CalculateProviderCost(ServiceProvider provider, List<ScheduledTask> tasks)
        {
            var providerTasks = tasks.Where(t => t.AssignedProviderId == provider.Id);
            return providerTasks.Sum(t => 
                provider.HourlyRates.GetValueOrDefault(t.Task.RequiredSkills.FirstOrDefault(), 0) * 
                (decimal)t.Task.EstimatedDuration.TotalHours);
        }

        public async Task<List<ServiceProvider>> FindAvailableProvidersAsync(DateTime startTime, DateTime endTime, List<ServiceCategory> categories)
        {
            // TODO: Implement actual provider search
            return new List<ServiceProvider>();
        }

        public async Task<decimal> EstimateTotalCostAsync(OptimizationPlan plan)
        {
            return plan.TotalCost;
        }

        public async Task<bool> ValidateScheduleAsync(OptimizationPlan plan)
        {
            // Check for time conflicts
            var sortedTasks = plan.Tasks.OrderBy(t => t.StartTime).ToList();
            for (int i = 0; i < sortedTasks.Count - 1; i++)
            {
                if (sortedTasks[i].EndTime > sortedTasks[i + 1].StartTime)
                {
                    return false;
                }
            }

            // Check provider availability
            var providerSchedules = new Dictionary<string, List<TimeSlot>>();
            foreach (var task in plan.Tasks)
            {
                if (!providerSchedules.ContainsKey(task.AssignedProviderId))
                {
                    providerSchedules[task.AssignedProviderId] = new List<TimeSlot>();
                }

                var schedule = providerSchedules[task.AssignedProviderId];
                if (schedule.Any(s => s.Start < task.EndTime && task.StartTime < s.End))
                {
                    return false;
                }

                schedule.Add(new TimeSlot 
                { 
                    Start = task.StartTime, 
                    End = task.EndTime, 
                    IsBooked = true 
                });
            }

            return true;
        }

        public async Task<OptimizationPlan> UpdatePlanAsync(string planId, OptimizationRequest updatedRequest)
        {
            if (!_activePlans.TryGetValue(planId, out var existingPlan))
            {
                throw new KeyNotFoundException("Plan not found");
            }

            // Create new plan with updated requirements
            var newPlan = await CreateOptimizationPlanAsync(updatedRequest);
            
            // Update existing plan
            existingPlan.Tasks = newPlan.Tasks;
            existingPlan.Providers = newPlan.Providers;
            existingPlan.TotalCost = newPlan.TotalCost;
            existingPlan.Status = ExecutionStatus.Pending;

            return existingPlan;
        }

        public async Task<ExecutionStatus> GetPlanStatusAsync(string planId)
        {
            if (!_activePlans.TryGetValue(planId, out var plan))
            {
                throw new KeyNotFoundException("Plan not found");
            }

            return plan.Status;
        }
    }
}

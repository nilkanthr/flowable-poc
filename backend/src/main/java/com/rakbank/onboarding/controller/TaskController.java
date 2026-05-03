package com.rakbank.onboarding.controller;

import com.rakbank.onboarding.model.TaskReviewRequest;
import com.rakbank.onboarding.service.OnboardingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
@Tag(name = "Human Task Management", description = "Manage manual review tasks")
public class TaskController {

    @Autowired private OnboardingService onboardingService;

    @GetMapping("/pending")
    @Operation(summary = "Get all pending manual review tasks")
    public ResponseEntity<List<Map<String, Object>>> getPendingTasks() {
        return ResponseEntity.ok(onboardingService.getPendingTasks());
    }

    @PostMapping("/complete")
    @Operation(summary = "Complete a manual review task")
    public ResponseEntity<Map<String, String>> completeTask(@RequestBody TaskReviewRequest request) {
        onboardingService.completeReview(request);
        return ResponseEntity.ok(Map.of("message", "Task completed", "decision", request.getReviewDecision()));
    }
}

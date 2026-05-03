package com.rakbank.onboarding.controller;

import com.rakbank.onboarding.model.*;
import com.rakbank.onboarding.service.OnboardingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/onboarding")
@Tag(name = "Account Onboarding", description = "RAKBANK Business Account Onboarding APIs")
public class OnboardingController {

    @Autowired private OnboardingService onboardingService;

    @PostMapping("/start")
    @Operation(summary = "Start new account onboarding process")
    public ResponseEntity<Map<String, String>> startOnboarding(@RequestBody OnboardingRequest request) {
        String processId = onboardingService.startOnboarding(request);
        return ResponseEntity.ok(Map.of(
            "processInstanceId", processId,
            "message", "Onboarding process started successfully",
            "trackUrl", "/api/onboarding/" + processId
        ));
    }

    @GetMapping
    @Operation(summary = "List all applications")
    public ResponseEntity<List<ApplicationSummary>> listAll() {
        return ResponseEntity.ok(onboardingService.listAll());
    }

    @GetMapping("/{processInstanceId}")
    @Operation(summary = "Get application detail and process status")
    public ResponseEntity<ApplicationSummary> getApplication(@PathVariable String processInstanceId) {
        ApplicationSummary summary = onboardingService.getApplication(processInstanceId);
        if (summary == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/{processInstanceId}/variables")
    @Operation(summary = "Get all process variables")
    public ResponseEntity<Map<String, Object>> getVariables(@PathVariable String processInstanceId) {
        return ResponseEntity.ok(onboardingService.getVariables(processInstanceId));
    }

    @GetMapping("/metrics")
    @Operation(summary = "Get processing metrics")
    public ResponseEntity<Map<String, Object>> getMetrics() {
        return ResponseEntity.ok(onboardingService.getMetrics());
    }

    @GetMapping("/process-definition")
    @Operation(summary = "Get current deployed process definition info")
    public ResponseEntity<Map<String, Object>> getProcessDefinition() {
        return ResponseEntity.ok(onboardingService.getProcessDefinitionInfo());
    }
}

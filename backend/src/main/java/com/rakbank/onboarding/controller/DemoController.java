package com.rakbank.onboarding.controller;

import com.rakbank.onboarding.model.OnboardingRequest;
import com.rakbank.onboarding.service.OnboardingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/demo")
@Tag(name = "CTO Demo", description = "Pre-built demo scenarios for Flowable capabilities showcase")
public class DemoController {

    @Autowired private OnboardingService onboardingService;

    @PostMapping("/scenario/happy-path")
    @Operation(summary = "Scenario 1: Happy Path — Auto Approve")
    public ResponseEntity<Map<String, Object>> happyPath() {
        String pid = onboardingService.startOnboarding(buildRequest(
            "Al Noor Trading LLC", "Khalid Al Mansouri", "HAPPY_PATH", "MAINLAND", "GENERAL_TRADING"));
        return ResponseEntity.ok(Map.of(
            "processInstanceId", pid, "scenario", "HAPPY_PATH",
            "description", "Low-risk application. Parallel screening: Fircosoft PASS, AECB 760, ThreatMetrix LOW. Expected outcome: AUTO_APPROVE",
            "expectedDurationSec", "~8-10 seconds"));
    }

    @PostMapping("/scenario/sanctions-hit")
    @Operation(summary = "Scenario 2: Sanctions Hit — Auto Reject")
    public ResponseEntity<Map<String, Object>> sanctionsHit() {
        String pid = onboardingService.startOnboarding(buildRequest(
            "Global Exchange Corp", "Ahmad Rasheed", "SANCTIONS_HIT", "FREEZONE", "MONEY_EXCHANGE"));
        return ResponseEntity.ok(Map.of(
            "processInstanceId", pid, "scenario", "SANCTIONS_HIT",
            "description", "Fircosoft flags exact match on OFAC SDN List. Decision Engine: AUTO_REJECT (Rule R-003).",
            "expectedDurationSec", "~5 seconds"));
    }

    @PostMapping("/scenario/manual-review")
    @Operation(summary = "Scenario 3: Manual Review — PEP Detected")
    public ResponseEntity<Map<String, Object>> manualReview() {
        String pid = onboardingService.startOnboarding(buildRequest(
            "Prime Capital Holdings", "Mohammed Al Rashidi", "HIGH_RISK", "OFFSHORE", "FINANCIAL_SERVICES"));
        return ResponseEntity.ok(Map.of(
            "processInstanceId", pid, "scenario", "HIGH_RISK",
            "description", "Fircosoft flags PEP Level-2. Risk band HIGH. Escalates to Task Inbox for RM review.",
            "expectedDurationSec", "~8 seconds to reach Manual Review task"));
    }

    @PostMapping("/scenario/credit-fail")
    @Operation(summary = "Scenario 4: AECB Credit Fail — Auto Reject")
    public ResponseEntity<Map<String, Object>> creditFail() {
        String pid = onboardingService.startOnboarding(buildRequest(
            "Horizon Ventures LLC", "Fatima Al Zaabi", "CREDIT_FAIL", "MAINLAND", "RETAIL"));
        return ResponseEntity.ok(Map.of(
            "processInstanceId", pid, "scenario", "CREDIT_FAIL",
            "description", "AECB returns active defaults of AED 2.4M. Decision Engine: AUTO_REJECT.",
            "expectedDurationSec", "~8 seconds"));
    }

    @PostMapping("/scenario/bulk")
    @Operation(summary = "Scenario 5: Bulk Launch — 5 Concurrent Applications")
    public ResponseEntity<Map<String, Object>> bulkLaunch() {
        String[] scenarios   = {"HAPPY_PATH", "HAPPY_PATH", "HIGH_RISK", "SANCTIONS_HIT", "HAPPY_PATH"};
        String[] companies   = {"RAK Logistics LLC", "Dubai Tech FZ LLC", "Gulf Investment Ltd",
                                "Crescent Trading LLC", "Abu Dhabi Foods LLC"};
        String[] signatories = {"Tariq Bin Zayed", "Priya Mehta", "Omar Abdullah",
                                "Rashid Al Hamdan", "Suresh Kumar"};
        List<String> pids = new java.util.ArrayList<>();
        for (int i = 0; i < 5; i++) {
            pids.add(onboardingService.startOnboarding(
                buildRequest(companies[i], signatories[i], scenarios[i], "MAINLAND", "GENERAL_TRADING")));
        }
        return ResponseEntity.ok(Map.of(
            "processInstanceIds", pids, "scenario", "BULK_CONCURRENT",
            "description", "5 applications launched simultaneously. 15 concurrent external API calls via Flowable async executor.",
            "expectedDurationSec", "~10-12 seconds for all to complete"));
    }

    @GetMapping("/capabilities")
    @Operation(summary = "Flowable vs Newgen iBPS capability comparison")
    public ResponseEntity<Map<String, Object>> capabilities() {
        return ResponseEntity.ok(Map.of(
            "title", "Flowable BPM vs Newgen iBPS",
            "capabilities", List.of(
                cap("BPMN 2.0 Standard Compliance",
                    "Full — ISO standard, portable, tool-agnostic",
                    "Proprietary extensions — vendor lock-in", "flowable"),
                cap("Open Source / Licensing",
                    "Apache 2.0 — zero license cost, full source",
                    "Commercial license — high TCO", "flowable"),
                cap("Hot Process Deployment",
                    "Deploy new version without restart. Running instances continue on old version.",
                    "Typically requires server restart or maintenance window", "flowable"),
                cap("Parallel / Async Processing",
                    "Native async executor with thread pool. Parallel gateways, message events.",
                    "Limited async — primarily sequential", "flowable"),
                cap("Microservice / Embedded",
                    "Embeds as a library in Spring Boot — no separate BPM server",
                    "Requires dedicated iBPS server", "flowable"),
                cap("REST API First",
                    "Full REST API out-of-the-box for every process, task, history operation",
                    "REST requires additional adapter configuration", "flowable"),
                cap("Process Versioning",
                    "Automatic — v1/v2 coexist. Old cases unaffected, new cases on latest.",
                    "Manual version management", "flowable"),
                cap("Developer Experience",
                    "Standard Java/Spring — any developer can contribute. No proprietary IDE.",
                    "Requires Newgen Studio IDE", "flowable"),
                cap("Cloud Native / Containers",
                    "First-class Docker/Kubernetes. Spring Boot Actuator health checks built-in.",
                    "Heavy J2EE footprint", "flowable"),
                cap("Audit & History",
                    "Built-in full audit trail — every variable, task, timer recorded",
                    "Available but requires separate configuration", "both"),
                cap("Human Task Management",
                    "Built-in — candidate groups, SLA timers, escalation, reassignment",
                    "Comprehensive workflow with forms — mature", "both"),
                cap("DMN Decision Tables",
                    "Native DMN 1.2 — business-friendly decision rules alongside BPMN",
                    "Business rules module — separate licensing", "flowable"),
                cap("Process Simulation",
                    "Available in Flowable Enterprise edition",
                    "Built-in simulation", "newgen"),
                cap("Time-to-Change a Process",
                    "Edit BPMN → redeploy in < 30 seconds. No code change for routing changes.",
                    "Requires Newgen Studio, test cycle, iBPS admin deployment", "flowable"),
                cap("Resilience / Fault Tolerance",
                    "Async jobs in DB — restart recovers all in-flight tasks automatically.",
                    "Resilience depends on JBoss/WebSphere clustering", "flowable")
            )
        ));
    }

    private Map<String, Object> cap(String feature, String flowable, String newgen, String winner) {
        return Map.of("feature", feature, "flowable", flowable, "newgen", newgen, "winner", winner);
    }

    private OnboardingRequest buildRequest(String company, String signatory,
                                            String scenario, String licenseType, String activity) {
        OnboardingRequest r = new OnboardingRequest();
        r.setCompanyName(company);
        r.setTradeNameEn(company);
        r.setSignatoryName(signatory);
        r.setLicenseNumber("DED-" + (int)(Math.random() * 900000 + 100000));
        r.setLicenseType(licenseType);
        r.setLicenseAuthority("DED");
        r.setBusinessActivity(activity);
        r.setAnnualTurnover("AED 5,000,000 - 25,000,000");
        r.setSignatoryEmirates("784-" + (int)(Math.random() * 9000000 + 1000000) + "-" +
                               (int)(Math.random() * 9000000 + 1000000) + "-1");
        r.setSignatoryPassport("A" + (int)(Math.random() * 9000000 + 1000000));
        r.setSignatoryNationality("UAE");
        r.setSignatoryUaePassId("UAE-" + (int)(Math.random() * 9000000 + 1000000));
        r.setEmail(company.toLowerCase().replaceAll("[^a-z]", "") + "@example.com");
        r.setPhone("+971-50-" + (int)(Math.random() * 9000000 + 1000000));
        r.setAddress("Office 1204, Business Bay, Dubai");
        r.setEmirate("Dubai");
        r.setScenario(scenario);
        return r;
    }
}

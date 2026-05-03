package com.rakbank.onboarding.service;

import com.rakbank.onboarding.model.*;
import org.flowable.engine.*;
import org.flowable.engine.history.HistoricActivityInstance;
import org.flowable.engine.history.HistoricProcessInstance;
import org.flowable.engine.runtime.ProcessInstance;
import org.flowable.task.api.Task;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class OnboardingService {

    private static final Logger log = LoggerFactory.getLogger(OnboardingService.class);

    private static final DateTimeFormatter FMT =
        DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss").withZone(ZoneId.of("Asia/Dubai"));

    @Autowired private RuntimeService runtimeService;
    @Autowired private TaskService taskService;
    @Autowired private HistoryService historyService;
    @Autowired private RepositoryService repositoryService;

    // ─── Start Process ──────────────────────────────────────────────────────

    public String startOnboarding(OnboardingRequest req) {
        Map<String, Object> vars = new HashMap<>();
        vars.put("companyName",          req.getCompanyName());
        vars.put("tradeNameEn",          req.getTradeNameEn());
        vars.put("licenseNumber",        req.getLicenseNumber());
        vars.put("licenseType",          req.getLicenseType());
        vars.put("businessActivity",     req.getBusinessActivity());
        vars.put("annualTurnover",       req.getAnnualTurnover());
        vars.put("signatoryName",        req.getSignatoryName());
        vars.put("signatoryEmirates",    req.getSignatoryEmirates());
        vars.put("signatoryPassport",    req.getSignatoryPassport());
        vars.put("signatoryNationality", req.getSignatoryNationality());
        vars.put("signatoryUaePassId",   req.getSignatoryUaePassId());
        vars.put("email",                req.getEmail());
        vars.put("phone",                req.getPhone());
        vars.put("address",              req.getAddress());
        vars.put("emirate",              req.getEmirate());
        vars.put("scenario",             req.getScenario() != null ? req.getScenario() : "HAPPY_PATH");

        String businessKey = "APP-" + System.currentTimeMillis();
        ProcessInstance pi = runtimeService.startProcessInstanceByKey("accountOnboarding", businessKey, vars);
        log.info("Started process {} with business key {}", pi.getId(), businessKey);
        return pi.getId();
    }

    // ─── List All ───────────────────────────────────────────────────────────

    public List<ApplicationSummary> listAll() {
        List<ApplicationSummary> result = new ArrayList<>();

        runtimeService.createProcessInstanceQuery()
            .processDefinitionKey("accountOnboarding").list()
            .forEach(pi -> result.add(buildSummary(pi.getId())));

        historyService.createHistoricProcessInstanceQuery()
            .processDefinitionKey("accountOnboarding").finished().list()
            .forEach(hpi -> result.add(buildHistoricSummary(hpi)));

        result.sort(Comparator.comparing(ApplicationSummary::getStartTime,
            Comparator.nullsLast(Comparator.reverseOrder())));
        return result;
    }

    // ─── Get Single ─────────────────────────────────────────────────────────

    public ApplicationSummary getApplication(String processInstanceId) {
        ProcessInstance pi = runtimeService.createProcessInstanceQuery()
            .processInstanceId(processInstanceId).singleResult();
        if (pi != null) return buildSummary(processInstanceId);

        HistoricProcessInstance hpi = historyService.createHistoricProcessInstanceQuery()
            .processInstanceId(processInstanceId).singleResult();
        if (hpi != null) return buildHistoricSummary(hpi);

        return null;
    }

    // ─── Complete Review ────────────────────────────────────────────────────

    public void completeReview(TaskReviewRequest request) {
        Task task = taskService.createTaskQuery().taskId(request.getTaskId()).singleResult();
        if (task == null) throw new RuntimeException("Task not found: " + request.getTaskId());

        Map<String, Object> vars = new HashMap<>();
        vars.put("reviewDecision", request.getReviewDecision());
        vars.put("reviewedBy",     request.getReviewedBy());
        vars.put("reviewComments", request.getComments());
        taskService.complete(task.getId(), vars);
        log.info("Task {} completed — decision: {}", task.getId(), request.getReviewDecision());
    }

    // ─── Pending Tasks ──────────────────────────────────────────────────────

    public List<Map<String, Object>> getPendingTasks() {
        return taskService.createTaskQuery()
            .processDefinitionKey("accountOnboarding")
            .taskName("Manual Review")
            .list()
            .stream()
            .map(task -> {
                Map<String, Object> t = new LinkedHashMap<>();
                t.put("taskId",    task.getId());
                t.put("taskName",  task.getName());
                t.put("processId", task.getProcessInstanceId());
                t.put("created",   task.getCreateTime() != null
                    ? FMT.format(task.getCreateTime().toInstant()) : null);

                Map<String, Object> vars = runtimeService.getVariables(task.getProcessInstanceId());
                t.put("companyName",      vars.get("companyName"));
                t.put("riskBand",         vars.get("riskBand"));
                t.put("decision",         vars.get("decision"));
                t.put("riskScore",        vars.get("riskScore"));
                t.put("fircosoftStatus",  vars.get("fircosoftStatus"));
                t.put("aecbStatus",       vars.get("aecbStatus"));
                return t;
            })
            .collect(Collectors.toList());
    }

    // ─── Variables ──────────────────────────────────────────────────────────

    public Map<String, Object> getVariables(String processInstanceId) {
        try {
            return runtimeService.getVariables(processInstanceId);
        } catch (Exception e) {
            Map<String, Object> vars = new LinkedHashMap<>();
            historyService.createHistoricVariableInstanceQuery()
                .processInstanceId(processInstanceId).list()
                .forEach(v -> vars.put(v.getVariableName(), v.getValue()));
            return vars;
        }
    }

    // ─── Metrics ────────────────────────────────────────────────────────────

    public Map<String, Object> getMetrics() {
        long running   = runtimeService.createProcessInstanceQuery()
            .processDefinitionKey("accountOnboarding").count();
        long completed = historyService.createHistoricProcessInstanceQuery()
            .processDefinitionKey("accountOnboarding").finished().count();
        long pending   = taskService.createTaskQuery()
            .processDefinitionKey("accountOnboarding").taskName("Manual Review").count();

        List<HistoricProcessInstance> finishedList = historyService.createHistoricProcessInstanceQuery()
            .processDefinitionKey("accountOnboarding").finished().list();
        OptionalDouble avg = finishedList.stream()
            .filter(p -> p.getDurationInMillis() != null)
            .mapToLong(HistoricProcessInstance::getDurationInMillis).average();

        Map<String, Object> m = new LinkedHashMap<>();
        m.put("totalApplications",    running + completed);
        m.put("running",              running);
        m.put("completed",            completed);
        m.put("pendingManualReview",  pending);
        m.put("avgProcessingTimeMs",  avg.isPresent() ? (long) avg.getAsDouble() : 0);
        m.put("avgProcessingTimeSec", avg.isPresent() ? (long) (avg.getAsDouble() / 1000) : 0);
        return m;
    }

    // ─── Process Definition ─────────────────────────────────────────────────

    public Map<String, Object> getProcessDefinitionInfo() {
        return repositoryService.createProcessDefinitionQuery()
            .processDefinitionKey("accountOnboarding").latestVersion().list()
            .stream()
            .map(pd -> {
                Map<String, Object> info = new LinkedHashMap<>();
                info.put("id",           pd.getId());
                info.put("name",         pd.getName());
                info.put("version",      pd.getVersion());
                info.put("deploymentId", pd.getDeploymentId());
                info.put("resourceName", pd.getResourceName());
                return info;
            })
            .findFirst()
            .orElseGet(() -> { Map<String, Object> e = new LinkedHashMap<>(); e.put("error","No process definition found"); return e; });
    }

    // ─── Helpers ────────────────────────────────────────────────────────────

    private ApplicationSummary buildSummary(String processInstanceId) {
        Map<String, Object> vars = getVariables(processInstanceId);
        List<StepDetail> steps   = buildStepDetails(processInstanceId);

        String currentStep = runtimeService.createActivityInstanceQuery()
            .processInstanceId(processInstanceId).unfinished().list()
            .stream().map(ai -> ai.getActivityName())
            .filter(Objects::nonNull).findFirst().orElse("Processing...");

        HistoricProcessInstance hpi = historyService.createHistoricProcessInstanceQuery()
            .processInstanceId(processInstanceId).singleResult();

        return ApplicationSummary.builder()
            .applicationId(processInstanceId)
            .businessKey(hpi != null ? hpi.getBusinessKey() : "")
            .companyName((String) vars.getOrDefault("companyName", "Unknown"))
            .status("RUNNING")
            .currentStep(currentStep)
            .decision((String) vars.get("decision"))
            .startTime(hpi != null && hpi.getStartTime() != null
                ? FMT.format(hpi.getStartTime().toInstant()) : null)
            .endTime(null)
            .steps(steps)
            .variables(sanitize(vars))
            .build();
    }

    private ApplicationSummary buildHistoricSummary(HistoricProcessInstance hpi) {
        Map<String, Object> vars = getVariables(hpi.getId());
        List<StepDetail> steps   = buildStepDetails(hpi.getId());

        String notif = (String) vars.get("notificationSent");
        String status = "WELCOME".equals(notif) ? "APPROVED"
                      : "REJECTION".equals(notif) ? "REJECTED" : "COMPLETED";

        return ApplicationSummary.builder()
            .applicationId(hpi.getId())
            .businessKey(hpi.getBusinessKey())
            .companyName((String) vars.getOrDefault("companyName", "Unknown"))
            .status(status)
            .currentStep("Completed")
            .decision((String) vars.get("decision"))
            .startTime(hpi.getStartTime() != null ? FMT.format(hpi.getStartTime().toInstant()) : null)
            .endTime(hpi.getEndTime()   != null ? FMT.format(hpi.getEndTime().toInstant())   : null)
            .steps(steps)
            .variables(sanitize(vars))
            .build();
    }

    private List<StepDetail> buildStepDetails(String processInstanceId) {
        List<String> relevantTypes = List.of("serviceTask", "userTask", "parallelGateway", "exclusiveGateway");
        return historyService.createHistoricActivityInstanceQuery()
            .processInstanceId(processInstanceId)
            .orderByHistoricActivityInstanceStartTime().asc().list()
            .stream()
            .filter(a -> relevantTypes.contains(a.getActivityType()))
            .map(a -> StepDetail.builder()
                .id(a.getActivityId())
                .name(a.getActivityName())
                .status(a.getEndTime() != null ? "COMPLETED" : "IN_PROGRESS")
                .startTime(a.getStartTime() != null ? FMT.format(a.getStartTime().toInstant()) : null)
                .endTime(a.getEndTime()   != null ? FMT.format(a.getEndTime().toInstant())   : null)
                .durationMs(a.getDurationInMillis())
                .build())
            .collect(Collectors.toList());
    }

    private Map<String, Object> sanitize(Map<String, Object> vars) {
        Map<String, Object> clean = new LinkedHashMap<>();
        List.of("companyName","licenseType","businessActivity","decision","decisionRationale",
                "riskScore","riskBand","fircosoftStatus","aecbStatus","threatMatrixStatus",
                "uaePassStatus","accountNumber","iban","notificationSent","reviewedBy",
                "reviewComments","efrReference","scenario")
            .forEach(k -> { if (vars.containsKey(k)) clean.put(k, vars.get(k)); });
        return clean;
    }
}

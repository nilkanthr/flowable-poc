package com.rakbank.onboarding.model;

import java.util.List;
import java.util.Map;

public class ApplicationSummary {
    private String applicationId;
    private String businessKey;
    private String companyName;
    private String status;
    private String currentStep;
    private String decision;
    private String startTime;
    private String endTime;
    private List<StepDetail> steps;
    private Map<String, Object> variables;

    public ApplicationSummary() {}

    public String getApplicationId()          { return applicationId; }
    public String getBusinessKey()            { return businessKey; }
    public String getCompanyName()            { return companyName; }
    public String getStatus()                 { return status; }
    public String getCurrentStep()            { return currentStep; }
    public String getDecision()               { return decision; }
    public String getStartTime()              { return startTime; }
    public String getEndTime()                { return endTime; }
    public List<StepDetail> getSteps()        { return steps; }
    public Map<String, Object> getVariables() { return variables; }

    public void setApplicationId(String v)          { this.applicationId = v; }
    public void setBusinessKey(String v)            { this.businessKey = v; }
    public void setCompanyName(String v)            { this.companyName = v; }
    public void setStatus(String v)                 { this.status = v; }
    public void setCurrentStep(String v)            { this.currentStep = v; }
    public void setDecision(String v)               { this.decision = v; }
    public void setStartTime(String v)              { this.startTime = v; }
    public void setEndTime(String v)                { this.endTime = v; }
    public void setSteps(List<StepDetail> v)        { this.steps = v; }
    public void setVariables(Map<String, Object> v) { this.variables = v; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final ApplicationSummary a = new ApplicationSummary();
        public Builder applicationId(String v)          { a.applicationId = v; return this; }
        public Builder businessKey(String v)            { a.businessKey = v;   return this; }
        public Builder companyName(String v)            { a.companyName = v;   return this; }
        public Builder status(String v)                 { a.status = v;        return this; }
        public Builder currentStep(String v)            { a.currentStep = v;   return this; }
        public Builder decision(String v)               { a.decision = v;      return this; }
        public Builder startTime(String v)              { a.startTime = v;     return this; }
        public Builder endTime(String v)                { a.endTime = v;       return this; }
        public Builder steps(List<StepDetail> v)        { a.steps = v;         return this; }
        public Builder variables(Map<String, Object> v) { a.variables = v;     return this; }
        public ApplicationSummary build()               { return a; }
    }
}

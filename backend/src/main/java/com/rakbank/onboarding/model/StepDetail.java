package com.rakbank.onboarding.model;

public class StepDetail {
    private String id;
    private String name;
    private String status;
    private String startTime;
    private String endTime;
    private Long durationMs;
    private String result;
    private String details;

    public StepDetail() {}

    public String getId()        { return id; }
    public String getName()      { return name; }
    public String getStatus()    { return status; }
    public String getStartTime() { return startTime; }
    public String getEndTime()   { return endTime; }
    public Long getDurationMs()  { return durationMs; }
    public String getResult()    { return result; }
    public String getDetails()   { return details; }

    public void setId(String v)        { this.id = v; }
    public void setName(String v)      { this.name = v; }
    public void setStatus(String v)    { this.status = v; }
    public void setStartTime(String v) { this.startTime = v; }
    public void setEndTime(String v)   { this.endTime = v; }
    public void setDurationMs(Long v)  { this.durationMs = v; }
    public void setResult(String v)    { this.result = v; }
    public void setDetails(String v)   { this.details = v; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final StepDetail s = new StepDetail();
        public Builder id(String v)        { s.id = v;        return this; }
        public Builder name(String v)      { s.name = v;      return this; }
        public Builder status(String v)    { s.status = v;    return this; }
        public Builder startTime(String v) { s.startTime = v; return this; }
        public Builder endTime(String v)   { s.endTime = v;   return this; }
        public Builder durationMs(Long v)  { s.durationMs = v;return this; }
        public Builder result(String v)    { s.result = v;    return this; }
        public Builder details(String v)   { s.details = v;   return this; }
        public StepDetail build()          { return s; }
    }
}

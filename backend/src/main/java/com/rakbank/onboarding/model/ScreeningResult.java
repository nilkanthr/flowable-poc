package com.rakbank.onboarding.model;

public class ScreeningResult {
    private String service;
    private String status;
    private String code;
    private String message;
    private double score;
    private long durationMs;

    public ScreeningResult() {}

    public String getService()  { return service; }
    public String getStatus()   { return status; }
    public String getCode()     { return code; }
    public String getMessage()  { return message; }
    public double getScore()    { return score; }
    public long getDurationMs() { return durationMs; }

    public void setService(String v)  { this.service = v; }
    public void setStatus(String v)   { this.status = v; }
    public void setCode(String v)     { this.code = v; }
    public void setMessage(String v)  { this.message = v; }
    public void setScore(double v)    { this.score = v; }
    public void setDurationMs(long v) { this.durationMs = v; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final ScreeningResult r = new ScreeningResult();
        public Builder service(String v)  { r.service = v;    return this; }
        public Builder status(String v)   { r.status = v;     return this; }
        public Builder code(String v)     { r.code = v;       return this; }
        public Builder message(String v)  { r.message = v;    return this; }
        public Builder score(double v)    { r.score = v;      return this; }
        public Builder durationMs(long v) { r.durationMs = v; return this; }
        public ScreeningResult build()    { return r; }
    }
}

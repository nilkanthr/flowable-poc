package com.rakbank.onboarding.model;

public class TaskReviewRequest {
    private String taskId;
    private String reviewDecision;
    private String reviewedBy;
    private String comments;

    public String getTaskId()         { return taskId; }
    public String getReviewDecision() { return reviewDecision; }
    public String getReviewedBy()     { return reviewedBy; }
    public String getComments()       { return comments; }

    public void setTaskId(String v)         { this.taskId = v; }
    public void setReviewDecision(String v) { this.reviewDecision = v; }
    public void setReviewedBy(String v)     { this.reviewedBy = v; }
    public void setComments(String v)       { this.comments = v; }
}

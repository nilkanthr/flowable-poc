package com.rakbank.onboarding.service.stub;

import com.rakbank.onboarding.model.ScreeningResult;
import org.springframework.stereotype.Service;

/**
 * Simulates RAKBANK's rules-based decision engine.
 * In production: integrates with Drools, IBM ODM, or similar.
 */
@Service
public class DecisionEngineStub {

    public String decide(ScreeningResult riskResult, String fircosoftStatus,
                          String aecbStatus, String scenario) {

        // Rule 1: Any FAIL on Fircosoft = Auto Reject (hard stop — no exceptions)
        if ("FAIL".equals(fircosoftStatus)) {
            return "AUTO_REJECT";
        }

        // Rule 2: Critical risk score = Auto Reject
        if (riskResult.getScore() >= 0.90) {
            return "AUTO_REJECT";
        }

        // Rule 3: AECB hard fail = Auto Reject
        if ("FAIL".equals(aecbStatus)) {
            return "AUTO_REJECT";
        }

        // Rule 4: Medium/High risk = Manual Review
        if (riskResult.getScore() >= 0.40 || "REVIEW".equals(fircosoftStatus)
                || "REVIEW".equals(aecbStatus)) {
            return "MANUAL_REVIEW";
        }

        // Rule 5: Low risk, all clear = Auto Approve
        return "AUTO_APPROVE";
    }

    public String describeDecision(String decision) {
        return switch (decision) {
            case "AUTO_APPROVE"   -> "All checks passed. Low risk profile. Auto-approved per policy Rule R-001.";
            case "MANUAL_REVIEW"  -> "Risk indicators present. Escalated to Relationship Manager per policy Rule R-002.";
            case "AUTO_REJECT"    -> "Hard-stop rule triggered. Application rejected per policy Rule R-003.";
            default               -> "Decision pending.";
        };
    }
}

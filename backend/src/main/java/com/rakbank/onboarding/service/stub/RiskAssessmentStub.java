package com.rakbank.onboarding.service.stub;

import com.rakbank.onboarding.model.ScreeningResult;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RiskAssessmentStub {

    @Value("${demo.risk-delay-ms:800}")
    private long delayMs;

    /**
     * Aggregates all screening results into a composite risk score.
     * Weights: Fircosoft 40%, AECB 30%, ThreatMatrix 20%, UAE Pass 10%
     */
    public ScreeningResult assess(List<ScreeningResult> screeningResults, String businessActivity,
                                   String annualTurnover, String scenario) {
        long start = System.currentTimeMillis();
        simulateDelay(delayMs);

        double riskScore = 0.0;
        StringBuilder breakdown = new StringBuilder();

        for (ScreeningResult r : screeningResults) {
            double weight = weightFor(r.getService());
            double contribution = scoreFor(r) * weight;
            riskScore += contribution;
            breakdown.append(r.getService()).append(": ").append(r.getStatus())
                     .append(" (").append(String.format("%.1f", contribution)).append(") | ");
        }

        // Business activity risk factor
        riskScore += businessActivityRisk(businessActivity);

        String riskBand;
        String status;
        if (riskScore >= 0.7) {
            riskBand = "HIGH";
            status = "REVIEW";
        } else if (riskScore >= 0.4) {
            riskBand = "MEDIUM";
            status = "REVIEW";
        } else {
            riskBand = "LOW";
            status = "PASS";
        }

        // Scenario overrides
        if ("HIGH_RISK".equals(scenario)) { riskBand = "HIGH"; status = "REVIEW"; riskScore = 0.75; }
        if ("SANCTIONS_HIT".equals(scenario)) { riskBand = "CRITICAL"; status = "FAIL"; riskScore = 0.99; }
        if ("CREDIT_FAIL".equals(scenario)) { riskBand = "HIGH"; status = "FAIL"; riskScore = 0.82; }

        return ScreeningResult.builder()
            .service("RISK_ASSESSMENT")
            .status(status)
            .code("RISK_" + riskBand)
            .message(String.format("Composite risk score: %.2f | Band: %s | %s", riskScore, riskBand, breakdown))
            .score(riskScore)
            .durationMs(System.currentTimeMillis() - start)
            .build();
    }

    private double weightFor(String service) {
        return switch (service) {
            case "FIRCOSOFT"    -> 0.40;
            case "AECB"         -> 0.30;
            case "THREATMETRIX" -> 0.20;
            case "UAE_PASS"     -> 0.10;
            default             -> 0.0;
        };
    }

    private double scoreFor(ScreeningResult r) {
        return switch (r.getStatus()) {
            case "FAIL"   -> 1.0;
            case "REVIEW" -> 0.5;
            default       -> r.getScore() < 1 ? r.getScore() : 0.0;
        };
    }

    private double businessActivityRisk(String activity) {
        if (activity == null) return 0.0;
        return switch (activity.toUpperCase()) {
            case "MONEY_EXCHANGE", "CRYPTO", "REAL_ESTATE" -> 0.15;
            case "FINANCIAL_SERVICES", "JEWELLERY"         -> 0.10;
            default                                         -> 0.0;
        };
    }

    private void simulateDelay(long ms) {
        try { Thread.sleep(ms); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
    }
}

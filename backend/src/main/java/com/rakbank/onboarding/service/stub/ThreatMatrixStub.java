package com.rakbank.onboarding.service.stub;

import com.rakbank.onboarding.model.ScreeningResult;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class ThreatMatrixStub {

    @Value("${demo.threat-matrix-delay-ms:1800}")
    private long delayMs;

    public ScreeningResult assess(String email, String phone, String ipAddress, String scenario) {
        long start = System.currentTimeMillis();
        simulateDelay(delayMs);

        if ("SANCTIONS_HIT".equals(scenario)) {
            // Even on sanctions hit, ThreatMatrix itself passes
            return buildPass(start);
        }

        if ("HIGH_RISK".equals(scenario)) {
            return ScreeningResult.builder()
                .service("THREATMETRIX")
                .status("REVIEW")
                .code("HIGH_FRAUD_RISK")
                .message("Device/network risk score HIGH — VPN detected, email domain age < 30 days")
                .score(0.72)
                .durationMs(System.currentTimeMillis() - start)
                .build();
        }

        return buildPass(start);
    }

    private ScreeningResult buildPass(long start) {
        double score = Math.random() * 0.15;  // low risk score
        return ScreeningResult.builder()
            .service("THREATMETRIX")
            .status("PASS")
            .code("LOW_FRAUD_RISK")
            .message(String.format("Fraud risk score %.2f — trusted device and network", score))
            .score(score)
            .durationMs(System.currentTimeMillis() - start)
            .build();
    }

    private void simulateDelay(long ms) {
        try { Thread.sleep(ms); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
    }
}

package com.rakbank.onboarding.service.stub;

import com.rakbank.onboarding.model.ScreeningResult;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class AECBStub {

    @Value("${demo.aecb-delay-ms:2200}")
    private long delayMs;

    public ScreeningResult check(String emiratesId, String companyName, String scenario) {
        long start = System.currentTimeMillis();
        simulateDelay(delayMs);

        if ("CREDIT_FAIL".equals(scenario)) {
            return ScreeningResult.builder()
                .service("AECB")
                .status("FAIL")
                .code("ADVERSE_CREDIT")
                .message("Active defaults found — 3 unpaid facilities totalling AED 2.4M")
                .score(320.0)  // low credit score
                .durationMs(System.currentTimeMillis() - start)
                .build();
        }

        if ("HIGH_RISK".equals(scenario)) {
            return ScreeningResult.builder()
                .service("AECB")
                .status("REVIEW")
                .code("CREDIT_REVIEW")
                .message("Credit score marginal — score 610, threshold 650. Manual review required")
                .score(610.0)
                .durationMs(System.currentTimeMillis() - start)
                .build();
        }

        // Happy path — good credit
        double score = 720 + Math.random() * 80;  // 720-800
        return ScreeningResult.builder()
            .service("AECB")
            .status("PASS")
            .code("CREDIT_CLEAR")
            .message(String.format("Credit score %.0f — no adverse findings", score))
            .score(score)
            .durationMs(System.currentTimeMillis() - start)
            .build();
    }

    private void simulateDelay(long ms) {
        try { Thread.sleep(ms); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
    }
}

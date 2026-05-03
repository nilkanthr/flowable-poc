package com.rakbank.onboarding.service.stub;

import com.rakbank.onboarding.model.ScreeningResult;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class UAEPassStub {

    @Value("${demo.uae-pass-delay-ms:1200}")
    private long delayMs;

    public ScreeningResult verify(String emiratesId, String uaePassId, String scenario) {
        long start = System.currentTimeMillis();
        simulateDelay(delayMs);

        // Scenario: SANCTIONS_HIT — UAE Pass still passes (sanctions caught by Fircosoft)
        if ("CREDIT_FAIL".equals(scenario) && emiratesId == null) {
            return ScreeningResult.builder()
                .service("UAE_PASS")
                .status("FAIL")
                .code("UAE_PASS_NOT_FOUND")
                .message("UAE Pass ID not found or expired")
                .score(0.0)
                .durationMs(System.currentTimeMillis() - start)
                .build();
        }

        return ScreeningResult.builder()
            .service("UAE_PASS")
            .status("PASS")
            .code("IDENTITY_VERIFIED")
            .message("Identity verified via UAE Pass — Assurance Level 2")
            .score(1.0)
            .durationMs(System.currentTimeMillis() - start)
            .build();
    }

    private void simulateDelay(long ms) {
        try { Thread.sleep(ms); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
    }
}

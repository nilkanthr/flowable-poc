package com.rakbank.onboarding.service.stub;

import com.rakbank.onboarding.model.ScreeningResult;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class EFRStub {

    @Value("${demo.efr-delay-ms:1500}")
    private long delayMs;

    public ScreeningResult file(String companyName, String licenseNumber) {
        long start = System.currentTimeMillis();
        simulateDelay(delayMs);

        String filingRef = "EFR-UAE-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        return ScreeningResult.builder()
            .service("EFR")
            .status("PASS")
            .code("EFR_FILED")
            .message("Emirates Financial Record submitted. Reference: " + filingRef)
            .score(1.0)
            .durationMs(System.currentTimeMillis() - start)
            .build();
    }

    private void simulateDelay(long ms) {
        try { Thread.sleep(ms); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
    }
}
